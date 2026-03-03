import { db } from "@/lib/db";
import { projects } from "@/lib/schema";
import { eq, count, sum, countDistinct, asc } from "drizzle-orm";

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

    // Handle case when no data exists for the year
    if (!result) {
        return {
            year,
            totals: {
                total_schools: 0,
                total_teachers: 0,
                total_projects: 0,
                total_students: 0,
            },
        };
    }

    // Convert sum result from string to number
    const totals = {
        total_schools: result.total_schools || 0,
        total_teachers: result.total_teachers || 0,
        total_projects: result.total_projects || 0,
        total_students: result.total_students
            ? Number(result.total_students)
            : 0,
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

    return results.map((row) => ({
        year: row.year,
        total_schools: row.total_schools || 0,
        total_teachers: row.total_teachers || 0,
        total_projects: row.total_projects || 0,
        total_students: row.total_students ? Number(row.total_students) : 0,
    }));
}
