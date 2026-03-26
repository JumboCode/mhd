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
import { schools, projects, yearlyTeacherParticipation } from "@/lib/schema";
import { eq, sql, and, sum } from "drizzle-orm";
import { findRegionOf } from "@/lib/region-finder";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ name: string }> },
) {
    try {
        const { name } = await params;

        const body = await req.json();
        const { latitude, longitude } = body;

        if (
            typeof latitude !== "number" ||
            typeof longitude !== "number" ||
            isNaN(latitude) ||
            isNaN(longitude)
        ) {
            return NextResponse.json(
                { error: "Invalid latitude or longitude" },
                { status: 400 },
            );
        }

        const schoolResult = await db
            .select({ id: schools.id })
            .from(schools)
            .where(eq(schools.standardizedName, name))
            .limit(1);

        if (!schoolResult || schoolResult.length === 0) {
            return NextResponse.json(
                { error: "School not found" },
                { status: 404 },
            );
        }

        const region: string = findRegionOf(latitude, longitude);

        await db
            .update(schools)
            .set({
                latitude: latitude,
                longitude: longitude,
                region: region as string,
            })
            .where(eq(schools.id, schoolResult[0].id));

        return NextResponse.json({
            message: "School location updated successfully",
            latitude,
            longitude,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error: " + (error as Error).message },
            { status: 500 },
        );
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ name: string }> },
) {
    try {
        const { searchParams } = new URL(req.url);
        const year = Number(searchParams.get("year"));
        const { name } = await params;

        // Match on lowercase formatted name
        const schoolResult = await db
            .select()
            .from(schools)
            .where(eq(schools.standardizedName, name))
            .limit(1);

        // Check if school exists
        if (!schoolResult || schoolResult.length === 0) {
            return NextResponse.json(
                { error: "School not found" },
                { status: 404 },
            );
        }

        const school = schoolResult[0];

        const studentCount = await db
            .select({ total: sum(projects.numStudents) })
            .from(projects)
            .where(
                and(eq(projects.schoolId, school.id), eq(projects.year, year)),
            );

        const teacherCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(yearlyTeacherParticipation)
            .where(
                and(
                    eq(yearlyTeacherParticipation.schoolId, school.id),
                    eq(yearlyTeacherParticipation.year, year),
                ),
            );

        const projectCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(projects)
            .where(
                and(eq(projects.schoolId, school.id), eq(projects.year, year)),
            );

        const projectRows = await db
            .select({
                id: projects.id,
                title: projects.title,
                numStudents: projects.numStudents,
                year: projects.year,
            })
            .from(projects)
            .where(
                and(eq(projects.schoolId, school.id), eq(projects.year, year)),
            );

        // First year would be minimum year found in a school's projects
        const firstYearData = await db
            .select({ year: sql<number>`min(${projects.year})` })
            .from(projects)
            .where(eq(projects.schoolId, school.id));

        return NextResponse.json({
            name: school.name,
            town: school.town,
            region: school.region,
            latitude: school.latitude,
            longitude: school.longitude,
            studentCount: studentCount[0]?.total
                ? Number(studentCount[0].total)
                : 0,
            teacherCount: teacherCount[0]?.count ?? 0,
            projectCount: projectCount[0]?.count ?? 0,
            firstYear: firstYearData[0]?.year ?? null,
            projects: projectRows,
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
