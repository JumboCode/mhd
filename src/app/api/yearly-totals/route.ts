import { NextResponse } from "next/server";
import { getYearlyStats, getAllYearsStats } from "@/lib/yearlyTotals";
import { yearQuerySchema } from "@/lib/api-schemas";
import {
    parseOrError,
    searchParamsToObject,
    internalError,
} from "@/lib/api-utils";

export async function GET(req: Request) {
    try {
        const parsed = parseOrError(yearQuerySchema, searchParamsToObject(req));
        if (!parsed.success) return parsed.response;

        const { year } = parsed.data;

        const [yearlyStats, allYearsStats] = await Promise.all([
            getYearlyStats(year),
            getAllYearsStats(),
        ]);

        const prevYearStats =
            allYearsStats.find((s) => s.year === year - 1) ?? null;

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
    } catch {
        return internalError();
    }
}
