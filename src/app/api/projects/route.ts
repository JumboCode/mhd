/***************************************************************
 *
 *                /api/projects/route.ts
 *
 *         Author: Elki & Zander
 *           Date: 11/24/2025
 *
 *        Summary: endpoint for fetching all project data
 *
 **************************************************************/

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
    projects,
    schools,
    teachers,
    yearlySchoolParticipation,
} from "@/lib/schema";
import { and, eq } from "drizzle-orm";

export async function GET() {
    try {
        const allProjects = await db
            .select({
                id: projects.id,
                title: projects.title,
                division: projects.division,
                category: projects.category,
                year: projects.year,
                teamProject: projects.teamProject,
                schoolId: projects.schoolId,
                schoolName: schools.name,
                standardizedSchoolName: schools.standardizedName,
                schoolTown: schools.town,
                schoolRegion: schools.region,
                teacherId: projects.teacherId,
                teacherName: teachers.name,
                teacherEmail: teachers.email,
                numStudents: projects.numStudents,
                schoolDivisions: yearlySchoolParticipation.division,
                schoolImplementationModel:
                    yearlySchoolParticipation.implementationModel,
                schoolSchoolType: yearlySchoolParticipation.schoolType,
            })
            .from(projects)
            .innerJoin(schools, eq(schools.id, projects.schoolId))
            .innerJoin(teachers, eq(teachers.id, projects.teacherId))
            .leftJoin(
                yearlySchoolParticipation,
                and(
                    eq(yearlySchoolParticipation.schoolId, projects.schoolId),
                    eq(yearlySchoolParticipation.year, projects.year),
                ),
            );

        return NextResponse.json(allProjects);
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error: " + (error as Error).message },
            { status: 500 },
        );
    }
}
