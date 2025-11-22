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
    schools,
    teachers,
    students,
    yearlyTeacherParticipation,
} from "@/lib/schema";
import { count, eq, and } from "drizzle-orm";

export async function GET() {
    try {
        //console.log("in try");
        //region, instructionModel, and implementationModel all have temp values
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

        //console.log("after db select");

        let schoolsToReturn: {
            name: string;
            city: string;
            region: string;
            instructionModel: string;
            implementationModel: string;
            numStudents: number;
            numTeachers: number;
            trend: string;
        }[] = [];

        for (const school of allSchools) {
            const studentsCount = await db
                .select({ count: count() })
                .from(students)
                .where(eq(students.schoolId, school.id));
            //console.log("after db count 1");
            const teachersCount = await db
                .select({ count: count() })
                .from(yearlyTeacherParticipation)
                .where(
                    and(
                        eq(yearlyTeacherParticipation.schoolId, school.id),
                        //need to deternmine if the teacher is same or not
                    ),
                );
            //console.log("after db count 2");
            schoolsToReturn.push({
                name: school.name,
                city: school.city,
                region: school.region,
                instructionModel: school.instructionModel,
                implementationModel: school.implementationModel,
                numStudents: studentsCount[0].count,
                numTeachers: teachersCount[0].count,
                trend: "up",
            });
            //console.log("after push");
        }

        return NextResponse.json(schoolsToReturn);
    } catch (error) {
        return NextResponse.json(
            { message: "Failed to fetch schools" },
            { status: 500 },
        );
    }
}
