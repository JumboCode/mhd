/***************************************************************
 *
 *         /api/components/NewBargraph.tsx
 *
 *         Author: Chiara and Steven
 *         Date: 12/6/2025
 *
 *        Summary: bargraph component using D3
 **************************************************************/

"use client";

import { useRef, useEffect } from "react";
import * as d3 from "d3";

// Shared type for bar graph
export type BarDataset = {
    label: string;
    data: { x: string | number; y: number }[];
};

type BarGraphProps = {
    dataset: BarDataset[];
    yAxisLabel: string;
    xAxisLabel: string;
    legendTitle?: string;
    svgRefCopy?: React.RefObject<SVGSVGElement | null>;
};

export default function BarGraph({
    dataset,
    yAxisLabel,
    xAxisLabel,
    legendTitle,
    svgRefCopy,
}: BarGraphProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const tooltipRef = useRef<d3.Selection<
        HTMLDivElement,
        unknown,
        null,
        undefined
    > | null>(null);

    // Use same color scheme as LineGraph
    //const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    const colorScale = d3.scaleOrdinal(
        d3.schemeCategory10.map((c) => c.toString()),
    );

    useEffect(() => {
        if (!svgRef.current || !wrapperRef.current || dataset.length === 0) {
            return;
        }

        const width = 900;
        const height = 400;

        const margin = {
            top: 20,
            right: 20,
            bottom: 100,
            left: 60,
        };

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // clear previous render

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

        // Flatten data to determine axis domains
        const allPoints = dataset.flatMap((d) => d.data);

        const xValues = Array.from(new Set(allPoints.map((d) => d.x)));
        const x = d3
            .scaleBand()
            .domain(xValues.map(String))
            .range([margin.left, width - margin.right])
            .padding(0.1); // Spacing between x-axis values

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(allPoints, (d) => d.y) || 10])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const positionTooltip = (
            event: MouseEvent | FocusEvent,
            d: { x: string | number; y: number },
        ) => {
            const wrapperRect = wrapperRef.current?.getBoundingClientRect();
            if (!wrapperRect || !tooltip) return;

            let clientX: number;
            let clientY: number;

            if (event.type === "focus") {
                const bar = event.target as SVGPathElement;
                const barRect = bar.getBoundingClientRect();
                clientX = barRect.left + barRect.width / 2;
                clientY = barRect.top + barRect.height / 2;
            } else {
                const mouseEvent = event as MouseEvent;
                clientX = mouseEvent.clientX;
                clientY = mouseEvent.clientY;
            }

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

        // Draw bars
        const barWidth = x.bandwidth() / dataset.length;

        dataset.forEach((ds, i) => {
            svg.selectAll(`.bar-${i}`)
                .data(ds.data)
                .enter()
                .append("path")
                .attr("fill", colorScale(ds.label))
                .attr("stroke-width", 1)
                .style("cursor", "pointer")
                .attr("tabindex", 0)
                .on("mouseover focus", function (event, d) {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr("opacity", 0.85);
                    positionTooltip(event, d);
                })
                .on("mousemove", function (event, d) {
                    positionTooltip(event, d);
                })
                .on("mouseout blur", function () {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr("opacity", 1);
                    tooltip?.transition().duration(100).style("opacity", 0);
                })
                .attr("d", (d) => {
                    const barX = (x(String(d.x)) || 0) + i * barWidth;
                    const barY = y(d.y);
                    const barHeight = y(0) - y(d.y);
                    const r = 2;
                    const w = barWidth;
                    return `
                  M${barX},${barY + r}
                  a${r},${r} 0 0 1 ${r},${-r}
                  h${w - 2 * r}
                  a${r},${r} 0 0 1 ${r},${r}
                  v${barHeight - r}
                  h${-w}
                  Z
                `;
                });
        });

        // X-axis
        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(x))
            .call((g) => g.selectAll(".tick line").remove())
            .call((g) => g.select(".domain").remove());

        // X-axis label (positioned above legend)
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

        // Legend at bottom
        const legendGroup = svg
            .append("g")
            .attr("class", "legend")
            .attr(
                "transform",
                `translate(${margin.left}, ${height - margin.bottom + 80})`,
            );

        // Add legend title if provided
        if (legendTitle) {
            legendGroup
                .append("text")
                .attr("x", 0)
                .attr("y", -10)
                .text(legendTitle)
                .style("font-size", "14px")
                .style("font-weight", "600")
                .attr("fill", "currentColor");
        }

        const legendWidth = width - margin.left - margin.right;
        const itemMargin = 10;
        const rowHeight = 20;

        const legendItems = legendGroup
            .selectAll("g.legend-item")
            .data(dataset)
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

        if (svgRefCopy !== undefined) {
            svgRefCopy.current = svgRef.current;
        }
    }, [dataset]);

    return (
        <div ref={wrapperRef} style={{ position: "relative" }}>
            <svg
                ref={svgRef}
                width={900}
                height={400}
                style={{ overflow: "visible" }}
            ></svg>
        </div>
    );
}
