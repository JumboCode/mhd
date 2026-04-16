export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;

export function isYearInRange(year: number): boolean {
    return Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR;
}

export function parseYear(value: unknown): number | null {
    const numericValue =
        typeof value === "number"
            ? value
            : typeof value === "string"
              ? Number(value.trim())
              : Number.NaN;

    return isYearInRange(numericValue) ? numericValue : null;
}
