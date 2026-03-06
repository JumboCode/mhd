"use client";

import { useState } from "react";
import { scaleBand, scaleLinear, max } from "d3";
import {
    ChartDataset,
    ChartConfig,
    TooltipFormatter,
    CHART_COLORS,
} from "./chartTypes";

export type { ChartDataset as BarDataset };

type BarGraphProps = {
    dataset: ChartDataset[];
    yAxisLabel: string;
    xAxisLabel: string;
    legendTitle?: string;
    svgRefCopy?: React.RefObject<SVGSVGElement | null>;
    config?: ChartConfig;
    tooltipFormatter?: TooltipFormatter;
};

export default function BarGraph({
    dataset,
    yAxisLabel,
    xAxisLabel,
    legendTitle,
    svgRefCopy,
    config,
    tooltipFormatter,
}: BarGraphProps) {
    const [tooltip, setTooltip] = useState<{
        x: number;
        y: number;
        content: string;
    } | null>(null);

    const height = config?.height ?? 400;
    const mTop = config?.margin?.top ?? 6;
    const mRight = config?.margin?.right ?? 25;
    const mBottom = config?.margin?.bottom ?? 80;
    const mLeft = config?.margin?.left ?? 50;
    const barPadding = config?.barPadding ?? 0.25;
    const cornerRadius = config?.cornerRadius ?? 3;

    const allXValues = Array.from(
        new Set(dataset.flatMap((ds) => ds.data.map((d) => String(d.x)))),
    );
    const maxY = max(dataset.flatMap((ds) => ds.data.map((d) => d.y))) ?? 0;

    const outerScale = scaleBand()
        .domain(allXValues)
        .range([0, 100])
        .padding(barPadding);

    const innerScale = scaleBand()
        .domain(dataset.map((ds) => ds.label))
        .range([0, outerScale.bandwidth()])
        .padding(dataset.length > 1 ? 0.05 : 0);

    const yScale = scaleLinear().domain([0, maxY]).range([100, 0]).nice();

    const formatTooltip: TooltipFormatter =
        tooltipFormatter ?? ((d) => String(d.y));
    const yTicks = yScale.ticks(6).filter((t) => Number.isInteger(t));
    const hasLegend = dataset.length > 1 || !!legendTitle;

    const chartTop = mTop;
    const chartBottom = height - mBottom;
    const chartHeight = chartBottom - chartTop;

    return (
        <div className="relative w-full select-none" style={{ height }}>
            {/* Tooltip */}
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

            {/* Y-axis: rotated label strip + tick values */}
            <div
                className="absolute overflow-visible"
                style={{
                    top: chartTop,
                    left: 0,
                    width: mLeft,
                    height: chartHeight,
                }}
            >
                {/* Rotated axis title — occupies leftmost 16px */}
                <div
                    className="absolute inset-y-0 flex items-center justify-center"
                    style={{ left: 0, width: 16 }}
                >
                    <span
                        className="text-xs text-muted-foreground whitespace-nowrap pointer-events-none"
                        style={{
                            writingMode: "vertical-rl",
                            transform: "rotate(180deg)",
                        }}
                    >
                        {yAxisLabel}
                    </span>
                </div>
                {/* Tick values — confined to right portion, away from label */}
                {yTicks.map((value, i) => (
                    <div
                        key={i}
                        style={{ top: `${yScale(value)}%`, left: 24, right: 0 }}
                        className="absolute text-xs tabular-nums -translate-y-1/2 text-muted-foreground text-right pr-2"
                    >
                        {value.toLocaleString()}
                    </div>
                ))}
            </div>

            {/* Chart area */}
            <div
                className="absolute overflow-visible"
                style={{
                    top: chartTop,
                    left: mLeft,
                    right: mRight,
                    height: chartHeight,
                }}
            >
                {/* Grid lines (SVG) */}
                <svg
                    ref={(el) => {
                        if (svgRefCopy !== undefined) svgRefCopy.current = el;
                    }}
                    viewBox="0 0 100 100"
                    className="absolute inset-0 w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                >
                    {yTicks.map((value, i) => (
                        <g
                            key={i}
                            transform={`translate(0,${yScale(value)})`}
                            className="text-border"
                        >
                            <line
                                x1={0}
                                x2={100}
                                stroke="currentColor"
                                strokeDasharray="6,5"
                                strokeWidth={0.5}
                                vectorEffect="non-scaling-stroke"
                            />
                        </g>
                    ))}
                </svg>

                {/* Bars */}
                {dataset.map((ds, si) =>
                    ds.data.map((point, pi) => {
                        const xKey = String(point.x);
                        const left =
                            (outerScale(xKey) ?? 0) +
                            (innerScale(ds.label) ?? 0);
                        const width = innerScale.bandwidth();
                        const barH = Math.max(0, yScale(0) - yScale(point.y));
                        const content = formatTooltip(point, ds.label);
                        return (
                            <div
                                key={`${si}-${pi}`}
                                className="absolute bottom-0"
                                style={{
                                    left: `${left}%`,
                                    width: `${width}%`,
                                    height: `${barH}%`,
                                    backgroundColor:
                                        CHART_COLORS[si % CHART_COLORS.length],
                                    borderRadius: `${cornerRadius}px ${cornerRadius}px 0 0`,
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) =>
                                    setTooltip({
                                        x: e.clientX,
                                        y: e.clientY,
                                        content,
                                    })
                                }
                                onMouseMove={(e) =>
                                    setTooltip({
                                        x: e.clientX,
                                        y: e.clientY,
                                        content,
                                    })
                                }
                                onMouseLeave={() => setTooltip(null)}
                            />
                        );
                    }),
                )}
            </div>

            {/* X-axis tick labels — explicitly below chart area */}
            <div
                className="absolute overflow-visible"
                style={{ top: chartBottom + 6, left: mLeft, right: mRight }}
            >
                {allXValues.map((xVal, i) => {
                    const xPos =
                        (outerScale(xVal) ?? 0) + outerScale.bandwidth() / 2;
                    return (
                        <div
                            key={i}
                            className="absolute overflow-visible text-muted-foreground"
                            style={{
                                left: `${xPos}%`,
                                transform: "translateX(-50%)",
                            }}
                        >
                            <span className="text-xs whitespace-nowrap">
                                {xVal}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* X-axis title */}
            <div
                className="absolute text-xs text-muted-foreground text-center"
                style={{
                    top: chartBottom + 28,
                    left: mLeft,
                    right: mRight,
                }}
            >
                {xAxisLabel}
            </div>

            {/* Legend */}
            {hasLegend && (
                <div
                    className="absolute flex flex-wrap items-center gap-x-4 gap-y-1"
                    style={{
                        top: chartBottom + 50,
                        left: mLeft,
                        right: mRight,
                    }}
                >
                    {legendTitle && (
                        <span className="text-xs font-semibold text-foreground w-full">
                            {legendTitle}
                        </span>
                    )}
                    {dataset.map((ds, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <div
                                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                                style={{
                                    backgroundColor:
                                        CHART_COLORS[i % CHART_COLORS.length],
                                }}
                            />
                            <span className="text-xs text-muted-foreground">
                                {ds.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
