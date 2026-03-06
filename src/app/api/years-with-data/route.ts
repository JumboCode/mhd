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
import { yearlySchoolParticipation } from "@/lib/schema";

export async function GET() {
    try {
        const result = await db
            .select({
                year: yearlySchoolParticipation.year,
            })
            .from(yearlySchoolParticipation)
            .groupBy(yearlySchoolParticipation.year)
            .orderBy(yearlySchoolParticipation.year);

        const years = result.map((row) => row.year);

        return NextResponse.json({ years }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error: " + (error as Error).message },
            { status: 500 },
        );
    }
}
