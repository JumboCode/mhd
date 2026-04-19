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
import { yearQuerySchema } from "@/lib/api-schemas";
import {
    parseOrError,
    searchParamsToObject,
    internalError,
} from "@/lib/api-utils";

export async function DELETE(req: NextRequest) {
    try {
        const parsed = parseOrError(yearQuerySchema, searchParamsToObject(req));
        if (!parsed.success) return parsed.response;

        const { year } = parsed.data;

        await db.delete(projects).where(eq(projects.year, year));
        await db
            .delete(yearlySchoolParticipation)
            .where(eq(yearlySchoolParticipation.year, year));
        await db
            .delete(yearlyTeacherParticipation)
            .where(eq(yearlyTeacherParticipation.year, year));
        await db.delete(yearMetadata).where(eq(yearMetadata.year, year));

        return NextResponse.json({ success: true });
    } catch {
        return internalError();
    }
}
