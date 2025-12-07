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
};

export default function BarGraph({
    dataset,
    yAxisLabel,
    xAxisLabel,
}: BarGraphProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);

    // make bars all blue
    const colorScale = d3
        .scaleOrdinal<string>()
        .domain(dataset.map((d) => d.label))
        .range(["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"]);

    useEffect(() => {
        if (!svgRef.current || dataset.length === 0) return;

        const width = 1000;
        const height = 400;

        const margin = {
            top: 20,
            right: 20,
            bottom: 100,
            left: 60,
        };

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // clear previous render

        // Flatten data to determine axis domains
        const allPoints = dataset.flatMap((d) => d.data);

        const xValues = Array.from(new Set(allPoints.map((d) => d.x)));
        const x = d3
            .scaleBand()
            .domain(xValues.map(String))
            .range([margin.left, width - margin.right])
            .padding(0.2);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(allPoints, (d) => d.y) || 10])
            .nice()
            .range([height - margin.bottom, margin.top]);

        // Draw bars
        const barWidth = x.bandwidth() / dataset.length;

        dataset.forEach((ds, i) => {
            svg.selectAll(`.bar-${i}`)
                .data(ds.data)
                .enter()
                .append("path")
                .attr("fill", colorScale(ds.label))
                .attr("stroke-width", 1)
                .attr("d", (d) => {
                    const barX = (x(String(d.x)) || 0) + i * barWidth;
                    const barY = y(d.y);
                    const barHeight = y(0) - y(d.y);
                    const r = 4;
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
                `translate(${margin.left}, ${height - margin.bottom + 60})`,
            );

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
    }, [dataset]);

    return (
        <div>
            <svg ref={svgRef} width={900} height={400}></svg>
        </div>
    );
}
