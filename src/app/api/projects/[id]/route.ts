/***************************************************************
 *
 *                /api/projects/[id]/route.ts
 *
 *         Author: Anne Wu & Hansini Gundavarapu
 *           Date: 03/25/2026
 *
 *        Summary: PATCH endpoint to update a single project row
 *                 by its database ID. Only the fields included
 *                 in the request body are updated. Each field is
 *                 validated and coerced to the correct type before
 *                 being written to the database.
 *
 **************************************************************/

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects, yearMetadata } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { idParamSchema, projectPatchBodySchema } from "@/lib/api-schemas";
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
        const parsed = parseOrError(projectPatchBodySchema, body);
        if (!parsed.success) return parsed.response;

        const result = await db
            .update(projects)
            .set(parsed.data)
            .where(eq(projects.id, idParsed.data))
            .returning({ id: projects.id, year: projects.year });

        if (result.length === 0) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 },
            );
        }

        await db
            .update(yearMetadata)
            .set({ lastUpdatedAt: new Date() })
            .where(eq(yearMetadata.year, result[0].year));

        return NextResponse.json({ message: "Project updated successfully" });
    } catch {
        return internalError();
    }
}
