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
import { projects, schools, teachers } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const allProjects = await db
            .select({
                id: projects.id,
                title: projects.title,
                division: projects.division,
                category: projects.category,
                year: projects.year,
                group: projects.group,
                schoolId: projects.schoolId,
                schoolName: schools.name,
                schoolTown: schools.town,
                teacherId: projects.teacherId,
                teacherFirstName: teachers.firstName,
                teacherLastName: teachers.lastName,
            })
            .from(projects)
            .innerJoin(schools, eq(schools.id, projects.schoolId))
            .innerJoin(teachers, eq(teachers.id, projects.teacherId));

        return NextResponse.json(allProjects);
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error: " + (error as Error).message },
            { status: 500 },
        );
    }
}
