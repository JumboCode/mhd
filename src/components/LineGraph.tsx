"use client";

import * as d3 from "d3";
import { useEffect, useMemo, useRef } from "react";

export type GraphDataset = {
    label: string;
    data: { x: string | number; y: number }[];
};

type MultiLineGraphProps = {
    datasets: GraphDataset[];
    yAxisLabel: string;
    xAxisLabel: string;
    svgRefCopy: React.RefObject<SVGSVGElement | null>;
};

export default function MultiLineGraph({
    datasets,
    yAxisLabel,
    xAxisLabel,
    svgRefCopy,
}: MultiLineGraphProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const tooltipRef = useRef<d3.Selection<
        HTMLDivElement,
        unknown,
        null,
        undefined
    > | null>(null);
    const isFirstRender = useRef(true);
    const groupsRef = useRef<{
        xAxis?: d3.Selection<SVGGElement, unknown, null, undefined>;
        yAxis?: d3.Selection<SVGGElement, unknown, null, undefined>;
        xAxisLabel?: d3.Selection<SVGTextElement, unknown, null, undefined>;
        yAxisLabel?: d3.Selection<SVGTextElement, unknown, null, undefined>;
        lines?: d3.Selection<SVGGElement, unknown, null, undefined>;
        dots?: d3.Selection<SVGGElement, unknown, null, undefined>;
        legend?: d3.Selection<SVGGElement, unknown, null, undefined>;
    }>({});

    // Memoize color scale to prevent re-running useEffect unnecessarily
    //const colorScale = useMemo(() => d3.scaleOrdinal(d3.schemeCategory10), []);
    const colorScale = useMemo(
        () => d3.scaleOrdinal(d3.schemeCategory10.map((c) => c.toString())),
        [],
    );

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const svgNode = svg.node();
        if (!svgNode || !wrapperRef.current) return;

        // Create tooltip once (outside drawChart to prevent memory leak)
        if (!tooltipRef.current) {
            tooltipRef.current = d3
                .select(wrapperRef.current)
                .append("div")
                .attr("class", "d3-tooltip")
                .style("position", "absolute")
                .style("opacity", 0)
                .style("background", "black")
                .style("color", "white")
                .style("padding", "0.5rem")
                .style("border-radius", "0.375rem")
                .style("font-size", "0.875rem")
                .style("pointer-events", "none")
                .style("transform", "translate(-50%, -125%)")
                .style("z-index", "1000");
        }

        const tooltip = tooltipRef.current;

        if (datasets.length === 0) return;

        const width = 900; // Match actual SVG width
        const height = 400;
        const margin = { top: 20, right: 20, bottom: 100, left: 60 };

        // Flatten datasets for global min/max axis domains
        const allPoints = datasets.flatMap((d) => d.data);
        if (allPoints.length === 0) return;

        // Convert x values to numbers for scaling, filtering out invalid values
        const xValues = allPoints
            .map((d) => {
                const num = Number(d.x);
                return Number.isFinite(num) ? num : null;
            })
            .filter((v): v is number => v !== null);

        if (xValues.length === 0) {
            console.warn("LineGraph: No valid numeric x values found");
            return;
        }

        const xExtent = d3.extent(xValues);
        if (!xExtent[0] || !xExtent[1]) {
            console.warn("LineGraph: Invalid x extent");
            return;
        }

        const x = d3
            .scaleLinear()
            .domain(xExtent as [number, number])
            .range([margin.left, width - margin.right]);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(allPoints, (d) => d.y) || 10])
            .range([height - margin.bottom, margin.top]);

        // Helper to position tooltip correctly
        const positionTooltip = (
            event: MouseEvent | FocusEvent,
            d: { x: string | number; y: number },
        ) => {
            // Recalculate wrapper rect on each event to handle scrolling/resizing
            const wrapperRect = wrapperRef.current?.getBoundingClientRect();
            if (!wrapperRect) return;

            let clientX: number;
            let clientY: number;

            if (event.type === "focus") {
                // For keyboard focus, use the circle's position
                const circle = event.target as SVGCircleElement;
                const circleRect = circle.getBoundingClientRect();
                clientX = circleRect.left + circleRect.width / 2;
                clientY = circleRect.top + circleRect.height / 2;
            } else {
                // For mouse events, use the actual pointer position
                const mouseEvent = event as MouseEvent;
                clientX = mouseEvent.clientX;
                clientY = mouseEvent.clientY;
            }

            // Convert to wrapper-relative coordinates
            const wrapperX = clientX - wrapperRect.left;
            const wrapperY = clientY - wrapperRect.top;

            tooltip
                .text(String(d.y))
                .transition()
                .duration(100)
                .style("opacity", 1)
                .style("left", `${wrapperX}px`)
                .style("top", `${wrapperY}px`);
        };

        // Create stable groups if they don't exist
        if (!groupsRef.current.xAxis) {
            groupsRef.current.xAxis = svg
                .append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${height - margin.bottom})`);
        }

        if (!groupsRef.current.yAxis) {
            groupsRef.current.yAxis = svg
                .append("g")
                .attr("class", "y-axis")
                .attr("transform", `translate(${margin.left},0)`);
        }

        if (!groupsRef.current.xAxisLabel) {
            groupsRef.current.xAxisLabel = svg
                .append("text")
                .attr("class", "x-axis-label")
                .attr("text-anchor", "middle")
                .attr("fill", "#555");
        }

        if (!groupsRef.current.yAxisLabel) {
            groupsRef.current.yAxisLabel = svg
                .append("text")
                .attr("class", "y-axis-label")
                .attr("transform", "rotate(-90)")
                .attr("text-anchor", "middle")
                .attr("fill", "#555");
        }

        if (!groupsRef.current.lines) {
            groupsRef.current.lines = svg.append("g").attr("class", "lines");
        }

        if (!groupsRef.current.dots) {
            groupsRef.current.dots = svg.append("g").attr("class", "dots");
        }

        if (!groupsRef.current.legend) {
            groupsRef.current.legend = svg
                .append("g")
                .attr("class", "legend")
                .attr(
                    "transform",
                    `translate(${margin.left}, ${height - margin.bottom + 60})`,
                );
        }

        // Update X-axis
        groupsRef.current.xAxis.call(
            d3
                .axisBottom(x)
                .ticks(Math.min(width / 100, 10)) // Reasonable tick count based on width
                .tickFormat(d3.format("d")),
        );
        groupsRef.current.xAxis.selectAll(".tick line").remove();
        groupsRef.current.xAxis.select(".domain").remove();

        // Update X-axis label
        groupsRef.current.xAxisLabel
            .attr("x", margin.left + (width - margin.left - margin.right) / 2)
            .attr("y", height - margin.bottom + 40)
            .text(xAxisLabel);

        // Update Y-axis
        const yTicks = y.ticks().filter((t) => Number.isInteger(t));
        groupsRef.current.yAxis.call(
            d3
                .axisLeft(y)
                .tickValues(yTicks)
                .tickSize(-width + margin.left + margin.right),
        );
        groupsRef.current.yAxis.selectAll(".tick line").attr("stroke", "#ccc");
        groupsRef.current.yAxis.select(".domain").remove();
        groupsRef.current.yAxis.selectAll(".tick text").attr("fill", "#555");

        // Update Y-axis label
        groupsRef.current.yAxisLabel
            .attr("x", -margin.top - (height - margin.top - margin.bottom) / 2)
            .attr("y", 15)
            .text(yAxisLabel);

        const lineGen = d3
            .line<{ x: string | number; y: number }>()
            .x((d) => {
                const num = Number(d.x);
                return Number.isFinite(num) ? x(num) : 0;
            })
            .y((d) => y(d.y));

        // Update lines using join pattern
        if (!groupsRef.current.lines) return;
        const lines = groupsRef.current.lines
            .selectAll<SVGPathElement, GraphDataset>("path.line")
            .data(datasets, (d: GraphDataset) => d.label);

        lines.exit().remove();

        const linesEnter = lines
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke-width", 2);

        const linesUpdate = linesEnter.merge(lines);

        linesUpdate
            .attr("stroke", (d) => colorScale(d.label))
            .attr("d", (d) => lineGen(d.data));

        // Animate line drawing only on first render
        if (isFirstRender.current) {
            linesUpdate.each(function () {
                const path = d3.select(this);
                const length = path.node()?.getTotalLength() || 0;
                path.attr("stroke-dasharray", `${length} ${length}`)
                    .attr("stroke-dashoffset", length)
                    .transition()
                    .duration(1500)
                    .attr("stroke-dashoffset", 0);
            });
        }

        // Update dots using join pattern
        if (!groupsRef.current.dots) return;
        const dotsGroups = groupsRef.current.dots
            .selectAll<SVGGElement, GraphDataset>("g.dots-group")
            .data(datasets, (d: GraphDataset) => d.label);

        dotsGroups.exit().remove();

        const dotsGroupsEnter = dotsGroups
            .enter()
            .append("g")
            .attr("class", "dots-group");

        const dotsGroupsUpdate = dotsGroupsEnter.merge(dotsGroups);

        // Update circles within each group
        dotsGroupsUpdate.each(function (dataset) {
            const safeLabel = dataset.label.replace(/[^a-zA-Z0-9-_]/g, "-");
            const group = d3.select(this);
            const circles = group
                .selectAll<
                    SVGCircleElement,
                    { x: string | number; y: number }
                >("circle")
                .data(dataset.data, (d, i) => `${d.x}-${d.y}-${i}`);

            circles.exit().remove();

            const circlesEnter = circles
                .enter()
                .append("circle")
                .attr("r", 4)
                .attr("fill", colorScale(dataset.label))
                .style("cursor", "pointer")
                .attr("tabindex", 0)
                .on("mouseover focus", function (event, d) {
                    d3.select(this).transition().duration(100).attr("r", 6);
                    positionTooltip(event, d);
                })
                .on("mouseout blur", function () {
                    d3.select(this).transition().duration(100).attr("r", 4);
                    tooltip.transition().duration(100).style("opacity", 0);
                });

            const circlesUpdate = circlesEnter.merge(circles);

            circlesUpdate
                .attr("cx", (d) => {
                    const num = Number(d.x);
                    return Number.isFinite(num) ? x(num) : 0;
                })
                .attr("cy", (d) => y(d.y));

            // Animate points appearing only on first render
            if (isFirstRender.current) {
                circlesUpdate
                    .attr("opacity", 0)
                    .transition()
                    .delay(500)
                    .duration(1000)
                    .attr("opacity", 1);
            } else {
                circlesUpdate.attr("opacity", 1);
            }
        });

        // Mark that first render is complete
        if (isFirstRender.current) {
            isFirstRender.current = false;
        }

        // Update legend using join pattern
        const legendWidth = width - margin.left - margin.right;
        const itemMargin = 10;
        const rowHeight = 20;

        const legendItems = groupsRef.current.legend
            .selectAll<SVGGElement, GraphDataset>("g.legend-item")
            .data(datasets, (d) => d.label);

        legendItems.exit().remove();

        const legendItemsEnter = legendItems
            .enter()
            .append("g")
            .attr("class", "legend-item");

        legendItemsEnter.append("rect").attr("width", 12).attr("height", 12);

        legendItemsEnter
            .append("text")
            .attr("x", 16)
            .attr("y", 10)
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle");

        const legendItemsUpdate = legendItemsEnter.merge(legendItems);

        legendItemsUpdate
            .select("rect")
            .attr("fill", (d) => colorScale(d.label));

        legendItemsUpdate.select("text").text((d) => d.label);

        // Position legend items, wrap to new line on overflow
        // Use requestAnimationFrame to ensure layout is complete before measuring
        requestAnimationFrame(() => {
            let xOffset = 0;
            let yOffset = 0;
            legendItemsUpdate.attr("transform", function () {
                const bbox = (this as SVGGElement).getBBox();
                const itemWidth = bbox.width + itemMargin;
                if (xOffset + itemWidth > legendWidth && xOffset > 0) {
                    xOffset = 0;
                    yOffset += rowHeight;
                }
                const transform = `translate(${xOffset}, ${yOffset})`;
                xOffset += itemWidth;
                return transform;
            });
        });
    }, [datasets, xAxisLabel, yAxisLabel, colorScale]);

    return (
        <div ref={wrapperRef} style={{ position: "relative" }}>
            <svg ref={svgRef} width={900} height={400}></svg>
        </div>
    );
}
