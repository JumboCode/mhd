/***************************************************************
 *
 *                LineGraph.tsx
 *
 *         Author: Elki Laranas & Zander Barba
 *           Date: 11/24/2025
 *
 *        Summary: Use d3.js to render a set of linegraphs
 *        given the datapoints for all of them.
 *
 **************************************************************/

"use client";

import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

// Shared type for the data structure
export type GraphDataset = {
    label: string;
    data: { year: number; value: number }[];
};

type MultiLineGraphProps = {
    datasets: GraphDataset[];
    yAxisLabel: string;
    groupByLabel: string;
};

export default function MultiLineGraph({
    datasets,
    yAxisLabel,
    groupByLabel,
}: MultiLineGraphProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);

    // Standard color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    useEffect(() => {
        if (!svgRef.current || datasets.length === 0) return;

        const width = 1000;
        const height = 600;
        const margin = { top: 20, right: 150, bottom: 50, left: 60 };

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear SVG for re-rendering

        // Flatten all data points to determine axis domains
        const allPoints = datasets.flatMap((d) => d.data);
        if (allPoints.length === 0) return;

        const x = d3
            .scaleLinear()
            .domain(d3.extent(allPoints, (d) => d.year) as [number, number])
            .range([margin.left, width - margin.right]);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(allPoints, (d) => d.value) || 10])
            .range([height - margin.bottom, margin.top]);

        // Define the line generator
        const lineGen = d3
            .line<{ year: number; value: number }>()
            .x((d) => x(d.year))
            .y((d) => y(d.value));

        // Draw a path for each dataset
        datasets.forEach((dataset) => {
            const path = svg
                .append("path")
                .datum(dataset.data)
                .attr("fill", "none")
                .attr("stroke", colorScale(dataset.label))
                .attr("stroke-width", 2)
                .attr("d", lineGen);

            // Get the total length of the path to animate the drawing
            const length = path.node()?.getTotalLength() || 0;

            // Set up the initial state for the animation and run the transition
            path.attr("stroke-dasharray", `${length} ${length}`)
                .attr("stroke-dashoffset", length)
                .transition()
                .duration(1500) // Animation duration in milliseconds
                .attr("stroke-dashoffset", 0);
        });

        // Add the X-axis
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(
                d3
                    .axisBottom(x)
                    .ticks(
                        Math.min(
                            d3.max(allPoints, (d) => d.year)! -
                                d3.min(allPoints, (d) => d.year)!,
                            10,
                        ),
                    )
                    .tickFormat(d3.format("d")),
            )
            .call((g) => g.selectAll(".tick line").remove())
            .call((g) => g.select(".domain").remove());

        // Add the X-axis label
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", margin.left + (width - margin.left - margin.right) / 2)
            .attr("y", height - 5)
            .attr("fill", "#555")
            .text("Year");

        const yTicks = y.ticks().filter((t) => Number.isInteger(t));

        // Add the Y-axis and grid lines
        const yAxis = d3
            .axisLeft(y)
            .tickValues(yTicks)
            .tickSize(-width + margin.left + margin.right)
            .tickPadding(10)
            .tickFormat(d3.format("d"));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(yAxis)
            .call((g) => g.selectAll(".tick line").attr("stroke", "#ccc"))
            .call((g) => g.select(".domain").remove())
            .call((g) => g.selectAll(".tick text").attr("fill", "#555"));

        // Add the legend
        const legendGroup = svg
            .append("g")
            .attr(
                "transform",
                `translate(${width - margin.right + 10}, ${margin.top})`,
            );

        // Add legend title
        legendGroup
            .append("text")
            .attr("x", 0)
            .attr("y", 0)
            .text(groupByLabel)
            .style("font-size", "12px")
            .style("font-weight", "bold");

        const legend = legendGroup
            .append("g")
            .attr("transform", "translate(0, 20)");

        datasets.forEach((dataset, i) => {
            const row = legend
                .append("g")
                .attr("transform", `translate(0, ${i * 20})`);

            row.append("rect")
                .attr("width", 12)
                .attr("height", 12)
                .attr("fill", colorScale(dataset.label));

            row.append("text")
                .attr("x", 16)
                .attr("y", 10)
                .text(dataset.label)
                .style("font-size", "12px")
                .attr("alignment-baseline", "middle");
        });
    }, [datasets]);

    return (
        <div className="m-10">
            <div className="flex flex-row">
                <div className="flex items-center justify-center">
                    <div className="rotate-270 text-gray-500 whitespace-nowrap">
                        {yAxisLabel}
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <svg ref={svgRef} width={1000} height={600}></svg>
                </div>
            </div>
        </div>
    );
}
