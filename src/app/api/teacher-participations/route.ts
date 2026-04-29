import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
    yearlyTeacherParticipation,
    yearlySchoolParticipation,
    schools,
} from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { internalError } from "@/lib/api-utils";

export async function GET() {
    try {
        const rows = await db
            .select({
                teacherId: yearlyTeacherParticipation.teacherId,
                year: yearlyTeacherParticipation.year,
                schoolName: schools.name,
                schoolTown: schools.town,
                schoolRegion: schools.region,
                gateway: schools.gateway,
                schoolImplementationModel:
                    yearlySchoolParticipation.implementationModel,
                schoolSchoolType: yearlySchoolParticipation.schoolType,
                schoolDivisions: yearlySchoolParticipation.division,
            })
            .from(yearlyTeacherParticipation)
            .innerJoin(
                schools,
                eq(schools.id, yearlyTeacherParticipation.schoolId),
            )
            .leftJoin(
                yearlySchoolParticipation,
                and(
                    eq(
                        yearlySchoolParticipation.schoolId,
                        yearlyTeacherParticipation.schoolId,
                    ),
                    eq(
                        yearlySchoolParticipation.year,
                        yearlyTeacherParticipation.year,
                    ),
                ),
            );

        return NextResponse.json(rows);
    } catch {
        return internalError();
    }
}
