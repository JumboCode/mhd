import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { yearlySchoolParticipation, schools } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { internalError } from "@/lib/api-utils";

export async function GET() {
    try {
        const rows = await db
            .select({
                schoolId: yearlySchoolParticipation.schoolId,
                year: yearlySchoolParticipation.year,
                schoolName: schools.name,
                standardizedSchoolName: schools.standardizedName,
                schoolTown: schools.town,
                schoolRegion: schools.region,
                gateway: schools.gateway,
                schoolImplementationModel:
                    yearlySchoolParticipation.implementationModel,
                schoolSchoolType: yearlySchoolParticipation.schoolType,
                schoolDivisions: yearlySchoolParticipation.division,
            })
            .from(yearlySchoolParticipation)
            .innerJoin(
                schools,
                eq(schools.id, yearlySchoolParticipation.schoolId),
            );

        return NextResponse.json(rows);
    } catch {
        return internalError();
    }
}
