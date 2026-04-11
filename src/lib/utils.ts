import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CHART_COLORS, type PieSlice } from "@/components/charts/chartTypes";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function projectCategoryDistribution(
    projects: { category: string }[],
): PieSlice[] {
    const counts: Record<string, number> = {};
    for (const p of projects) {
        counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([label, value], i) => ({
            label,
            value,
            color: CHART_COLORS[i % CHART_COLORS.length],
        }));
}
