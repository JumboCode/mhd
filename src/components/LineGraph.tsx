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

type DataPoint = { year: number; value: number };

type MultiLineGraphProps = {
    lines: DataPoint[][];
};

export default function MultiLineGraph({ lines }: MultiLineGraphProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!svgRef.current || lines.length === 0) return;

        const width = 600;
        const height = 300;
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const allPoints = lines.flat();

        const x = d3
            .scaleLinear()
            .domain(
                d3.extent(allPoints, (d: DataPoint) => d.year) as [
                    number,
                    number,
                ],
            )
            .range([margin.left, width - margin.right]);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(allPoints, (d: DataPoint) => d.value) as number])
            .range([height - margin.bottom, margin.top]);

        const lineGen = d3
            .line<DataPoint>()
            .x((d: DataPoint) => x(d.year))
            .y((d: DataPoint) => y(d.value));

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        lines.forEach((lineData, i) => {
            svg.append("path")
                .datum(lineData)
                .attr("fill", "none")
                .attr("stroke", color(i.toString()))
                .attr("stroke-width", 2)
                .attr("d", lineGen);
        });

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));
    }, [lines]);

    return <svg ref={svgRef} width={600} height={300}></svg>;
}
