/***************************************************************
 *
 *                /api/import/route.ts
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
import { requiredColumns } from "@/lib/required-spreadsheet-columns";

type RowData = Array<string | number | boolean | null>;

export async function POST(req: NextRequest) {
    try {
        const jsonReq = await req.json();
        const year: number = jsonReq.formYear;
        const rawData: RowData[] = JSON.parse(jsonReq.formData);

        if (rawData.length === 0) {
            return NextResponse.json(
                { message: "No data provided" },
                { status: 400 },
            );
        }

        // Get header row and normalize column names for lookup
        const headers = rawData[0] as string[];
        const normalizeColumnName = (name: string): string => {
            return name.toLowerCase().replace(/\s+/g, "");
        };

        // Create a map of normalized header names to their column indices
        const headerMap = new Map<string, number>();
        headers.forEach((header, index) => {
            headerMap.set(normalizeColumnName(header), index);
        });

        // Helper function to find column index by name
        const getColumnIndex = (columnName: string): number | undefined => {
            return headerMap.get(normalizeColumnName(columnName));
        };

        // Build column indices object dynamically
        const COLUMN_INDICES: Record<string, number> = {};
        requiredColumns.forEach((col) => {
            const index = getColumnIndex(col);
            if (index !== undefined) {
                COLUMN_INDICES[col] = index;
            }
        });

        // Validate all required columns exist
        const missingColumns = requiredColumns.filter(
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

        let insertedCount = 0;
        for (const row of filteredRows) {
            // Find or create school using schoolId
            const schoolIdValue = String(row[COLUMN_INDICES.schoolId]);
            let school = await db.query.schools.findFirst({
                where: eq(schools.schoolId, schoolIdValue),
            });

            if (!school) {
                const [inserted] = await db
                    .insert(schools)
                    .values({
                        schoolId: schoolIdValue,
                        name: row[COLUMN_INDICES.schoolName] as string,
                        town: row[COLUMN_INDICES.city] as string,
                    })
                    .returning();
                school = inserted;
            }

            // Find or create teacher using teacherId
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
                        division: "General", // TO DO: Update if division column is added
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
