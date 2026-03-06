"use client";

import { useState } from "react";
import { scaleLinear, max, extent, line as d3Line, area as d3Area } from "d3";
import {
    ChartDataset,
    ChartConfig,
    TooltipFormatter,
    CHART_COLORS,
} from "./chartTypes";

export type { ChartDataset as GraphDataset };

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
    const [tooltip, setTooltip] = useState<{
        x: number;
        y: number;
        content: string;
    } | null>(null);

    const height = config?.height ?? 400;
    const mTop = config?.margin?.top ?? 6;
    const mRight = config?.margin?.right ?? 8;
    const mBottom = config?.margin?.bottom ?? 80;
    const mLeft = config?.margin?.left ?? 54;
    const strokeWidth = config?.strokeWidth ?? 2;
    const dotRadius = config?.dotRadius ?? 6;

    const allPoints = datasets.flatMap((d) => d.data);
    if (allPoints.length === 0) return null;

    const xNums = allPoints
        .map((d) => Number(d.x))
        .filter((n) => Number.isFinite(n));
    const xExtent = extent(xNums) as [number, number];
    if (xExtent[0] == null) return null;

    const xScale = scaleLinear().domain(xExtent).range([0, 100]);
    const yScale = scaleLinear()
        .domain([0, max(allPoints.map((d) => d.y)) ?? 10])
        .range([100, 0])
        .nice();

    const lineGen = d3Line<{ x: string | number; y: number }>()
        .x((d) => xScale(Number(d.x)))
        .y((d) => yScale(d.y));

    const areaGen = d3Area<{ x: string | number; y: number }>()
        .x((d) => xScale(Number(d.x)))
        .y0(100)
        .y1((d) => yScale(d.y));

    const formatTooltip: TooltipFormatter =
        tooltipFormatter ?? ((d) => String(d.y));
    const yTicks = yScale.ticks(8).filter((t) => Number.isInteger(t));
    const xTicks = xScale.ticks().filter((t) => Number.isInteger(t));
    const hasLegend = datasets.length > 1 || !!legendTitle;

    // Derived pixel positions for explicit placement
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
                        className="absolute text-xs tabular-nums -translate-y-1/2 text-muted-foreground text-right pr-4"
                    >
                        {value.toLocaleString()}
                    </div>
                ))}
            </div>

            {/* Chart area (SVG only — no child divs) */}
            <div
                className="absolute"
                style={{
                    top: chartTop,
                    left: mLeft,
                    right: mRight,
                    height: chartHeight,
                }}
            >
                <svg
                    ref={(el) => {
                        if (svgRefCopy !== undefined) svgRefCopy.current = el;
                    }}
                    viewBox="0 0 100 100"
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                >
                    {/* Grid lines */}
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

                    {/* Gradient defs */}
                    <defs>
                        {datasets.map((ds, i) => (
                            <linearGradient
                                key={ds.label}
                                id={`area-gradient-${i}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor={
                                        CHART_COLORS[i % CHART_COLORS.length]
                                    }
                                    stopOpacity={0.2}
                                />
                                <stop
                                    offset="100%"
                                    stopColor={
                                        CHART_COLORS[i % CHART_COLORS.length]
                                    }
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        ))}
                    </defs>

                    {/* Area fills */}
                    {datasets.map((ds, i) => {
                        const a = areaGen(ds.data);
                        if (!a) return null;
                        return (
                            <path
                                key={ds.label}
                                d={a}
                                fill={`url(#area-gradient-${i})`}
                                stroke="none"
                            />
                        );
                    })}

                    {/* Lines */}
                    {datasets.map((ds, i) => {
                        const d = lineGen(ds.data);
                        if (!d) return null;
                        return (
                            <path
                                key={ds.label}
                                d={d}
                                fill="none"
                                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                strokeWidth={strokeWidth}
                                vectorEffect="non-scaling-stroke"
                            />
                        );
                    })}

                    {/* Dots + hit targets sorted by cy desc so highest data value renders on top */}
                    {(() => {
                        const dots = datasets
                            .flatMap((ds, si) =>
                                ds.data.map((point) => ({
                                    cx: xScale(Number(point.x)),
                                    cy: yScale(point.y),
                                    color: CHART_COLORS[
                                        si % CHART_COLORS.length
                                    ],
                                    content: formatTooltip(point, ds.label),
                                    key: `${si}-${String(point.x)}`,
                                })),
                            )
                            .sort((a, b) => b.cy - a.cy); // high cy (low value) first, low cy (high value) last = on top

                        return (
                            <>
                                {dots.map((dot) => (
                                    <path
                                        key={`dot-${dot.key}`}
                                        d={`M ${dot.cx} ${dot.cy} l 0.0001 0`}
                                        vectorEffect="non-scaling-stroke"
                                        strokeWidth={dotRadius}
                                        strokeLinecap="round"
                                        fill="none"
                                        stroke={dot.color}
                                        style={{ pointerEvents: "none" }}
                                    />
                                ))}
                                {dots.map((dot) => (
                                    <path
                                        key={`hit-${dot.key}`}
                                        d={`M ${dot.cx} ${dot.cy} l 0.0001 0`}
                                        vectorEffect="non-scaling-stroke"
                                        strokeWidth={16}
                                        strokeLinecap="round"
                                        fill="none"
                                        stroke="transparent"
                                        style={{ cursor: "pointer" }}
                                        onMouseEnter={(e) =>
                                            setTooltip({
                                                x: e.clientX,
                                                y: e.clientY,
                                                content: dot.content,
                                            })
                                        }
                                        onMouseMove={(e) =>
                                            setTooltip({
                                                x: e.clientX,
                                                y: e.clientY,
                                                content: dot.content,
                                            })
                                        }
                                        onMouseLeave={() => setTooltip(null)}
                                    />
                                ))}
                            </>
                        );
                    })()}
                </svg>
            </div>

            {/* X-axis tick labels — explicitly below chart area */}
            <div
                className="absolute overflow-visible"
                style={{ top: chartBottom + 6, left: mLeft, right: mRight }}
            >
                {xTicks.map((year, i) => {
                    const isFirst = i === 0;
                    const isLast = i === xTicks.length - 1;
                    return (
                        <div
                            key={i}
                            className="absolute overflow-visible text-muted-foreground"
                            style={{
                                left: `${xScale(year)}%`,
                                transform: `translateX(${isFirst ? "0%" : isLast ? "-100%" : "-50%"})`,
                            }}
                        >
                            <span className="text-xs tabular-nums">{year}</span>
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
                    {datasets.map((ds, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <div
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
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
