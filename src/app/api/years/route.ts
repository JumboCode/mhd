import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { yearlySchoolParticipation } from "@/lib/schema";

export async function GET() {
    try {
        // Get distinct years that have data in yearlySchoolParticipation
        const yearsWithData = await db
            .selectDistinct({ year: yearlySchoolParticipation.year })
            .from(yearlySchoolParticipation);

        // Convert to a Set for O(1) lookup
        const yearsSet = new Set(yearsWithData.map((row) => row.year));

        return NextResponse.json({ yearsWithData: Array.from(yearsSet) });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch years with data" },
            { status: 500 },
        );
    }
}
