interface HeatmapLegendProps {
    colors: string[];
    startLabel: string;
    endLabel: string;
}

export default function HeatmapLegend({
    colors,
    startLabel,
    endLabel,
}: HeatmapLegendProps) {
    const gradient = `linear-gradient(to right, ${colors.join(", ")})`;

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
                {startLabel}
            </span>
            <div
                className="h-3 w-36 rounded-sm"
                style={{ background: gradient }}
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
                {endLabel}
            </span>
        </div>
    );
}
