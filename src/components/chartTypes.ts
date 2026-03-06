/**
 * Shared types for BarGraph and LineGraph components.
 */

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
