import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { yearlySchoolParticipation } from "@/lib/schema";
import { internalError } from "@/lib/api-utils";

export async function GET() {
    try {
        const yearsWithData = await db
            .selectDistinct({ year: yearlySchoolParticipation.year })
            .from(yearlySchoolParticipation);

        const yearsSet = new Set(yearsWithData.map((row) => row.year));

        return NextResponse.json({ yearsWithData: Array.from(yearsSet) });
    } catch {
        return internalError();
    }
}
