/***************************************************************
 *
 *                /api/schools/route.ts
 *
 *         Author: Anne Wu & Justin Ngan
 *           Date: 11/16/2025
 *
 *        Summary: Backend endpoint to fetch all school data
 *
 **************************************************************/

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects, schools, yearlyTeacherParticipation } from "@/lib/schema";
import { count, eq, sum } from "drizzle-orm";

function percentageChange(curr: number, past: number) {
    return past !== 0 ? Math.round(((curr - past) / past) * 100) : undefined;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const yearString = searchParams.get("year");
        const currentYear = Number(yearString);

        if (!currentYear || isNaN(currentYear)) {
            return NextResponse.json(
                { message: "Invalid year parameter" },
                { status: 400 },
            );
        }

        // Fetch all schools
        const allSchools = await db
            .select({
                id: schools.id,
                name: schools.name,
                city: schools.town,
            })
            .from(schools);

        // Fetch project counts for current year grouped by school
        const currYearProjects = await db
            .select({
                schoolId: projects.schoolId,
                count: count(),
            })
            .from(projects)
            .where(eq(projects.year, currentYear))
            .groupBy(projects.schoolId);

        // Fetch project counts for last year grouped by school
        const lastYearProjects = await db
            .select({
                schoolId: projects.schoolId,
                count: count(),
            })
            .from(projects)
            .where(eq(projects.year, currentYear - 1))
            .groupBy(projects.schoolId);

        // Fetch student counts for current year grouped by school
        const currYearStudents = await db
            .select({
                schoolId: projects.schoolId,
                total: sum(projects.numStudents),
            })
            .from(projects)
            .where(eq(projects.year, currentYear))
            .groupBy(projects.schoolId);

        // Fetch student counts for last year grouped by school
        const lastYearStudents = await db
            .select({
                schoolId: projects.schoolId,
                total: sum(projects.numStudents),
            })
            .from(projects)
            .where(eq(projects.year, currentYear - 1))
            .groupBy(projects.schoolId);

        // Fetch teacher counts for current year grouped by school
        const currYearTeachers = await db
            .select({
                schoolId: yearlyTeacherParticipation.schoolId,
                count: count(),
            })
            .from(yearlyTeacherParticipation)
            .where(eq(yearlyTeacherParticipation.year, currentYear))
            .groupBy(yearlyTeacherParticipation.schoolId);

        // Fetch teacher counts for last year grouped by school
        const lastYearTeachers = await db
            .select({
                schoolId: yearlyTeacherParticipation.schoolId,
                count: count(),
            })
            .from(yearlyTeacherParticipation)
            .where(eq(yearlyTeacherParticipation.year, currentYear - 1))
            .groupBy(yearlyTeacherParticipation.schoolId);

        // Create lookup maps for O(1) access
        const currProjectsMap = new Map(
            currYearProjects.map((p) => [p.schoolId, p.count]),
        );
        const lastProjectsMap = new Map(
            lastYearProjects.map((p) => [p.schoolId, p.count]),
        );
        const currStudentsMap = new Map(
            currYearStudents.map((s) => [
                s.schoolId,
                s.total ? Number(s.total) : 0,
            ]),
        );
        const lastStudentsMap = new Map(
            lastYearStudents.map((s) => [
                s.schoolId,
                s.total ? Number(s.total) : 0,
            ]),
        );
        const currTeachersMap = new Map(
            currYearTeachers.map((t) => [t.schoolId, t.count]),
        );
        const lastTeachersMap = new Map(
            lastYearTeachers.map((t) => [t.schoolId, t.count]),
        );

        // Combine data for each school
        const schoolsToReturn = allSchools.map((school) => {
            const currProjects = currProjectsMap.get(school.id) ?? 0;
            const lastProjects = lastProjectsMap.get(school.id) ?? 0;
            const currStudents = currStudentsMap.get(school.id) ?? 0;
            const lastStudents = lastStudentsMap.get(school.id) ?? 0;
            const currTeachers = currTeachersMap.get(school.id) ?? 0;
            const lastTeachers = lastTeachersMap.get(school.id) ?? 0;

            return {
                name: school.name,
                city: school.city,
                region: school.city, // Using city as region since schema only has 'town'
                instructionModel: "N/A", // Not in schema
                implementationModel: "N/A", // Not in schema
                numStudents: currStudents,
                studentChange: percentageChange(currStudents, lastStudents),
                numTeachers: currTeachers,
                teacherChange: percentageChange(currTeachers, lastTeachers),
                numProjects: currProjects,
                projectChange: percentageChange(currProjects, lastProjects),
            };
        });

        return NextResponse.json(schoolsToReturn);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching school data:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}
