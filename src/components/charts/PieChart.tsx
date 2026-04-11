"use client";

import React, { useState } from "react";
import { pie, arc, PieArcDatum } from "d3";
import { CHART_COLORS } from "@/components/charts/chartTypes";

type DataItem = {
    name: string;
    value: number;
    color: string;
};

export function projectCategoryDistribution(
    projects: { category: string }[],
): DataItem[] {
    const counts: Record<string, number> = {};
    for (const p of projects) {
        counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value], i) => ({
            name,
            value,
            color: CHART_COLORS[i % CHART_COLORS.length],
        }));
}

interface PieChartProps {
    data: DataItem[];
    title?: string;
}

export function PieChartLabels({ data, title }: PieChartProps) {
    const [tooltip, setTooltip] = useState<{
        x: number;
        y: number;
        content: string;
    } | null>(null);

    const radius = Math.PI * 100;
    const gap = 0.02;

    const pieLayout = pie<DataItem>()
        .sort(null)
        .value((d) => d.value)
        .padAngle(gap);

    const arcGenerator = arc<PieArcDatum<DataItem>>()
        .innerRadius(20)
        .outerRadius(radius)
        .cornerRadius(8);

    const arcs = pieLayout(data);

    if (data.length === 0) {
        return (
            <div className="border border-border rounded-lg p-6">
                {title && (
                    <p className="text-sm font-semibold text-foreground mb-2">
                        {title}
                    </p>
                )}
                <div className="h-48 flex items-center justify-center bg-muted rounded">
                    <p className="text-sm text-muted-foreground">
                        No project data
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="border border-border rounded-lg p-6">
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
            <div className="flex items-center gap-8">
                {/* Pie chart */}
                <div className="max-w-[16rem] shrink-0">
                    <svg
                        viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
                        className="overflow-visible w-full h-auto"
                    >
                        {/* Slices */}
                        {arcs.map((d: PieArcDatum<DataItem>, i) => (
                            <path
                                key={i}
                                fill={d.data.color}
                                d={arcGenerator(d)!}
                                style={{ cursor: "pointer" }}
                                onMouseEnter={(e) =>
                                    setTooltip({
                                        x: e.clientX,
                                        y: e.clientY,
                                        content: `${d.data.name}: ${d.data.value.toLocaleString("en-US")}`,
                                    })
                                }
                                onMouseMove={(e) =>
                                    setTooltip({
                                        x: e.clientX,
                                        y: e.clientY,
                                        content: `${d.data.name}: ${d.data.value.toLocaleString("en-US")}`,
                                    })
                                }
                                onMouseLeave={() => setTooltip(null)}
                            />
                        ))}
                    </svg>
                </div>

                {/* Legend */}
                <div className="flex-1 min-w-0">
                    {title && (
                        <p className="text-sm font-semibold text-foreground mb-3">
                            {title}
                        </p>
                    )}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        {data.map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 min-w-0"
                            >
                                <div
                                    className="w-4 h-4 rounded-sm shrink-0"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm text-foreground truncate">
                                    {item.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
