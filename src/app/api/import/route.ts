import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { students, schools, teachers, projects } from "@/lib/schema";

export async function POST(req: Request) {
    try {
        const body = await req.json();

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

        console.log(body[21]);
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

        for (const row of filteredByCol) {
            await db.insert(schools).values({ name: row[9], town: row[0] });

            // teacher: first name, last name, email
            await db
                .insert(teachers)
                .values({ firstName: row[3], lastName: row[4], email: row[5] });

            // project: projectID, project title, division, team
            await db
                .insert(projects)
                .values({
                    schoolId: 0,
                    teacherId: 0,
                    entryId: row[6],
                    title: row[6],
                    division: row[2],
                    category: "dummyValue",
                    year: 0,
                    group: row[8],
                });
            // id, schoolId, teacherId, entryId

            // student: project ID, school ID
            await db.insert(students).values({ projectId: 0, schoolId: 0 });
        }

        // school data; city, school name

        // we do NOT have year data, cannot populate yearly-teacher-participation table
        // or yearly-school-participation table
    } catch (error) {
        return NextResponse.json({ message: "error!!!" }, { status: 500 });
    }
}
