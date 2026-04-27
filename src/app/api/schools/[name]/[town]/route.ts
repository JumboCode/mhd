/***************************************************************
 *
 *                /api/schools/[name]/[town]/route.ts
 *
 *         Author: Elki Laranas & Hansini Gundavarapu
 *           Date: 11/16/2025
 *
 *        Summary: Backend endpoint to fetch individual school profile
 *                 data, identified by standardized name + town.
 *
 **************************************************************/

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
    schools,
    schoolHistoricNames,
    projects,
    teachers,
    yearlyTeacherParticipation,
    yearlySchoolParticipation,
} from "@/lib/schema";
import { eq, sql, and, sum } from "drizzle-orm";
import { findRegionOf } from "@/lib/region-finder";
import { schoolPatchBodySchema } from "@/lib/api-schemas";
import { parseOrError, internalError } from "@/lib/api-utils";

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

// Converts a URL town segment (e.g. "north-andover") to a lowercase string
// suitable for case-insensitive comparison with the DB town column.
function decodeTownSegment(segment: string): string {
    return segment.replace(/-/g, " ");
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ name: string; town: string }> },
) {
    try {
        const { name, town } = await params;
        const townQuery = decodeTownSegment(town);

        const body = await req.json();
        const parsed = parseOrError(schoolPatchBodySchema, body);
        if (!parsed.success) return parsed.response;

        const {
            latitude,
            longitude,
            name: newName,
            city,
            implementationModel,
            schoolType,
            division,
            year,
        } = parsed.data;

        const schoolResult = await db
            .select({ id: schools.id })
            .from(schools)
            .where(
                and(
                    eq(schools.standardizedName, name),
                    sql`LOWER(${schools.town}) = ${townQuery}`,
                ),
            )
            .limit(1);

        if (!schoolResult || schoolResult.length === 0) {
            return NextResponse.json(
                { error: "School not found" },
                { status: 404 },
            );
        }

        const schoolId = schoolResult[0].id;

        if (city !== undefined) {
            await db
                .update(schools)
                .set({ town: city })
                .where(eq(schools.id, schoolId));
            return NextResponse.json({ message: "City updated successfully" });
        }

        if (newName !== undefined) {
            await db
                .update(schools)
                .set({ name: newName })
                .where(eq(schools.id, schoolId));
            return NextResponse.json({
                message: "School name updated successfully",
            });
        }

        if (division !== undefined) {
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

        if (implementationModel !== undefined) {
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

        if (schoolType !== undefined) {
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

        if (typeof latitude !== "number" || typeof longitude !== "number") {
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
    } catch {
        return internalError();
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ name: string; town: string }> },
) {
    try {
        const { searchParams } = new URL(req.url);
        const year = Number(searchParams.get("year"));
        const { name, town } = await params;
        const townQuery = decodeTownSegment(town);

        // Match on standardized name + town (mirrors the DB unique constraint)
        const schoolResult = await db
            .select()
            .from(schools)
            .where(
                and(
                    eq(schools.standardizedName, name),
                    sql`LOWER(${schools.town}) = ${townQuery}`,
                ),
            )
            .limit(1);

        // Check if school exists; if not, check if it's a historic name (merged away)
        if (!schoolResult || schoolResult.length === 0) {
            const historic = await db
                .select({
                    absorbingSchoolId: schoolHistoricNames.absorbingSchoolId,
                })
                .from(schoolHistoricNames)
                .where(eq(schoolHistoricNames.mergedStandardizedName, name))
                .limit(1);

            if (historic.length > 0) {
                const absorbing = await db
                    .select({
                        standardizedName: schools.standardizedName,
                        town: schools.town,
                    })
                    .from(schools)
                    .where(eq(schools.id, historic[0].absorbingSchoolId))
                    .limit(1);

                if (absorbing.length > 0) {
                    const redirectTown = (absorbing[0].town ?? "")
                        .toLowerCase()
                        .replace(/\s+/g, "-");
                    return NextResponse.json(
                        {
                            redirectTo: absorbing[0].standardizedName,
                            redirectTown,
                        },
                        { status: 301 },
                    );
                }
            }

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

        const firstYearProjects = await db
            .select({ year: sql<number>`min(${projects.year})` })
            .from(projects)
            .where(eq(projects.schoolId, school.id));
        const firstYearTeachers = await db
            .select({
                year: sql<number>`min(${yearlyTeacherParticipation.year})`,
            })
            .from(yearlyTeacherParticipation)
            .where(eq(yearlyTeacherParticipation.schoolId, school.id));
        const firstYearSchools = await db
            .select({
                year: sql<number>`min(${yearlySchoolParticipation.year})`,
            })
            .from(yearlySchoolParticipation)
            .where(eq(yearlySchoolParticipation.schoolId, school.id));
        const firstYearData = Math.min(
            firstYearProjects[0].year,
            firstYearTeachers[0].year,
            firstYearSchools[0].year,
        );

        const yearlyData = await db.query.yearlySchoolParticipation.findFirst({
            where: and(
                eq(yearlySchoolParticipation.schoolId, school.id),
                eq(yearlySchoolParticipation.year, year),
            ),
        });

        const participatingStudentCount = studentCount[0]?.total
            ? Number(studentCount[0].total)
            : 0;

        return NextResponse.json({
            id: school.id,
            name: school.name,
            town: school.town,
            region: school.region,
            latitude: school.latitude,
            longitude: school.longitude,
            studentCount: participatingStudentCount,
            participatingStudentCount,
            competingStudents: yearlyData?.competingStudents ?? null,
            teacherCount: teacherCount[0]?.count ?? 0,
            projectCount: projectCount[0]?.count ?? 0,
            firstYear: firstYearData ?? null,
            projects: projectRows,
            division: yearlyData?.division ?? [],
            implementationModel: yearlyData?.implementationModel ?? "",
            schoolType: yearlyData?.schoolType ?? "",
        });
    } catch {
        return internalError();
    }
}
