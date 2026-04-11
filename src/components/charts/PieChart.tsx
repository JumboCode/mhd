"use client";

import { useState } from "react";
import { pie, arc, PieArcDatum } from "d3";
import {
    CHART_COLORS,
    type ChartConfig,
    type PieSlice,
    type PieTooltipFormatter,
} from "./chartTypes";

export type { PieSlice };

type PieSliceResolved = PieSlice & { color: string };

function resolveSlices(slices: PieSlice[]): PieSliceResolved[] {
    return slices.map((s, i) => ({
        ...s,
        color: s.color ?? CHART_COLORS[i % CHART_COLORS.length],
    }));
}

type PieChartProps = {
    slices: PieSlice[];
    legendTitle?: string;
    chartRef?: React.RefObject<HTMLDivElement | null>;
    config?: ChartConfig;
    tooltipFormatter?: PieTooltipFormatter;
    emptyMessage?: string;
};

export default function PieChart({
    slices,
    legendTitle,
    chartRef,
    config,
    tooltipFormatter,
    emptyMessage = "No data",
}: PieChartProps) {
    const [tooltip, setTooltip] = useState<{
        x: number;
        y: number;
        content: string;
    } | null>(null);

    const radius = Math.PI * 100;
    const padAngle = config?.piePadAngle ?? 0.02;
    const innerRadius = config?.pieInnerRadius ?? 20;
    const cornerRadius = config?.pieCornerRadius ?? 8;

    const resolved = resolveSlices(slices);

    const pieLayout = pie<PieSliceResolved>()
        .sort(null)
        .value((d) => d.value)
        .padAngle(padAngle);

    const arcGenerator = arc<PieArcDatum<PieSliceResolved>>()
        .innerRadius(innerRadius)
        .outerRadius(radius)
        .cornerRadius(cornerRadius);

    const arcs = pieLayout(resolved);

    const formatTooltip: PieTooltipFormatter =
        tooltipFormatter ??
        ((d) => `${d.label}: ${d.value.toLocaleString("en-US")}`);

    if (slices.length === 0) {
        return (
            <div ref={chartRef} className="border border-border rounded-lg p-6">
                {legendTitle && (
                    <p className="text-sm font-semibold text-foreground mb-2">
                        {legendTitle}
                    </p>
                )}
                <div className="h-48 flex items-center justify-center bg-muted rounded">
                    <p className="text-sm text-muted-foreground">
                        {emptyMessage}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div ref={chartRef} className="border border-border rounded-lg p-6">
            {tooltip && (
                <div
                    className="fixed z-50 bg-popover text-popover-foreground border border-border shadow-sm text-xs px-2 py-1 rounded-md pointer-events-none whitespace-nowrap"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y - 8,
                        transform: "translate(-50%, -100%)",
                    }}
                >
                    {tooltip.content}
                </div>
            )}
            <div className="flex flex-row items-center gap-8">
                <div className="w-full max-w-[14rem] shrink-0 aspect-square">
                    <svg
                        viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
                        className="overflow-visible h-full w-full"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        {arcs.map((d: PieArcDatum<PieSliceResolved>, i) => (
                            <path
                                key={i}
                                fill={d.data.color}
                                d={arcGenerator(d)!}
                                style={{ cursor: "pointer" }}
                                onMouseEnter={(e) =>
                                    setTooltip({
                                        x: e.clientX,
                                        y: e.clientY,
                                        content: formatTooltip(d.data),
                                    })
                                }
                                onMouseMove={(e) =>
                                    setTooltip({
                                        x: e.clientX,
                                        y: e.clientY,
                                        content: formatTooltip(d.data),
                                    })
                                }
                                onMouseLeave={() => setTooltip(null)}
                            />
                        ))}
                    </svg>
                </div>

                <div className="min-w-0 flex-1 flex flex-col gap-3 justify-center">
                    {legendTitle && (
                        <p className="text-sm font-semibold text-foreground">
                            {legendTitle}
                        </p>
                    )}
                    <div className="flex flex-col gap-2">
                        {resolved.map((item, i) => (
                            <div
                                key={i}
                                className="flex min-w-0 items-center gap-2"
                            >
                                <div
                                    className="h-4 w-4 shrink-0 rounded-sm"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm text-foreground">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
