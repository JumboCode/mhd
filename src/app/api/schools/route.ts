/***************************************************************
 *
 *                /api/schools/route.ts
 *
 *         Author: Anne Wu & Justin Ngan
 *           Date: 11/16/2025
 *
 *        Summary: Backend endpoint to fetch all school data
 *
 **************************************************************/

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
    projects,
    schools,
    teachers,
    students,
    yearlyTeacherParticipation,
} from "@/lib/schema";
import { count, eq, and } from "drizzle-orm";

function percentageChange(curr: number, past: number) {
    return past != 0 ? Math.round(((curr - past) / past) * 100) : undefined;
}

//need to give curr year to get request
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ currentYear: number }> },
) {
    try {
        const { searchParams } = new URL(req.url);
        const yearString = searchParams.get("year");
        const currentYear = Number(yearString);

        const allSchools = await db
            .select({
                id: schools.id,
                name: schools.name,
                city: schools.town,
                region: schools.town,
                instructionModel: schools.town,
                implementationModel: schools.town,
            })
            .from(schools);

        let schoolsToReturn: {
            name: string;
            city: string;
            region: string;
            instructionModel: string;
            implementationModel: string;
            numStudents: number;
            studentChange: number | undefined;
            numTeachers: number;
            teacherChange: number | undefined;
            numProjects: number;
            projectChange: number | undefined;
        }[] = [];

        for (const school of allSchools) {
            const currSchoolProjects = await db
                .select({ count: count() })
                .from(projects)
                .where(
                    and(
                        eq(projects.schoolId, school.id),
                        eq(projects.year, currentYear),
                    ),
                );

            const lastYearSchoolProjects = await db
                .select({ count: count() })
                .from(projects)
                .where(
                    and(
                        eq(projects.schoolId, school.id),
                        eq(projects.year, currentYear - 1),
                    ),
                );

            const projectPercentChange = percentageChange(
                currSchoolProjects[0].count,
                lastYearSchoolProjects[0].count,
            );

            //NOTE: because a unique student is determined by having a unique
            //school and project (something that can apply to many students
            // because multiple students can be in the same school and work on
            // the same project)
            //# and students and # of projects is the same
            const currStudentsCount = await db
                .select({ count: count() })
                .from(students)
                .innerJoin(projects, eq(projects.id, students.projectId))
                .where(
                    and(
                        eq(projects.year, currentYear),
                        eq(students.schoolId, school.id),
                    ),
                );

            const lastYearStudentsCount = await db
                .select({ count: count() })
                .from(students)
                .innerJoin(projects, eq(projects.id, students.projectId))
                .where(
                    and(
                        eq(projects.year, currentYear - 1),
                        eq(students.schoolId, school.id),
                    ),
                );

            const studentPercentChange = percentageChange(
                currStudentsCount[0].count,
                lastYearStudentsCount[0].count,
            );

            const currYearteachersCount = await db
                .select({ count: count() })
                .from(yearlyTeacherParticipation)
                .where(
                    and(
                        eq(yearlyTeacherParticipation.schoolId, school.id),
                        eq(yearlyTeacherParticipation.year, currentYear),
                    ),
                );

            const lastYearteachersCount = await db
                .select({ count: count() })
                .from(yearlyTeacherParticipation)
                .where(
                    and(
                        eq(yearlyTeacherParticipation.schoolId, school.id),
                        eq(yearlyTeacherParticipation.year, currentYear - 1),
                    ),
                );

            const teacherPercentChange = percentageChange(
                currYearteachersCount[0].count,
                lastYearteachersCount[0].count,
            );

            schoolsToReturn.push({
                name: school.name,
                city: school.city,
                region: school.region,
                instructionModel: school.instructionModel,
                implementationModel: school.implementationModel,
                numStudents: currStudentsCount[0].count,
                studentChange: studentPercentChange,
                numTeachers: currYearteachersCount[0].count,
                teacherChange: teacherPercentChange,
                numProjects: currSchoolProjects[0].count,
                projectChange: projectPercentChange,
            });
        }

        //console.log(schoolsToReturn);

        return NextResponse.json(schoolsToReturn);
    } catch (error) {
        return NextResponse.json({ message: error }, { status: 500 });
    }
}
