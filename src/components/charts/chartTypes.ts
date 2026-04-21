import { ENTITY_CONFIG } from "@/lib/entity-config";

/**
 * Shared types and constants for BarGraph, LineGraph, and PieChart components.
 */

/**
 * Maps dataset labels (like "Total Projects" or "Total # Projects") to entity colors from ENTITY_CONFIG.
 * Matches against multiple label patterns since chart page and entity config may use different formats.
 * Returns undefined if label doesn't match any entity.
 */
export function getEntityColorByLabel(label: string | undefined):
    | {
          color: string;
          colorMuted: string;
          colorMid: string;
      }
    | undefined {
    if (!label) return undefined;
    const normalizedLabel = label.toLowerCase();

    // Check competing/participating students BEFORE the generic "student"
    // match so they get their distinct entity colors.
    if (normalizedLabel.includes("competing")) {
        const c = ENTITY_CONFIG.studentsCompeting;
        return {
            color: c.color,
            colorMuted: c.colorMuted,
            colorMid: c.colorMid,
        };
    }
    if (normalizedLabel.includes("participating")) {
        const c = ENTITY_CONFIG.studentsParticipating;
        return {
            color: c.color,
            colorMuted: c.colorMuted,
            colorMid: c.colorMid,
        };
    }

    // Map of keywords to entity types
    const labelPatterns: Record<string, keyof typeof ENTITY_CONFIG> = {
        project: "projects",
        school: "schools",
        student: "students",
        teacher: "teachers",
        cities: "schools", // Cities use schools color
        city: "schools",
    };

    for (const [pattern, entityType] of Object.entries(labelPatterns)) {
        if (normalizedLabel.includes(pattern)) {
            const config = ENTITY_CONFIG[entityType];
            return {
                color: config.color,
                colorMuted: config.colorMuted,
                colorMid: config.colorMid,
            };
        }
    }
    return undefined;
}

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

export type PieSlice = {
    label: string;
    value: number;
    /** If omitted, PieChart assigns from CHART_COLORS by slice index. */
    color?: string;
};

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
    /** PieChart: pad angle between slices (radians). Default: 0.02 */
    piePadAngle?: number;
    /** PieChart: donut inner radius in SVG units. Default: 20 */
    pieInnerRadius?: number;
    /** PieChart: arc corner radius. Default: 8 */
    pieCornerRadius?: number;
};

/**
 * Receives the hovered data point and its series label.
 * Return the string to display in the tooltip.
 */
export type TooltipFormatter = (
    point: { x: string | number; y: number },
    seriesLabel: string,
) => string;

/**
 * Receives a pie slice with resolved color. Return the tooltip string.
 */
export type PieTooltipFormatter = (
    slice: PieSlice & { color: string },
) => string;
