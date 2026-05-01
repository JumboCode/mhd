/***************************************************************
 *
 *         /src/lib/pdf/theme.ts
 *
 *         Shared colors, spacing, and font registration for
 *         all @react-pdf/renderer documents.
 *
 **************************************************************/

import { Font, StyleSheet } from "@react-pdf/renderer";

export const COLORS = {
    BRAND_RED: "#af272f",
    MUTED_GRAY: "#6e6e6e",
    LIGHT_GRAY: "#dcdcdc",
    FILTER_BOX_BG: "#f7f7f7",
    TREND_GREEN: "#167a46",
    TREND_RED: "#af272f",
    TEXT_PRIMARY: "#141414",
    TEXT_SECONDARY: "#404040",
    GRID_LINE: "#dcdcdc",
    AXIS_LINE: "#7a7a7a",
} as const;

/**
 * Resolves a chart entity label (e.g. "Total # Projects", "Competing Students")
 * to a literal RGB color usable by SVG primitives. Mirrors the runtime CSS
 * mapping in src/lib/entity-config.ts but with hard-coded values, since
 * @react-pdf cannot read CSS custom properties.
 */
export const ENTITY_COLORS_PDF = {
    projects: "rgb(59,130,246)",
    teachers: "rgb(34,197,94)",
    students: "rgb(236,72,153)",
    studentsCompeting: "rgb(236,72,153)",
    studentsParticipating: "rgb(139,92,246)",
    schools: "rgb(245,158,11)",
} as const;

export function getEntityColorPdf(
    label: string | undefined,
): string | undefined {
    if (!label) return undefined;
    const n = label.toLowerCase();
    if (n.includes("competing")) return ENTITY_COLORS_PDF.studentsCompeting;
    if (n.includes("participating"))
        return ENTITY_COLORS_PDF.studentsParticipating;
    if (n.includes("project")) return ENTITY_COLORS_PDF.projects;
    if (n.includes("school") || n.includes("city") || n.includes("cities"))
        return ENTITY_COLORS_PDF.schools;
    if (n.includes("student")) return ENTITY_COLORS_PDF.students;
    if (n.includes("teacher")) return ENTITY_COLORS_PDF.teachers;
    return undefined;
}

/**
 * Page geometry (A4 in pt: 595.28 x 841.89). PAGE_PADDING is the inner
 * margin applied via the <Page padding> prop.
 */
export const PAGE_PADDING = 36; // ~12.7mm

let fontRegistered = false;

/**
 * Registers DM Sans for use in @react-pdf documents. Idempotent — safe to
 * call before every export. Font is fetched from /fonts/dmsans.ttf which
 * is served statically from public/fonts/.
 */
export function ensurePdfFontsRegistered(): void {
    if (fontRegistered) return;
    fontRegistered = true;

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    Font.register({
        family: "DM Sans",
        src: `${origin}/fonts/dmsans.ttf`,
    });
    // Disable hyphenation — it inserts surprise hyphens in chart axis labels.
    Font.registerHyphenationCallback((word) => [word]);
}

export const TEXT = StyleSheet.create({
    h1: {
        fontFamily: "DM Sans",
        fontSize: 16,
        color: COLORS.TEXT_PRIMARY,
    },
    h2: {
        fontFamily: "DM Sans",
        fontSize: 12,
        color: COLORS.TEXT_PRIMARY,
    },
    body: {
        fontFamily: "DM Sans",
        fontSize: 10,
        color: COLORS.TEXT_PRIMARY,
    },
    small: {
        fontFamily: "DM Sans",
        fontSize: 9,
        color: COLORS.MUTED_GRAY,
    },
    mutedLabel: {
        fontFamily: "DM Sans",
        fontSize: 8,
        color: COLORS.MUTED_GRAY,
    },
});
