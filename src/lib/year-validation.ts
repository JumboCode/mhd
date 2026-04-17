import { z } from "zod";

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;

export const yearSchema = z.coerce.number().int().min(MIN_YEAR).max(MAX_YEAR);

export function isYearInRange(year: number): boolean {
    return yearSchema.safeParse(year).success;
}
