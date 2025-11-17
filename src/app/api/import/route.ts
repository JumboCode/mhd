/**
 * route.ts (for data ingestion)
 * by Anne Wu and Chiara Martello
 * 11/16/25
 *
 * API route responsible for getting excel sheet data and inserting that data
 * into a NEON database with drizzle.
 */

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
    students,
    schools,
    teachers,
    projects,
    yearlyTeacherParticipation,
    yearlySchoolParticipation,
} from "@/lib/schema";

// Column indices from Excel file
const COLUMN_INDICES = {
    CITY: 0,
    GRADE: 1,
    DIVISION: 2,
    TEACHER_FIRST: 3,
    TEACHER_LAST: 4,
    TEACHER_EMAIL: 5,
    PROJECT_ID: 6,
    TITLE: 7,
    TEAM: 8,
    SCHOOL_NAME: 9,
} as const;

type RowData = Array<string | number | boolean | null>;

export async function POST(req: NextRequest) {
    try {
        const jsonReq = await req.json();
        const year: number = jsonReq.formYear;
        const rawData: RowData[] = JSON.parse(jsonReq.formData);

        // Extract only needed columns: city, grade, division, teacher first/last/email,
        // project id, title, team, school name
        const neededIndices = [4, 13, 17, 19, 20, 21, 23, 24, 34, 37];

        // Remove header row and filter out empty rows
        rawData.shift();
        const filteredRows = rawData
            .filter((row) => row.length > 0)
            .map((row) =>
                row.filter((_, index) => neededIndices.includes(index)),
            );

        let insertedCount = 0;

        for (const row of filteredRows) {
            // TO DO: town is per student currently, doesn't work for regional schools
            let school = await db.query.schools.findFirst({
                where: eq(
                    schools.name,
                    row[COLUMN_INDICES.SCHOOL_NAME] as string,
                ),
            });

            if (!school) {
                const [inserted] = await db
                    .insert(schools)
                    .values({
                        name: row[COLUMN_INDICES.SCHOOL_NAME] as string,
                        town: row[COLUMN_INDICES.CITY] as string,
                    })
                    .returning();
                school = inserted;
            }

            // Find or create teacher
            let teacher = await db.query.teachers.findFirst({
                where: and(
                    eq(
                        teachers.firstName,
                        row[COLUMN_INDICES.TEACHER_FIRST] as string,
                    ),
                    eq(
                        teachers.lastName,
                        row[COLUMN_INDICES.TEACHER_LAST] as string,
                    ),
                    eq(
                        teachers.email,
                        row[COLUMN_INDICES.TEACHER_EMAIL] as string,
                    ),
                ),
            });

            if (!teacher) {
                const [inserted] = await db
                    .insert(teachers)
                    .values({
                        firstName: row[COLUMN_INDICES.TEACHER_FIRST] as string,
                        lastName: row[COLUMN_INDICES.TEACHER_LAST] as string,
                        email: row[COLUMN_INDICES.TEACHER_EMAIL] as string,
                    })
                    .returning();
                teacher = inserted;
            }

            // Find or create project
            let project = await db.query.projects.findFirst({
                where: and(
                    eq(
                        projects.entryId,
                        Number(row[COLUMN_INDICES.PROJECT_ID]),
                    ),
                    eq(projects.title, row[COLUMN_INDICES.TITLE] as string),
                    eq(
                        projects.division,
                        row[COLUMN_INDICES.DIVISION] as string,
                    ),
                    eq(projects.group, row[COLUMN_INDICES.TEAM] === "True"),
                    eq(projects.year, year),
                ),
            });

            if (!project) {
                const [inserted] = await db
                    .insert(projects)
                    .values({
                        schoolId: school.id,
                        teacherId: teacher.id,
                        entryId: Number(row[COLUMN_INDICES.PROJECT_ID]),
                        title: row[COLUMN_INDICES.TITLE] as string,
                        division: row[COLUMN_INDICES.DIVISION] as string,
                        category: "dummyValue", // TO DO: no category in current data
                        year: year,
                        group: row[COLUMN_INDICES.TEAM] === "True",
                    })
                    .returning();
                project = inserted;
            }

            // TO DO: This prevents multiple people from same group from being added;
            // need some sort of ID for student from spreadsheet
            const existingStudent = await db.query.students.findFirst({
                where: and(
                    eq(students.projectId, project.id),
                    eq(students.schoolId, school.id),
                ),
            });

            if (!existingStudent) {
                await db.insert(students).values({
                    projectId: project.id,
                    schoolId: school.id,
                });
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

        console.log(`Processed ${insertedCount} rows successfully`);
        return NextResponse.json(
            { message: "Success", rowsProcessed: insertedCount },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error processing import:", error);
        return NextResponse.json(
            { message: "Import failed", error: String(error) },
            { status: 500 },
        );
    }
}
