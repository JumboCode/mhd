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
import {
    schools,
    projects,
    yearlyTeacherParticipation,
    yearlySchoolParticipation,
} from "@/lib/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { yearQuerySchema } from "@/lib/api-schemas";
import {
    parseOrError,
    searchParamsToObject,
    internalError,
} from "@/lib/api-utils";

export async function GET(req: NextRequest) {
    try {
        const parsed = parseOrError(yearQuerySchema, searchParamsToObject(req));
        if (!parsed.success) return parsed.response;

        const { year } = parsed.data;

        const schoolsPerYear = await db
            .select({
                id: schools.id,
                name: schools.name,
                latitude: schools.latitude,
                longitude: schools.longitude,
            })
            .from(schools)
            .where(isNotNull(schools.latitude));

        const projectsPerYear = await db
            .select({
                schoolId: projects.schoolId,
                num_students: projects.numStudents,
            })
            .from(projects)
            .where(eq(projects.year, year));

        const teachersPerYear = await db
            .select({
                schoolId: yearlyTeacherParticipation.schoolId,
                teacherId: yearlyTeacherParticipation.teacherId,
            })
            .from(yearlyTeacherParticipation)
            .where(eq(yearlyTeacherParticipation.year, year));

        const competingPerYear = await db
            .select({
                schoolId: yearlySchoolParticipation.schoolId,
                competingStudents: yearlySchoolParticipation.competingStudents,
            })
            .from(yearlySchoolParticipation)
            .where(
                and(
                    eq(yearlySchoolParticipation.year, year),
                    isNotNull(yearlySchoolParticipation.competingStudents),
                ),
            );
        const competingMap = new Map(
            competingPerYear.map((r) => [r.schoolId, r.competingStudents ?? 0]),
        );

        const mapData: GeoJSON.Feature[] = [];

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
                        // Legacy key — participating students (row count).
                        Students: totalStudents,
                        Participating: totalStudents,
                        Competing: competingMap.get(school.id) ?? 0,
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
    } catch {
        return internalError();
    }
}
