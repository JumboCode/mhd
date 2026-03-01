/***************************************************************
 *
 *                /api/delete-year/route.ts
 *
 *         Author: Anne & Zander
 *           Date: 2/20/2026
 *
 *        Summary: api to delete all data for a given year
 *
 **************************************************************/

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
    projects,
    yearlySchoolParticipation,
    yearlyTeacherParticipation,
} from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const yearString = searchParams.get("year");
        const currentYear = Number(yearString);

        if (!currentYear || isNaN(currentYear)) {
            return NextResponse.json(
                { message: "Invalid year parameter" },
                { status: 400 },
            );
        }

        // delete content from tables if year matches year param
        await db.delete(projects).where(eq(projects.year, currentYear));
        await db
            .delete(yearlySchoolParticipation)
            .where(eq(yearlySchoolParticipation.year, currentYear));
        await db
            .delete(yearlyTeacherParticipation)
            .where(eq(yearlyTeacherParticipation.year, currentYear));
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error: " + (error as Error).message },
            { status: 500 },
        );
    }
}
