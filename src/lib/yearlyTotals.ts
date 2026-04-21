import { db } from "@/lib/db";
import { projects, yearlySchoolParticipation } from "@/lib/schema";
import { eq, count, sum, countDistinct, asc } from "drizzle-orm";

async function getCompetingStudentsByYear(): Promise<Map<number, number>> {
    const rows = await db
        .select({
            year: yearlySchoolParticipation.year,
            total: sum(yearlySchoolParticipation.competingStudents),
        })
        .from(yearlySchoolParticipation)
        .groupBy(yearlySchoolParticipation.year);

    return new Map(
        rows.map((r) => [r.year, r.total ? Number(r.total) : 0] as const),
    );
}

export async function getYearlyStats(year: number) {
    // Totals Query
    const [result] = await db
        .select({
            total_schools: countDistinct(projects.schoolId),
            total_teachers: countDistinct(projects.teacherId),
            total_projects: count(projects.id),
            total_students: sum(projects.numStudents),
        })
        .from(projects)
        .where(eq(projects.year, year));

    const [competingRow] = await db
        .select({
            total: sum(yearlySchoolParticipation.competingStudents),
        })
        .from(yearlySchoolParticipation)
        .where(eq(yearlySchoolParticipation.year, year));

    const total_competing_students = competingRow?.total
        ? Number(competingRow.total)
        : 0;

    // Handle case when no data exists for the year
    if (!result) {
        return {
            year,
            totals: {
                total_schools: 0,
                total_teachers: 0,
                total_projects: 0,
                total_students: 0,
                total_competing_students,
                total_participating_students: 0,
            },
        };
    }

    const total_participating_students = result.total_students
        ? Number(result.total_students)
        : 0;

    // Convert sum result from string to number
    const totals = {
        total_schools: result.total_schools || 0,
        total_teachers: result.total_teachers || 0,
        total_projects: result.total_projects || 0,
        // `total_students` retained for backward-compat; it represents
        // participating (row-count-based) students.
        total_students: total_participating_students,
        total_competing_students,
        total_participating_students,
    };

    return { year, totals };
}

/**
 * Get stats for all years - used for sparkline historical data
 */
export async function getAllYearsStats() {
    const results = await db
        .select({
            year: projects.year,
            total_schools: countDistinct(projects.schoolId),
            total_teachers: countDistinct(projects.teacherId),
            total_projects: count(projects.id),
            total_students: sum(projects.numStudents),
        })
        .from(projects)
        .groupBy(projects.year)
        .orderBy(asc(projects.year));

    const competingByYear = await getCompetingStudentsByYear();

    return results.map((row) => {
        const total_participating_students = row.total_students
            ? Number(row.total_students)
            : 0;
        const total_competing_students = competingByYear.get(row.year) ?? 0;
        return {
            year: row.year,
            total_schools: row.total_schools || 0,
            total_teachers: row.total_teachers || 0,
            total_projects: row.total_projects || 0,
            total_students: total_participating_students,
            total_competing_students,
            total_participating_students,
        };
    });
}
