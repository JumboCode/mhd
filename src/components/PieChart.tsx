import React from "react";
import { pie, arc, PieArcDatum } from "d3";

type DataItem = {
    name: string;
    value: number;
    colorFrom: string;
    colorTo: string;
};

const SLICE_COLORS: { colorFrom: string; colorTo: string }[] = [
    { colorFrom: "text-pink-400", colorTo: "text-pink-400" },
    { colorFrom: "text-purple-400", colorTo: "text-purple-400" },
    { colorFrom: "text-indigo-400", colorTo: "text-indigo-400" },
    { colorFrom: "text-sky-400", colorTo: "text-sky-400" },
    { colorFrom: "text-lime-400", colorTo: "text-lime-400" },
    { colorFrom: "text-amber-400", colorTo: "text-amber-400" },
    { colorFrom: "text-rose-400", colorTo: "text-rose-400" },
    { colorFrom: "text-teal-400", colorTo: "text-teal-400" },
    { colorFrom: "text-orange-400", colorTo: "text-orange-400" },
    { colorFrom: "text-cyan-400", colorTo: "text-cyan-400" },
];

interface PieChartProps {
    data: DataItem[];
    title?: string;
}

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
            ...SLICE_COLORS[i % SLICE_COLORS.length],
        }));
}

export function PieChartLabels({ data, title }: PieChartProps) {
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

    const labelRadius = radius * 0.8;
    const arcLabel = arc<PieArcDatum<DataItem>>()
        .innerRadius(labelRadius)
        .outerRadius(labelRadius);

    const arcs = pieLayout(data);

    const computeAngle = (d: PieArcDatum<DataItem>) => {
        return ((d.endAngle - d.startAngle) * 180) / Math.PI;
    };

    const MIN_ANGLE = 20;

    if (data.length === 0) {
        return (
            <div className="border border-border rounded-lg p-6">
                <p className="text-sm font-semibold text-foreground mb-2">
                    {title}
                </p>
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
            {title && (
                <p className="text-sm font-semibold text-foreground text-center mb-2">
                    {title}
                </p>
            )}
            <div className="relative max-w-[16rem] mx-auto">
                <svg
                    viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
                    className="overflow-visible"
                >
                    {arcs.map((d, i) => {
                        const midAngle = (d.startAngle + d.endAngle) / 2;

                        return (
                            <g key={i}>
                                <path
                                    fill={`url(#pieColors-${i})`}
                                    d={arcGenerator(d)!}
                                />
                                <linearGradient
                                    id={`pieColors-${i}`}
                                    x1="0"
                                    y1="0"
                                    x2="1"
                                    y2="0"
                                    gradientTransform={`rotate(${(midAngle * 180) / Math.PI - 90}, 0.5, 0.5)`}
                                >
                                    <stop
                                        offset="0%"
                                        stopColor={"currentColor"}
                                        className={d.data.colorFrom}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor={"currentColor"}
                                        className={d.data.colorTo}
                                    />
                                </linearGradient>
                            </g>
                        );
                    })}
                </svg>

                <div className="absolute inset-0 pointer-events-none">
                    {arcs.map((d: PieArcDatum<DataItem>, i) => {
                        const angle = computeAngle(d);
                        if (angle <= MIN_ANGLE) return null;

                        const [x, y] = arcLabel.centroid(d);
                        const CENTER_PCT = 50;

                        const nameLeft = `${CENTER_PCT + (x / radius) * 40}%`;
                        const nameTop = `${CENTER_PCT + (y / radius) * 40}%`;

                        const valueLeft = `${CENTER_PCT + (x / radius) * 72}%`;
                        const valueTop = `${CENTER_PCT + (y / radius) * 70}%`;

                        return (
                            <div key={i}>
                                <div
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                    style={{
                                        left: valueLeft,
                                        top: valueTop,
                                    }}
                                >
                                    {d.data.value}
                                </div>
                                <div
                                    className="absolute max-w-[80px] text-white truncate text-center text-sm font-medium"
                                    style={{
                                        left: nameLeft,
                                        top: nameTop,
                                        transform: "translate(-50%, -50%)",
                                        marginLeft: x > 0 ? "2px" : "-2px",
                                        marginTop: y > 0 ? "2px" : "-2px",
                                    }}
                                >
                                    {d.data.name}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
