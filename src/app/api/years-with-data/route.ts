/***************************************************************
 *
 *           /api/get-existing-years/route.ts
 *
 *         Author: Anne Wu & Zander Barba
 *           Date: 2/20/2026
 *
 *        Summary: api to fetch all unique years of participation
 *
 ***************************************************************/

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { yearlySchoolParticipation, yearMetadata, schools } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const schoolParam = searchParams.get("school");

        // If a school standardized name is provided, return only years that
        // school participated in (used by the school profile page).
        if (schoolParam) {
            const rows = await db
                .select({ year: yearlySchoolParticipation.year })
                .from(yearlySchoolParticipation)
                .innerJoin(
                    schools,
                    eq(yearlySchoolParticipation.schoolId, schools.id),
                )
                .where(eq(schools.standardizedName, schoolParam))
                .groupBy(yearlySchoolParticipation.year)
                .orderBy(yearlySchoolParticipation.year);

            return NextResponse.json(
                { years: rows.map((r) => r.year) },
                { status: 200 },
            );
        }

        const participation = await db
            .select({ year: yearlySchoolParticipation.year })
            .from(yearlySchoolParticipation)
            .groupBy(yearlySchoolParticipation.year)
            .orderBy(yearlySchoolParticipation.year);

        const years = participation.map((row) => row.year);

        const metadata = await Promise.all(
            years.map((year) =>
                db
                    .select({
                        uploadedAt: yearMetadata.uploadedAt,
                        lastUpdatedAt: yearMetadata.lastUpdatedAt,
                    })
                    .from(yearMetadata)
                    .where(eq(yearMetadata.year, year))
                    .then((rows) => rows[0] ?? null),
            ),
        );

        const yearsWithMetadata = years.map((year, i) => ({
            year,
            uploadedAt: metadata[i]?.uploadedAt ?? null,
            lastUpdatedAt: metadata[i]?.lastUpdatedAt ?? null,
        }));

        return NextResponse.json({ years: yearsWithMetadata }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error: " + (error as Error).message },
            { status: 500 },
        );
    }
}
