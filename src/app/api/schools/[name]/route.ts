import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
    schools,
    projects,
    students,
    yearlyTeacherParticipation,
} from "@/lib/schema";
import { eq, sql, and } from "drizzle-orm";
import { equal } from "assert";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> },
) {
    try {
        const { name } = await params;
        const searchName = name.replace(/-/g, " ");

        // match on lowercase formatted name
        const schoolResult = await db
            .select()
            .from(schools)
            .where(sql`LOWER(${schools.name}) = LOWER(${searchName})`)
            .limit(1);

        const school = schoolResult[0];

        // get past year with javascript Date
        const currentYear = new Date().getFullYear();
        const pastYear = currentYear - 1;

        // students by project year
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
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(projects)
            .where(
                and(
                    eq(projects.schoolId, school.id),
                    eq(projects.year, pastYear),
                ),
            );

        // first year would be minimum year found in a school's projects
        const firstYearData = await db
            .select({ year: sql<number>`min(${projects.year})` })
            .from(projects)
            .where(eq(projects.schoolId, school.id));

        return NextResponse.json({
            name: school.name,
            town: school.town,
            studentCount: studentCount[0]?.count || 0,
            teacherCount: teacherCount[0]?.count || 0,
            projectCount: projectCount[0]?.count || 0,
            firstYear: firstYearData[0]?.year || null,
            // instructional model not in database yet
            instructionalModel: "normal",
        });
    } catch (error) {
        // indicate if attempting to fetch invalid school
        return NextResponse.json({
            name: "Invalid School",
            town: "N/A",
            studentCount: "N/A",
            teacherCount: "N/A",
            projectCount: "N/A",
            firstYear: "N/A",
            instructionalModel: "N/A",
        });
    }
}
