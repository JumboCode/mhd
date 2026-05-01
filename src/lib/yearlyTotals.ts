import { db } from "@/lib/db";
import {
    projects,
    yearlySchoolParticipation,
    yearlyTeacherParticipation,
} from "@/lib/schema";
import { eq, count, sum, countDistinct, asc } from "drizzle-orm";

async function getTeacherCountByYear(): Promise<Map<number, number>> {
    const rows = await db
        .select({
            year: yearlyTeacherParticipation.year,
            total: countDistinct(yearlyTeacherParticipation.teacherId),
        })
        .from(yearlyTeacherParticipation)
        .groupBy(yearlyTeacherParticipation.year);

    return new Map(rows.map((r) => [r.year, r.total] as const));
}

async function getSchoolCountByYear(): Promise<Map<number, number>> {
    const rows = await db
        .select({
            year: yearlySchoolParticipation.year,
            total: countDistinct(yearlySchoolParticipation.schoolId),
        })
        .from(yearlySchoolParticipation)
        .groupBy(yearlySchoolParticipation.year);

    return new Map(rows.map((r) => [r.year, r.total] as const));
}

async function getCompetingStudentsByYear(): Promise<Map<number, number>> {
    const rows = await db
        .select({
            year: yearlySchoolParticipation.year,
            total: sum(yearlySchoolParticipation.competingStudents),
        })
        .from(yearlySchoolParticipation)
        .groupBy(yearlySchoolParticipation.year);

    return new Map(rows.map((r) => [r.year, Number(r.total)] as const));
}

export async function getYearlyStats(year: number) {
    const [schoolRow] = await db
        .select({
            total_schools: countDistinct(yearlySchoolParticipation.schoolId),
        })
        .from(yearlySchoolParticipation)
        .where(eq(yearlySchoolParticipation.year, year));

    const [[teacherRow], [result], [competingRow]] = await Promise.all([
        db
            .select({
                total_teachers: countDistinct(
                    yearlyTeacherParticipation.teacherId,
                ),
            })
            .from(yearlyTeacherParticipation)
            .where(eq(yearlyTeacherParticipation.year, year)),
        db
            .select({
                total_projects: count(projects.id),
                total_participating_students: sum(projects.numStudents),
            })
            .from(projects)
            .where(eq(projects.year, year)),
        db
            .select({
                total: sum(yearlySchoolParticipation.competingStudents),
            })
            .from(yearlySchoolParticipation)
            .where(eq(yearlySchoolParticipation.year, year)),
    ]);

    const total_competing_students = Number(competingRow?.total);
    const total_schools = schoolRow?.total_schools ?? 0;
    const total_teachers = teacherRow?.total_teachers ?? 0;

    if (!result) {
        return {
            year,
            totals: {
                total_schools,
                total_teachers,
                total_projects: 0,
                total_competing_students,
                total_participating_students: 0,
            },
        };
    }

    const totals = {
        total_schools,
        total_teachers,
        total_projects: result.total_projects || 0,
        total_competing_students,
        total_participating_students: Number(
            result.total_participating_students,
        ),
    };

    return { year, totals };
}

/**
 * Get stats for all years - used for sparkline historical data
 */
export async function getAllYearsStats() {
    const [results, schoolCountByYear, teacherCountByYear, competingByYear] =
        await Promise.all([
            db
                .select({
                    year: projects.year,
                    total_projects: count(projects.id),
                    total_participating_students: sum(projects.numStudents),
                })
                .from(projects)
                .groupBy(projects.year)
                .orderBy(asc(projects.year)),
            getSchoolCountByYear(),
            getTeacherCountByYear(),
            getCompetingStudentsByYear(),
        ]);

    return results.map((row) => ({
        year: row.year,
        total_schools: schoolCountByYear.get(row.year) ?? 0,
        total_teachers: teacherCountByYear.get(row.year) ?? 0,
        total_projects: row.total_projects || 0,
        total_competing_students: competingByYear.get(row.year) ?? 0,
        total_participating_students: Number(row.total_participating_students),
    }));
}
