/**
 * Shared types and constants for BarGraph and LineGraph components.
 */

export const CHART_COLORS = [
    "#3b82f6", // blue-500
    "#f59e0b", // amber-500
    "#10b981", // emerald-500
    "#ef4444", // red-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#06b6d4", // cyan-500
    "#84cc16", // lime-500
    "#f97316", // orange-500
    "#6366f1", // indigo-500
];

export type ChartDataset = {
    label: string;
    data: { x: string | number; y: number }[];
};

export type ChartMargin = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};

export type ChartConfig = {
    /** Fixed height in px. Defaults to 400. Width is always responsive. */
    height?: number;
    margin?: Partial<ChartMargin>;
    /** BarGraph: rounded corner radius on bar tops. Default: 2 */
    cornerRadius?: number;
    /** BarGraph: padding between bar groups (0–1). Default: 0.1 */
    barPadding?: number;
    /** LineGraph: data point dot radius. Default: 4 */
    dotRadius?: number;
    /** LineGraph: line stroke width. Default: 2 */
    strokeWidth?: number;
};

/**
 * Receives the hovered data point and its series label.
 * Return the string to display in the tooltip.
 */
export type TooltipFormatter = (
    point: { x: string | number; y: number },
    seriesLabel: string,
) => string;
