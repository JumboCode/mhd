/***************************************************************
 *
 *                /api/heat-layer/route.ts
 *
 *         Author: Anne Wu, Elki Laranas, Steven Bagade
 *           Date: 2/6/26
 *
 *        Summary: Backend endpoint to fetch heatmap layer per year
 *
 **************************************************************/

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { schools, projects, yearlyTeacherParticipation } from "@/lib/schema";
import { eq, isNotNull } from "drizzle-orm";
import { z } from "zod";

const heatLayerQuerySchema = z.object({
    year: z.coerce.number().int().positive(),
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const parsedQuery = heatLayerQuerySchema.safeParse({
            year: searchParams.get("year"),
        });
        if (!parsedQuery.success) {
            return NextResponse.json(
                { message: "Invalid year parameter" },
                { status: 400 },
            );
        }
        const currentYear = parsedQuery.data.year;

        // Fetch all schools with latitude and longitude
        const schoolsPerYear = await db
            .select({
                id: schools.id,
                name: schools.name,
                latitude: schools.latitude,
                longitude: schools.longitude,
            })
            .from(schools)
            .where(isNotNull(schools.latitude));

        // Fetch all projects with corresponding school, year, # students
        const projectsPerYear = await db
            .select({
                schoolId: projects.schoolId,
                num_students: projects.numStudents,
            })
            .from(projects)
            .where(eq(projects.year, currentYear));

        // Fetch all teachers with corresponding school and year, ID extra
        const teachersPerYear = await db
            .select({
                schoolId: yearlyTeacherParticipation.schoolId,
                teacherId: yearlyTeacherParticipation.teacherId,
            })
            .from(yearlyTeacherParticipation)
            .where(eq(yearlyTeacherParticipation.year, currentYear));

        const mapData: GeoJSON.Feature[] = [];

        // Calculate counts, populate geoJSON for that year
        schoolsPerYear.forEach((school) => {
            const currentID = school.id;
            let totalProjects = 0;
            let totalStudents = 0;
            let totalTeachers = 0;

            projectsPerYear.forEach((project) => {
                if (currentID === project.schoolId) {
                    totalProjects++;
                    totalStudents += project.num_students;
                }
            });

            teachersPerYear.forEach((teacher) => {
                if (currentID === teacher.schoolId) {
                    totalTeachers++;
                }
            });

            // Assuming longitude and latitude always exist as an invariant,
            // consolidate the sums into a geoJSON feature
            if (school.latitude && school.longitude) {
                mapData.push({
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [school.longitude, school.latitude],
                    },
                    properties: {
                        id: school.id,
                        name: school.name,
                        Teachers: totalTeachers,
                        Projects: totalProjects,
                        Students: totalStudents,
                    },
                });
            }
        });

        const collection = {
            type: "FeatureCollection",
            crs: {
                type: "name",
                properties: {
                    name: "schoolDataPoints",
                },
            },
            features: mapData,
        };

        return NextResponse.json(collection);
    } catch (error) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}
