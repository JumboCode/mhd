/***************************************************************
 *
 *                /api/delete-year/route.ts
 *
 *         Author: Anne & Zander
 *           Date: 2/20/2026
 *
 *        Summary: API to delete all data for a given year
 *
 **************************************************************/

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
    projects,
    yearlySchoolParticipation,
    yearlyTeacherParticipation,
    yearMetadata,
} from "@/lib/schema";
import { eq } from "drizzle-orm";

/**
 * Deletes all data for the specified year.
 *
 * @param req NextRequest object
 * @returns JSON response with success or error
 */
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

        // Delete rows for the specified year
        await db.delete(projects).where(eq(projects.year, currentYear));
        await db
            .delete(yearlySchoolParticipation)
            .where(eq(yearlySchoolParticipation.year, currentYear));
        await db
            .delete(yearlyTeacherParticipation)
            .where(eq(yearlyTeacherParticipation.year, currentYear));
        await db.delete(yearMetadata).where(eq(yearMetadata.year, currentYear));

        // Return a success response so fetch.ok becomes true
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error: " + (error as Error).message },
            { status: 500 },
        );
    }
}
