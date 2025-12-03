/***************************************************************
 *
 *                /api/schools/[name]/route.ts
 *
 *         Author: Elki Laranas & Hansini Gundavarapu
 *           Date: 11/16/2025
 *
 *        Summary: Backend endpoint to fetch individual school profile
 *                 data
 *
 **************************************************************/

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
    schools,
    projects,
    students,
    yearlyTeacherParticipation,
} from "@/lib/schema";
import { eq, sql, and } from "drizzle-orm";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ name: string }> },
) {
    try {
        const { name } = await params;
        const searchName = name.replace(/-/g, " ");

        // Match on lowercase formatted name
        const schoolResult = await db
            .select()
            .from(schools)
            .where(eq(sql`LOWER(${schools.name})`, searchName.toLowerCase()))
            .limit(1);

        // Check if school exists
        if (!schoolResult || schoolResult.length === 0) {
            return NextResponse.json(
                { error: "School not found" },
                { status: 404 },
            );
        }

        const school = schoolResult[0];
        const currentYear = new Date().getFullYear();
        const pastYear = currentYear - 1;

        const studentCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(students)
            .innerJoin(projects, eq(students.projectId, projects.id))
            .where(
                and(
                    eq(students.schoolId, school.id),
                    eq(projects.year, pastYear),
                ),
            );

        const teacherCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(yearlyTeacherParticipation)
            .where(
                and(
                    eq(yearlyTeacherParticipation.schoolId, school.id),
                    eq(yearlyTeacherParticipation.year, pastYear),
                ),
            );

        const projectCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(projects)
            .where(
                and(
                    eq(projects.schoolId, school.id),
                    eq(projects.year, pastYear),
                ),
            );

        // First year would be minimum year found in a school's projects
        const firstYearData = await db
            .select({ year: sql<number>`min(${projects.year})` })
            .from(projects)
            .where(eq(projects.schoolId, school.id));

        return NextResponse.json({
            name: school.name,
            town: school.town,
            studentCount: studentCount[0]?.count ?? 0,
            teacherCount: teacherCount[0]?.count ?? 0,
            projectCount: projectCount[0]?.count ?? 0,
            firstYear: firstYearData[0]?.year ?? null,
            // TO DO: Instructional model not in database yet
            instructionalModel: "normal",
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error: " + (error as Error).message },
            { status: 500 },
        );
    }
}
