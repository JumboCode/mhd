/***************************************************************
 *
 *                /api/upload/route.ts
 *
 *         Author: Anne Wu & Chiara Martello
 *           Date: 11/17/2025
 *
 *        Summary: API route responsible for getting excel sheet data and
 *                 inserting that data into a NEON database with drizzle.
 *
 **************************************************************/

import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
    schools,
    teachers,
    projects,
    yearlyTeacherParticipation,
    yearlySchoolParticipation,
} from "@/lib/schema";
import { studentRequiredColumns } from "@/lib/required-spreadsheet-columns";
import { standardize } from "@/lib/school-name-standardize";
import { findRegionOf } from "@/lib/region-finder";

type RowData = Array<string | number | boolean | null>;

type SchoolCoordinateData = {
    schoolId: string;
    lat: number | null;
    long: number | null;
};

type SchoolInfoEntry = {
    division: string;
    implementationModel: string;
    schoolType: string;
};

/**
 * Builds a lookup map from schoolId to school info fields using the school info spreadsheet.
 * Matches rows by schoolId column (case/whitespace-insensitive header match).
 */
function buildSchoolInfoMap(rawData: RowData[]): Map<string, SchoolInfoEntry> {
    const map = new Map<string, SchoolInfoEntry>();
    if (!rawData || rawData.length === 0) return map;

    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");

    const headers = rawData[0] as string[];
    const headerMap = new Map<string, number>();
    headers.forEach((h, i) => headerMap.set(normalize(h), i));

    const schoolIdIdx =
        headerMap.get(normalize("schoolId")) ??
        headerMap.get(normalize("School id"));
    const divisionIdx = headerMap.get(normalize("division"));
    const implModelIdx =
        headerMap.get(normalize("implementationModel")) ??
        headerMap.get(normalize("Implementation Model"));
    const schoolTypeIdx =
        headerMap.get(normalize("schoolType")) ??
        headerMap.get(normalize("School Type"));

    if (schoolIdIdx === undefined) return map;

    for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];
        const rawId = row[schoolIdIdx];
        if (rawId === null || rawId === undefined || rawId === "") continue;

        const schoolId = String(rawId).trim();
        map.set(schoolId, {
            division:
                divisionIdx !== undefined
                    ? String(row[divisionIdx] ?? "").trim()
                    : "",
            implementationModel:
                implModelIdx !== undefined
                    ? String(row[implModelIdx] ?? "").trim()
                    : "",
            schoolType:
                schoolTypeIdx !== undefined
                    ? String(row[schoolTypeIdx] ?? "").trim()
                    : "",
        });
    }

    return map;
}

export async function POST(req: NextRequest) {
    try {
        const jsonReq = await req.json();
        const year: number = jsonReq.formYear;
        const rawData: RowData[] = JSON.parse(jsonReq.formData);
        const schoolCoordinates: SchoolCoordinateData[] =
            jsonReq.schoolCoordinates || [];

        // Parse the school info spreadsheet if provided
        const schoolInfoMap: Map<string, SchoolInfoEntry> =
            jsonReq.schoolInfoData
                ? buildSchoolInfoMap(JSON.parse(jsonReq.schoolInfoData))
                : new Map();

        // Build coordinates lookup
        const coordsMap = new Map<
            string,
            { lat: number | null; long: number | null }
        >();
        for (const coord of schoolCoordinates) {
            coordsMap.set(coord.schoolId, { lat: coord.lat, long: coord.long });
        }

        if (rawData.length === 0) {
            return NextResponse.json(
                { message: "No data provided" },
                { status: 400 },
            );
        }

        // Get header row and normalize column names for lookup
        const headers = rawData[0] as string[];
        const normalizeColumnName = (name: string): string =>
            name.toLowerCase().replace(/\s+/g, "");

        const headerMap = new Map<string, number>();
        headers.forEach((header, index) => {
            headerMap.set(normalizeColumnName(header), index);
        });

        const getColumnIndex = (columnName: string): number | undefined =>
            headerMap.get(normalizeColumnName(columnName));

        // Build column indices dynamically from student required columns
        const COLUMN_INDICES: Record<string, number> = {};
        studentRequiredColumns.forEach((col) => {
            const index = getColumnIndex(col);
            if (index !== undefined) {
                COLUMN_INDICES[col] = index;
            }
        });

        const missingColumns = studentRequiredColumns.filter(
            (col) => COLUMN_INDICES[col] === undefined,
        );

        if (missingColumns.length > 0) {
            return NextResponse.json(
                {
                    message: `Missing required columns: ${missingColumns.join(", ")}`,
                },
                { status: 400 },
            );
        }

        // Remove header row and filter out empty rows
        const filteredRows = rawData.slice(1).filter((row) => row.length > 0);

        // Delete any existing data before uploading new data
        await db.delete(projects).where(eq(projects.year, year));
        await db
            .delete(yearlySchoolParticipation)
            .where(eq(yearlySchoolParticipation.year, year));
        await db
            .delete(yearlyTeacherParticipation)
            .where(eq(yearlyTeacherParticipation.year, year));

        let insertedCount = 0;
        for (const row of filteredRows) {
            const schoolIdValue = String(row[COLUMN_INDICES.schoolId]);
            let school = await db.query.schools.findFirst({
                where: eq(schools.schoolId, schoolIdValue),
            });

            const schoolName = row[COLUMN_INDICES.schoolName] as string;
            const schoolTown = row[COLUMN_INDICES.city] as string;
            const schoolInfo = schoolInfoMap.get(schoolIdValue);

            if (!school) {
                const coords = coordsMap.get(schoolIdValue);
                const region = findRegionOf(coords?.lat, coords?.long);

                const [inserted] = await db
                    .insert(schools)
                    .values({
                        schoolId: schoolIdValue,
                        name: schoolName,
                        standardizedName: standardize(schoolName),
                        town: schoolTown,
                        latitude: coords?.lat ?? null,
                        longitude: coords?.long ?? null,
                        region: region,
                        division: schoolInfo?.division ?? "",
                        implementationModel:
                            schoolInfo?.implementationModel ?? "",
                        schoolType: schoolInfo?.schoolType ?? "",
                    })
                    .returning();
                school = inserted;
            } else {
                // Update coordinates if missing, and always update school info fields
                const coords = coordsMap.get(schoolIdValue);
                const needsCoordUpdate =
                    (!school.latitude || !school.longitude) &&
                    coords?.lat &&
                    coords?.long;

                if (needsCoordUpdate || schoolInfo) {
                    const [updated] = await db
                        .update(schools)
                        .set({
                            ...(needsCoordUpdate && {
                                latitude: coords!.lat,
                                longitude: coords!.long,
                            }),
                            ...(schoolInfo && {
                                division: schoolInfo.division,
                                implementationModel:
                                    schoolInfo.implementationModel,
                                schoolType: schoolInfo.schoolType,
                            }),
                        })
                        .where(eq(schools.id, school.id))
                        .returning();
                    school = updated;
                }
            }

            // Find or create teacher
            const teacherIdValue = String(row[COLUMN_INDICES.teacherId]);
            let teacher = await db.query.teachers.findFirst({
                where: eq(teachers.teacherId, teacherIdValue),
            });

            if (!teacher) {
                const [inserted] = await db
                    .insert(teachers)
                    .values({
                        teacherId: teacherIdValue,
                        name: row[COLUMN_INDICES.teacherName] as string,
                        email: row[COLUMN_INDICES.teacherEmail] as string,
                    })
                    .returning();
                teacher = inserted;
            }

            // Find or create project using projectId
            const projectIdValue = String(row[COLUMN_INDICES.projectId]);
            let project = await db.query.projects.findFirst({
                where: and(
                    eq(projects.projectId, projectIdValue),
                    eq(projects.year, year),
                    eq(projects.schoolId, school.id),
                ),
            });

            if (!project) {
                const [inserted] = await db
                    .insert(projects)
                    .values({
                        schoolId: school.id,
                        teacherId: teacher.id,
                        projectId: projectIdValue,
                        title: row[COLUMN_INDICES.title] as string,
                        division: schoolInfo?.division ?? "",
                        categoryId: String(row[COLUMN_INDICES.categoryId]),
                        category: row[COLUMN_INDICES.categoryName] as string,
                        year: year,
                        teamProject: row[COLUMN_INDICES.teamProject] === "True",
                        numStudents: 1,
                    })
                    .returning();
                project = inserted;
            } else {
                // Project exists, so increment student count
                const [updated] = await db
                    .update(projects)
                    .set({ numStudents: project.numStudents + 1 })
                    .where(eq(projects.id, project.id))
                    .returning();
                project = updated;
            }

            // Track teacher participation for this year
            const existingYearlyTeacher =
                await db.query.yearlyTeacherParticipation.findFirst({
                    where: and(
                        eq(yearlyTeacherParticipation.year, year),
                        eq(yearlyTeacherParticipation.teacherId, teacher.id),
                        eq(yearlyTeacherParticipation.schoolId, school.id),
                    ),
                });

            if (!existingYearlyTeacher) {
                await db.insert(yearlyTeacherParticipation).values({
                    year: year,
                    teacherId: teacher.id,
                    schoolId: school.id,
                });
            }

            // Track school participation for this year
            const existingYearlySchool =
                await db.query.yearlySchoolParticipation.findFirst({
                    where: and(
                        eq(yearlySchoolParticipation.year, year),
                        eq(yearlySchoolParticipation.schoolId, school.id),
                    ),
                });

            if (!existingYearlySchool) {
                await db.insert(yearlySchoolParticipation).values({
                    year: year,
                    schoolId: school.id,
                });
            }

            insertedCount++;
        }

        return NextResponse.json(
            { message: "Upload successful", rowsProcessed: insertedCount },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Import failed", error: String(error) },
            { status: 500 },
        );
    }
}
