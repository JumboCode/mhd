"use client";

import { useRef, useEffect, useMemo } from "react";
import * as d3 from "d3";

export type GraphDataset = {
    label: string;
    data: { x: string | number; y: number }[];
};

type MultiLineGraphProps = {
    datasets: GraphDataset[];
    yAxisLabel: string;
    xAxisLabel: string;
};

export default function MultiLineGraph({
    datasets,
    yAxisLabel,
    xAxisLabel,
}: MultiLineGraphProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const tooltipRef = useRef<d3.Selection<
        HTMLDivElement,
        unknown,
        null,
        undefined
    > | null>(null);

    // Memoize color scale to prevent re-running useEffect unnecessarily
    const colorScale = useMemo(() => d3.scaleOrdinal(d3.schemeCategory10), []);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        if (!svg.node() || !wrapperRef.current) return;

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
                .style("transform", "translate(-50%, -125%)");
        }

        const tooltip = tooltipRef.current;

        if (datasets.length === 0) return;

        const width = 1000;
        const height = 400;
        const margin = { top: 20, right: 20, bottom: 100, left: 60 };

        // Flatten datasets for global min/max axis domains
        const allPoints = datasets.flatMap((d) => d.data);
        if (allPoints.length === 0) return;

        // Convert x values to numbers for scaling
        const xValues = allPoints.map((d) => Number(d.x));

        const x = d3
            .scaleLinear()
            .domain(d3.extent(xValues) as [number, number])
            .range([margin.left, width - margin.right]);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(allPoints, (d) => d.y) || 10])
            .range([height - margin.bottom, margin.top]);

        svg.selectAll("*").remove(); // Clear previous render

        // X-axis
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(
                d3
                    .axisBottom(x)
                    .ticks(
                        // Ensure reasonable number of x-axis ticks
                        Math.min(
                            Math.max(...xValues) - Math.min(...xValues),
                            10,
                        ),
                    )
                    .tickFormat(d3.format("d")),
            )
            .call((g) => g.selectAll(".tick line").remove())
            .call((g) => g.select(".domain").remove());

        // X-axis label
        svg.append("text")
            .attr("x", margin.left + (width - margin.left - margin.right) / 2)
            .attr("y", height - margin.bottom + 40)
            .attr("text-anchor", "middle")
            .attr("fill", "#555")
            .text(xAxisLabel);

        // Y-axis
        const yTicks = y.ticks().filter((t) => Number.isInteger(t));
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(
                d3
                    .axisLeft(y)
                    .tickValues(yTicks)
                    .tickSize(-width + margin.left + margin.right),
            )
            .call((g) => g.selectAll(".tick line").attr("stroke", "#ccc"))
            .call((g) => g.select(".domain").remove())
            .call((g) => g.selectAll(".tick text").attr("fill", "#555"));

        // Y-axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -margin.top - (height - margin.top - margin.bottom) / 2)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .attr("fill", "#555")
            .text(yAxisLabel);

        const lineGen = d3
            .line<{ x: string | number; y: number }>()
            .x((d) => x(Number(d.x)))
            .y((d) => y(d.y));

        datasets.forEach((dataset) => {
            const path = svg
                .append("path")
                .datum(dataset.data)
                .attr("fill", "none")
                .attr("stroke", colorScale(dataset.label))
                .attr("stroke-width", 2)
                .attr("d", lineGen);

            // Animate line drawing with stroke-dasharray/offset trick
            const length = path.node()?.getTotalLength() || 0;
            path.attr("stroke-dasharray", `${length} ${length}`)
                .attr("stroke-dashoffset", length)
                .transition()
                .duration(1500)
                .attr("stroke-dashoffset", 0);
        });

        datasets.forEach((dataset) => {
            // Sanitize label for use in CSS class selector
            const safeLabel = dataset.label.replace(/[^a-zA-Z0-9-_]/g, "-");

            svg.selectAll(`.dot-${safeLabel}`)
                .data(dataset.data)
                .enter()
                .append("circle")
                .attr("class", `dot-${safeLabel}`)
                .attr("cx", (d) => x(Number(d.x)))
                .attr("cy", (d) => y(d.y))
                .attr("r", 4)
                .attr("fill", colorScale(dataset.label))
                .style("cursor", "pointer")
                .attr("tabindex", 0)
                .on("mouseover focus", function (event, d) {
                    d3.select(this).transition().duration(100).attr("r", 6);
                    tooltip
                        .html(String(d.y))
                        .transition()
                        .duration(100)
                        .style("opacity", 1)
                        .style("left", `${x(Number(d.x))}px`)
                        .style("top", `${y(d.y)}px`);
                })
                .on("mouseout blur", function () {
                    d3.select(this).transition().duration(100).attr("r", 4);
                    tooltip.transition().duration(100).style("opacity", 0);
                });

            // Animate points appearing
            svg.selectAll(`.dot-${safeLabel}`)
                .attr("opacity", 0)
                .transition()
                .delay(500) // Stagger point animation after line draw
                .duration(1000)
                .attr("opacity", 1);
        });

        // Legend at bottom
        const legendGroup = svg
            .append("g")
            .attr("class", "legend")
            .attr(
                "transform",
                `translate(${margin.left}, ${height - margin.bottom + 60})`,
            );

        const legendWidth = width - margin.left - margin.right;
        const itemMargin = 10;
        const rowHeight = 20;

        const legendItems = legendGroup
            .selectAll("g.legend-item")
            .data(datasets)
            .enter()
            .append("g")
            .attr("class", "legend-item");

        legendItems
            .append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", (d) => colorScale(d.label));

        legendItems
            .append("text")
            .attr("x", 16)
            .attr("y", 10)
            .text((d) => d.label)
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle");

        // Position legend items, wrap to new line on overflow
        let xOffset = 0;
        let yOffset = 0;
        legendItems.attr("transform", function () {
            const itemWidth =
                (this as SVGGElement).getBBox().width + itemMargin;
            if (xOffset + itemWidth > legendWidth) {
                xOffset = 0;
                yOffset += rowHeight;
            }
            const transform = `translate(${xOffset}, ${yOffset})`;
            xOffset += itemWidth;
            return transform;
        });
    }, [datasets, xAxisLabel, yAxisLabel, colorScale]);

    return (
        <div ref={wrapperRef} style={{ position: "relative" }}>
            <svg ref={svgRef} width={900} height={400}></svg>
        </div>
    );
}
