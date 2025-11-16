/**
 * route.ts (for data ingestion)
 * by Anne Wu and Chiara Martello
 * 11/16/25
 *
 * API route responsible for getting excel sheet data and inserting that data
 * into a NEON database with drizzle.
 */

import { NextResponse } from "next/server";
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

export async function POST(req: Request) {
    try {
        const jsonReq = await req.json();
        const year: number = jsonReq.formYear;
        const body = JSON.parse(jsonReq.formData);

        //row 4: city: schools
        //row 13: grade: ????
        //16: division: projects
        //18: teacher first name: teacher
        //19: teacher last name: teacher
        //20: teacher email: teacher
        //22: project id: project
        //23: title: project
        //33: team: project
        //36: school name: school
        const neededIndices = [4, 13, 16, 18, 19, 20, 22, 23, 33, 36];

        console.log(jsonReq.formYear);
        console.log(body[0]);
        body.shift();
        const filteredArray = body.filter(
            (row: Array<string | number | boolean | null>) => row.length > 0,
        );
        const filteredByCol = filteredArray.map(
            (row: Array<string | number | boolean | null>) => {
                return row.filter((_value, index) =>
                    neededIndices.includes(index),
                );
            },
        );
        console.log(filteredByCol[21]);
        console.log(filteredByCol.length);
        console.log(filteredByCol[1][9]);
        console.log(filteredByCol[1][0]);

        let count = 0;
        for (const row of filteredByCol) {
            count++;
            // check if school already exists in database
            let currSchool = await db.query.schools.findFirst({
                where: and(eq(schools.name, row[9]), eq(schools.town, row[0])),
            });
            if (!currSchool) {
                const inserted = await db
                    .insert(schools)
                    .values({ name: row[9], town: row[0] })
                    .returning();

                currSchool = inserted[0];
            }

            // check if teacher already exists in database
            var currTeacher = await db.query.teachers.findFirst({
                where: and(
                    eq(teachers.firstName, row[3]),
                    eq(teachers.lastName, row[4]),
                    eq(teachers.email, row[5]),
                ),
            });
            if (!currTeacher) {
                const inserted = await db
                    .insert(teachers)
                    .values({
                        firstName: row[3],
                        lastName: row[4],
                        email: row[5],
                    })
                    .returning();

                currTeacher = inserted[0];
            }

            // check if project already exists in database
            let currProject = await db.query.projects.findFirst({
                where: and(
                    eq(projects.entryId, row[6]),
                    eq(projects.title, row[7]),
                    eq(projects.division, row[2]),
                    eq(projects.group, row[8]),
                    eq(projects.year, year),
                ),
            });
            // if it doesn't already exist, insert it into db
            if (!currProject) {
                const inserted = await db
                    .insert(projects)
                    .values({
                        schoolId: currSchool.id,
                        teacherId: currTeacher.id,
                        entryId: row[6],
                        title: row[7],
                        division: row[2],
                        category: "dummyValue",
                        year: year,
                        group: row[8],
                    })
                    .returning();

                currProject = inserted[0];
            }

            // id, schoolId, teacherId, entryId

            // student: project ID, school ID
            let currStudent = await db.query.students.findFirst({
                where: and(
                    eq(students.projectId, currProject.id),
                    eq(students.schoolId, currSchool.id),
                ),
            });
            // check if student already exists in database
            if (!currStudent) {
                await db
                    .insert(students)
                    .values({
                        projectId: currProject.id,
                        schoolId: currSchool.id,
                    });
            }

            // yearly-teacher-participation
            // year, teacher ID, school ID
            let currYearlyTeacher =
                await db.query.yearlyTeacherParticipation.findFirst({
                    where: and(
                        eq(yearlyTeacherParticipation.year, year),
                        eq(
                            yearlyTeacherParticipation.teacherId,
                            currTeacher.id,
                        ),
                        eq(yearlyTeacherParticipation.schoolId, currSchool.id),
                    ),
                });
            // check if yearly-teacher-participation entry already exists in database
            if (!currYearlyTeacher) {
                await db
                    .insert(yearlyTeacherParticipation)
                    .values({
                        year: year,
                        teacherId: currTeacher.id,
                        schoolId: currSchool.id,
                    });
            }

            // yearly-school-participation
            // year, schoolID
            let currYearlySchool =
                await db.query.yearlySchoolParticipation.findFirst({
                    where: and(
                        eq(yearlySchoolParticipation.year, year),
                        eq(yearlySchoolParticipation.schoolId, currSchool.id),
                    ),
                });
            // check if yearly-teacher-participation entry already exists in database
            if (!currYearlySchool) {
                await db
                    .insert(yearlySchoolParticipation)
                    .values({ year: year, schoolId: currSchool.id });
            }
        }
        console.log(count);
        return NextResponse.json({ message: "Success!!!" }, { status: 200 });

        // school data; city, school name
    } catch (error) {
        return NextResponse.json({ message: "error!!!" }, { status: 500 });
    }
}
