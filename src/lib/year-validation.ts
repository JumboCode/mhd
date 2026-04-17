import { z } from "zod";

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;

export const yearSchema = z.coerce.number().int().min(MIN_YEAR).max(MAX_YEAR);

export function isYearInRange(year: number): boolean {
    return yearSchema.safeParse(year).success;
}

/** Parses a year value, clamping it to [min, max]. Returns fallback if invalid. */
export function safeParseYear(
    value: string | number,
    min: number,
    max: number,
    fallback: number,
): number {
    const result = z.coerce.number().int().min(min).max(max).safeParse(value);
    return result.success ? result.data : fallback;
}

/** Clamps start/end to [min, max] and swaps them if start > end. */
export function normalizeYearRange(
    start: number,
    end: number,
    min: number,
    max: number,
) {
    const s = safeParseYear(start, min, max, min);
    const e = safeParseYear(end, min, max, max);
    return s <= e ? { start: s, end: e } : { start: e, end: s };
}
