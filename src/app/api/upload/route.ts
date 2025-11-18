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

        // Get header row and find column indices
        const headers = rawData[0] as string[];
        const COLUMN_INDICES = {
            CITY: headers.indexOf("City"),
            GRADE: headers.indexOf("Grade"),
            DIVISION: headers.indexOf("Division"),
            TEACHER_FIRST: headers.indexOf("Teacher First"),
            TEACHER_LAST: headers.indexOf("Teacher Last"),
            TEACHER_EMAIL: headers.indexOf("Teacher Email"),
            PROJECT_ID: headers.indexOf("Project Id"),
            TITLE: headers.indexOf("Title"),
            TEAM: headers.indexOf("Team Project"),
            SCHOOL_NAME: headers.indexOf("School Name"),
        };

        // Validate all required columns exist
        const missingColumns = Object.entries(COLUMN_INDICES)
            .filter(([, index]) => index === -1)
            .map(([name]) => name);

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

        return NextResponse.json(
            { message: "Success", rowsProcessed: insertedCount },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Import failed", error: String(error) },
            { status: 500 },
        );
    }
}
