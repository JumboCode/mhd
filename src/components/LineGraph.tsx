"use client";

import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
    ChartDataset,
    ChartConfig,
    ChartMargin,
    TooltipFormatter,
} from "./chartTypes";

// Re-export for callers that use the old name
export type { ChartDataset as GraphDataset };

const DEFAULT_MARGIN: ChartMargin = {
    top: 20,
    right: 20,
    bottom: 100,
    left: 60,
};
const DEFAULT_HEIGHT = 400;
const DEFAULT_DOT_RADIUS = 4;
const DEFAULT_STROKE_WIDTH = 2;

type LineGraphProps = {
    datasets: ChartDataset[];
    yAxisLabel: string;
    xAxisLabel: string;
    legendTitle?: string;
    svgRefCopy?: React.RefObject<SVGSVGElement | null>;
    config?: ChartConfig;
    tooltipFormatter?: TooltipFormatter;
};

export default function MultiLineGraph({
    datasets,
    yAxisLabel,
    xAxisLabel,
    legendTitle,
    svgRefCopy,
    config,
    tooltipFormatter,
}: LineGraphProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const tooltipRef = useRef<d3.Selection<
        HTMLDivElement,
        unknown,
        null,
        undefined
    > | null>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    const margin: ChartMargin = { ...DEFAULT_MARGIN, ...config?.margin };
    const height = config?.height ?? DEFAULT_HEIGHT;
    const dotRadius = config?.dotRadius ?? DEFAULT_DOT_RADIUS;
    const strokeWidth = config?.strokeWidth ?? DEFAULT_STROKE_WIDTH;

    const colorScale = useMemo(
        () => d3.scaleOrdinal(d3.schemeCategory10.map((c) => c.toString())),
        [],
    );

    // Track container width responsively
    useEffect(() => {
        if (!wrapperRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });
        observer.observe(wrapperRef.current);
        return () => observer.disconnect();
    }, []);

    // Cleanup tooltip on unmount
    useEffect(() => {
        return () => {
            tooltipRef.current?.remove();
            tooltipRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (
            !svgRef.current ||
            !wrapperRef.current ||
            datasets.length === 0 ||
            containerWidth === 0
        ) {
            return;
        }

        const width = containerWidth;
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

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
        const formatTooltip: TooltipFormatter =
            tooltipFormatter ?? ((d) => String(d.y));

        const allPoints = datasets.flatMap((d) => d.data);
        if (allPoints.length === 0) return;

        const xValues = allPoints
            .map((d) => {
                const num = Number(d.x);
                return Number.isFinite(num) ? num : null;
            })
            .filter((v): v is number => v !== null);

        if (xValues.length === 0) {
            toast.warning("LineGraph: No valid numeric x values found");
            return;
        }

        const xExtent = d3.extent(xValues) as [number, number];
        if (xExtent[0] == null || xExtent[1] == null) {
            toast.warning("LineGraph: Invalid x extent");
            return;
        }

        const x = d3
            .scaleLinear()
            .domain(xExtent)
            .range([margin.left, width - margin.right]);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(allPoints, (d) => d.y) || 10])
            .range([height - margin.bottom, margin.top]);

        const positionTooltip = (
            event: MouseEvent | FocusEvent,
            d: { x: string | number; y: number },
            label: string,
        ) => {
            const wrapperRect = wrapperRef.current?.getBoundingClientRect();
            if (!wrapperRect) return;

            let clientX: number;
            let clientY: number;

            if (event.type === "focus") {
                const circle = event.target as SVGCircleElement;
                const circleRect = circle.getBoundingClientRect();
                clientX = circleRect.left + circleRect.width / 2;
                clientY = circleRect.top + circleRect.height / 2;
            } else {
                const mouseEvent = event as MouseEvent;
                clientX = mouseEvent.clientX;
                clientY = mouseEvent.clientY;
            }

            tooltip
                .text(formatTooltip(d, label))
                .transition()
                .duration(100)
                .style("opacity", 1)
                .style("left", `${clientX - wrapperRect.left}px`)
                .style("top", `${clientY - wrapperRect.top}px`);
        };

        // X-axis
        const xTicks = x.ticks().filter((t) => Number.isInteger(t));
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(
                d3.axisBottom(x).tickValues(xTicks).tickFormat(d3.format("d")),
            )
            .call((g) => g.selectAll(".tick line").remove())
            .call((g) => g.select(".domain").remove());

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("fill", "#555")
            .attr("x", margin.left + (width - margin.left - margin.right) / 2)
            .attr("y", height - margin.bottom + 40)
            .text(xAxisLabel);

        // Y-axis
        const yTicks = y.ticks().filter((t) => Number.isInteger(t));
        svg.append("g")
            .attr("class", "y-axis")
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

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .attr("fill", "#555")
            .attr("x", -margin.top - (height - margin.top - margin.bottom) / 2)
            .attr("y", 15)
            .text(yAxisLabel);

        // Lines
        const lineGen = d3
            .line<{ x: string | number; y: number }>()
            .x((d) => {
                const num = Number(d.x);
                return Number.isFinite(num) ? x(num) : 0;
            })
            .y((d) => y(d.y));

        const linesGroup = svg.append("g").attr("class", "lines");
        datasets.forEach((ds) => {
            linesGroup
                .append("path")
                .attr("fill", "none")
                .attr("stroke", colorScale(ds.label))
                .attr("stroke-width", strokeWidth)
                .attr("d", lineGen(ds.data));
        });

        // Dots
        const dotsGroup = svg.append("g").attr("class", "dots");
        datasets.forEach((ds) => {
            dotsGroup
                .selectAll(null)
                .data(ds.data)
                .enter()
                .append("circle")
                .attr("r", dotRadius)
                .attr("fill", colorScale(ds.label))
                .style("cursor", "pointer")
                .attr("tabindex", 0)
                .attr("cx", (d) => {
                    const num = Number(d.x);
                    return Number.isFinite(num) ? x(num) : 0;
                })
                .attr("cy", (d) => y(d.y))
                .on("mouseover focus", function (event, d) {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr("r", dotRadius + 2);
                    positionTooltip(event, d, ds.label);
                })
                .on("mouseout blur", function () {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr("r", dotRadius);
                    tooltip.transition().duration(100).style("opacity", 0);
                });
        });

        // Legend
        const legendGroup = svg
            .append("g")
            .attr("class", "legend")
            .attr(
                "transform",
                `translate(${margin.left}, ${height - margin.bottom + 80})`,
            );

        if (legendTitle) {
            legendGroup
                .append("text")
                .attr("class", "legend-title")
                .attr("x", 0)
                .attr("y", -10)
                .style("font-size", "14px")
                .style("font-weight", "600")
                .attr("fill", "currentColor")
                .text(legendTitle);
        }

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

        requestAnimationFrame(() => {
            let xOffset = 0;
            let yOffset = 0;
            legendItems.attr("transform", function () {
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

        if (svgRefCopy != null) {
            svgRefCopy.current = svgRef.current;
        }
    }, [
        datasets,
        xAxisLabel,
        yAxisLabel,
        legendTitle,
        containerWidth,
        dotRadius,
        strokeWidth,
        colorScale,
        tooltipFormatter,
    ]);

    return (
        <div ref={wrapperRef} style={{ position: "relative", width: "100%" }}>
            <svg
                ref={svgRef}
                width={containerWidth}
                height={height}
                style={{ overflow: "visible", display: "block" }}
            />
        </div>
    );
}
