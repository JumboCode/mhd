import { NextResponse } from "next/server";
import { getYearlyStats, getAllYearsStats } from "@/lib/yearlyTotals";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const year: string | null = searchParams.get("year");

        if (year === null) {
            return NextResponse.json(
                { error: "Expected year but received null" },
                { status: 400 },
            );
        }

        const yearNum: number = parseInt(year);
        const [yearlyStats, allYearsStats] = await Promise.all([
            getYearlyStats(yearNum),
            getAllYearsStats(),
        ]);

        // Calculate year-over-year percentage changes against the immediately
        // preceding chronological year. If that year has no data (gap in the
        // dataset), treat as no trend rather than skipping back to the last
        // year that does have data.
        const prevYearStats =
            allYearsStats.find((s) => s.year === yearNum - 1) ?? null;

        const percentChanges = prevYearStats
            ? {
                  projects:
                      prevYearStats.total_projects > 0
                          ? ((yearlyStats.totals.total_projects -
                                prevYearStats.total_projects) /
                                prevYearStats.total_projects) *
                            100
                          : null,
                  teachers:
                      prevYearStats.total_teachers > 0
                          ? ((yearlyStats.totals.total_teachers -
                                prevYearStats.total_teachers) /
                                prevYearStats.total_teachers) *
                            100
                          : null,
                  students:
                      prevYearStats.total_students > 0
                          ? ((yearlyStats.totals.total_students -
                                prevYearStats.total_students) /
                                prevYearStats.total_students) *
                            100
                          : null,
                  schools:
                      prevYearStats.total_schools > 0
                          ? ((yearlyStats.totals.total_schools -
                                prevYearStats.total_schools) /
                                prevYearStats.total_schools) *
                            100
                          : null,
              }
            : null;

        return NextResponse.json(
            { yearlyStats, allYearsStats, percentChanges },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Failed to fetch yearly data" + error },
            { status: 500 },
        );
    }
}
