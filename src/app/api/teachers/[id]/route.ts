/***************************************************************
 *
 *                /api/teachers/[id]/route.ts
 *
 *         Author: Anne Wu & Hansini Gundavarapu
 *           Date: 03/25/2026
 *
 *        Summary: PATCH endpoint to update a single teacher row
 *                 by its database ID. Only name and email can be
 *                 changed. Because teacher records are shared
 *                 across all projects, changes here affect every
 *                 project associated with this teacher.
 *
 **************************************************************/

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teachers, projects, yearMetadata } from "@/lib/schema";
import { eq, inArray } from "drizzle-orm";
import { idParamSchema, teacherPatchBodySchema } from "@/lib/api-schemas";
import { parseOrError, internalError } from "@/lib/api-utils";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const idParsed = parseOrError(idParamSchema, id);
        if (!idParsed.success) return idParsed.response;

        const body = await req.json();
        const parsed = parseOrError(teacherPatchBodySchema, body);
        if (!parsed.success) return parsed.response;

        const updates: Partial<{ name: string; email: string }> = {};

        if (parsed.data.name !== undefined) updates.name = parsed.data.name;
        if (parsed.data.email !== undefined) updates.email = parsed.data.email;

        const result = await db
            .update(teachers)
            .set(updates)
            .where(eq(teachers.id, idParsed.data))
            .returning({ id: teachers.id });

        if (result.length === 0) {
            return NextResponse.json(
                { error: "Teacher not found" },
                { status: 404 },
            );
        }

        const teacherProjects = await db
            .select({ year: projects.year })
            .from(projects)
            .where(eq(projects.teacherId, idParsed.data));
        const affectedYears = [...new Set(teacherProjects.map((p) => p.year))];
        if (affectedYears.length > 0) {
            await db
                .update(yearMetadata)
                .set({ lastUpdatedAt: new Date() })
                .where(inArray(yearMetadata.year, affectedYears));
        }

        return NextResponse.json({ message: "Teacher updated successfully" });
    } catch {
        return internalError();
    }
}
