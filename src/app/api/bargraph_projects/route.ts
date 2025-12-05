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
import { projects, schools, teachers, students } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

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
                studentCount: sql<number>`COUNT(${students.id})`,
            })
            // og
            .from(projects)
            .leftJoin(students, eq(students.projectId, projects.id))
            .innerJoin(schools, eq(schools.id, projects.schoolId))
            .innerJoin(teachers, eq(teachers.id, projects.teacherId))

            // maybe delete the group by
            .groupBy(
                projects.id,
                schools.name,
                schools.town,
                teachers.firstName,
                teachers.lastName,
            );

        // .from(projects)
        // .leftJoin(students, eq(students.projectId, projects.id))
        // .innerJoin(schools, eq(schools.id, projects.schoolId))
        // .innerJoin(teachers, eq(teachers.id, projects.teacherId))
        // .groupBy(
        //   projects.id,
        //   projects.title,
        //   projects.division,
        //   projects.category,
        //   projects.year,
        //   projects.group,
        //   projects.schoolId,
        //   schools.name,
        //   schools.town,
        //   projects.teacherId,
        //   teachers.firstName,
        //   teachers.lastName
        // );

        return NextResponse.json(allProjects);
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error: " + (error as Error).message },
            { status: 500 },
        );
    }
}
