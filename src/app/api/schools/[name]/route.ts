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
    teachers,
    yearlyTeacherParticipation,
    yearlySchoolParticipation,
} from "@/lib/schema";
import { eq, sql, and, sum } from "drizzle-orm";
import { findRegionOf } from "@/lib/region-finder";

type YearlySchoolFields = {
    division?: string[];
    implementationModel?: string;
    schoolType?: string;
};

async function upsertYearlySchoolData(
    schoolId: number,
    year: number,
    fields: YearlySchoolFields,
) {
    const existing = await db.query.yearlySchoolParticipation.findFirst({
        where: and(
            eq(yearlySchoolParticipation.schoolId, schoolId),
            eq(yearlySchoolParticipation.year, year),
        ),
    });
    if (existing) {
        await db
            .update(yearlySchoolParticipation)
            .set(fields)
            .where(eq(yearlySchoolParticipation.id, existing.id));
    } else {
        await db.insert(yearlySchoolParticipation).values({
            schoolId,
            year,
            ...fields,
        });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ name: string }> },
) {
    try {
        const { name } = await params;

        const body = await req.json();
        const {
            latitude,
            longitude,
            name: newName,
            city,
            implementationModel,
            schoolType,
            division,
            year,
        } = body;

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

        const schoolId = schoolResult[0].id;

        // Handle city update
        if (city !== undefined) {
            if (typeof city !== "string" || city.trim() === "") {
                return NextResponse.json(
                    { error: "city must be a non-empty string" },
                    { status: 400 },
                );
            }
            await db
                .update(schools)
                .set({ town: city.trim() })
                .where(eq(schools.id, schoolId));
            return NextResponse.json({ message: "City updated successfully" });
        }

        // Handle school name update
        if (newName !== undefined) {
            if (typeof newName !== "string" || newName.trim() === "") {
                return NextResponse.json(
                    { error: "name must be a non-empty string" },
                    { status: 400 },
                );
            }
            await db
                .update(schools)
                .set({ name: newName.trim() })
                .where(eq(schools.id, schoolId));
            return NextResponse.json({
                message: "School name updated successfully",
            });
        }

        // Handle division update
        if (division !== undefined) {
            if (
                !Array.isArray(division) ||
                division.some((d: unknown) => typeof d !== "string")
            ) {
                return NextResponse.json(
                    { error: "division must be an array of strings" },
                    { status: 400 },
                );
            }
            if (!year) {
                return NextResponse.json(
                    { error: "year is required for division updates" },
                    { status: 400 },
                );
            }
            await upsertYearlySchoolData(schoolId, year, { division });
            return NextResponse.json({
                message: "Division updated successfully",
            });
        }

        // Handle implementation model update
        if (implementationModel !== undefined) {
            if (typeof implementationModel !== "string") {
                return NextResponse.json(
                    { error: "implementationModel must be a string" },
                    { status: 400 },
                );
            }
            if (!year) {
                return NextResponse.json(
                    {
                        error: "year is required for implementationModel updates",
                    },
                    { status: 400 },
                );
            }
            await upsertYearlySchoolData(schoolId, year, {
                implementationModel: implementationModel.trim(),
            });
            return NextResponse.json({
                message: "Implementation model updated successfully",
            });
        }

        // Handle schoolType update
        if (schoolType !== undefined) {
            if (typeof schoolType !== "string") {
                return NextResponse.json(
                    { error: "schoolType must be a string" },
                    { status: 400 },
                );
            }
            if (!year) {
                return NextResponse.json(
                    { error: "year is required for schoolType updates" },
                    { status: 400 },
                );
            }
            await upsertYearlySchoolData(schoolId, year, {
                schoolType: schoolType.trim(),
            });
            return NextResponse.json({
                message: "School type updated successfully",
            });
        }

        // Handle location update
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

        const region: string = findRegionOf(latitude, longitude);

        await db
            .update(schools)
            .set({ latitude, longitude, region })
            .where(eq(schools.id, schoolId));

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

        // Match on standardized name
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
                category: projects.category,
                categoryId: projects.categoryId,
                division: projects.division,
                teamProject: projects.teamProject,
                numStudents: projects.numStudents,
                year: projects.year,
                teacherId: teachers.id,
                teacherName: teachers.name,
                teacherEmail: teachers.email,
            })
            .from(projects)
            .innerJoin(teachers, eq(teachers.id, projects.teacherId))
            .where(
                and(eq(projects.schoolId, school.id), eq(projects.year, year)),
            );

        // First year would be minimum year found in a school's projects
        const firstYearData = await db
            .select({ year: sql<number>`min(${projects.year})` })
            .from(projects)
            .where(eq(projects.schoolId, school.id));

        const yearlyData = await db.query.yearlySchoolParticipation.findFirst({
            where: and(
                eq(yearlySchoolParticipation.schoolId, school.id),
                eq(yearlySchoolParticipation.year, year),
            ),
        });

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
            division: yearlyData?.division ?? [],
            implementationModel: yearlyData?.implementationModel ?? "",
            schoolType: yearlyData?.schoolType ?? "",
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error: " + (error as Error).message },
            { status: 500 },
        );
    }
}
