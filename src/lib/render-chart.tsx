"use client";

import { createRoot, type Root } from "react-dom/client";
import { type ReactNode } from "react";
import html2canvas from "html2canvas-pro";
import BarGraph from "@/components/charts/BarGraph";
import MultiLineGraph from "@/components/charts/LineGraph";
import { type ChartDataset } from "@/components/charts/chartTypes";

const OFFSCREEN_WIDTH = 800;
const CAPTURE_SCALE = 2.5;

/**
 * Mounts a React node offscreen, runs the callback once layout is stable,
 * then unmounts. Guarantees cleanup on success or error.
 */
async function withOffscreenRender<T>(
    node: ReactNode,
    fn: (container: HTMLDivElement) => Promise<T>,
): Promise<T> {
    const container = document.createElement("div");
    container.style.cssText = `position:fixed;left:-9999px;top:0;width:${OFFSCREEN_WIDTH}px;height:auto;background:#fff`;
    document.body.appendChild(container);

    let root: Root | null = null;
    try {
        root = createRoot(container);
        root.render(node);

        // Wait two animation frames: 1st = React commit/paint, 2nd = layout settled.
        await new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );

        // Children with absolute positioning (axis labels, legend) overflow the
        // chart root div. Expand container to their visual bottom so the capture
        // includes everything.
        const containerTop = container.getBoundingClientRect().top;
        let maxBottom = container.offsetHeight;
        container.querySelectorAll("*").forEach((el) => {
            const bottom = el.getBoundingClientRect().bottom - containerTop;
            if (bottom > maxBottom) maxBottom = bottom;
        });
        container.style.height = `${maxBottom + 20}px`;

        return await fn(container);
    } finally {
        root?.unmount();
        container.remove();
    }
}

export async function renderChartToDataUrl(
    chartType: "bar" | "line",
    dataset: ChartDataset[],
    yAxisLabel: string,
    legendTitle?: string,
): Promise<string> {
    const node =
        chartType === "bar" ? (
            <BarGraph
                dataset={dataset}
                yAxisLabel={yAxisLabel}
                xAxisLabel="Year"
                legendTitle={legendTitle}
            />
        ) : (
            <MultiLineGraph
                datasets={dataset}
                yAxisLabel={yAxisLabel}
                xAxisLabel="Year"
                legendTitle={legendTitle}
            />
        );

    return withOffscreenRender(node, async (container) => {
        const canvas = await html2canvas(container, {
            backgroundColor: "#fff",
            scale: CAPTURE_SCALE,
        });
        return canvas.toDataURL("image/png");
    });
}
