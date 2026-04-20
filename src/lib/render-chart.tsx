"use client";

import React from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas-pro";
import BarGraph from "@/components/charts/BarGraph";
import MultiLineGraph from "@/components/charts/LineGraph";
import { type ChartDataset } from "@/components/charts/chartTypes";

export async function renderChartToDataUrl(
    chartType: "bar" | "line",
    dataset: ChartDataset[],
    yAxisLabel: string,
    legendTitle?: string,
): Promise<string> {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "800px";
    container.style.height = "500px";
    container.style.backgroundColor = "#fff";
    document.body.appendChild(container);

    const root = createRoot(container);

    if (chartType === "bar") {
        root.render(
            <BarGraph
                dataset={dataset}
                yAxisLabel={yAxisLabel}
                xAxisLabel="Year"
                legendTitle={legendTitle}
            />,
        );
    } else {
        root.render(
            <MultiLineGraph
                datasets={dataset}
                yAxisLabel={yAxisLabel}
                xAxisLabel="Year"
                legendTitle={legendTitle}
            />,
        );
    }

    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = await html2canvas(container, {
        backgroundColor: "#fff",
        scale: 2,
    });
    const dataUrl = canvas.toDataURL();

    root.unmount();
    document.body.removeChild(container);

    return dataUrl;
}
