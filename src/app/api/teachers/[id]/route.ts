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
import { z } from "zod";

const teacherParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

const teacherPatchBodySchema = z
    .object({
        name: z.string().trim().min(1).optional(),
        email: z.string().trim().email().min(1).optional(),
    })
    .strict();

type TeacherUpdates = Partial<{ name: string; email: string }>;

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const parsedParams = teacherParamsSchema.safeParse(await params);
        if (!parsedParams.success) {
            return NextResponse.json(
                { error: "Invalid teacher ID" },
                { status: 400 },
            );
        }
        const numericId = parsedParams.data.id;

        const parsedBody = teacherPatchBodySchema.safeParse(await req.json());
        if (!parsedBody.success) {
            return NextResponse.json(
                {
                    error:
                        parsedBody.error.issues[0]?.message ??
                        "Invalid request body",
                },
                { status: 400 },
            );
        }

        // Build updates object with only the fields present in the request body
        const updates = Object.fromEntries(
            Object.entries(parsedBody.data).filter(
                ([, value]) => value !== undefined,
            ),
        ) as TeacherUpdates;

        // Reject the request if the body contained no recognized fields
        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: "No valid fields to update" },
                { status: 400 },
            );
        }

        // Write the changes to the database
        const result = await db
            .update(teachers)
            .set(updates)
            .where(eq(teachers.id, numericId))
            .returning({ id: teachers.id });

        // If no rows were returned the ID didn't match any record
        if (result.length === 0) {
            return NextResponse.json(
                { error: "Teacher not found" },
                { status: 404 },
            );
        }

        // Bump lastUpdatedAt for all years this teacher has projects in
        const teacherProjects = await db
            .select({ year: projects.year })
            .from(projects)
            .where(eq(projects.teacherId, numericId));
        const affectedYears = [...new Set(teacherProjects.map((p) => p.year))];
        if (affectedYears.length > 0) {
            await db
                .update(yearMetadata)
                .set({ lastUpdatedAt: new Date() })
                .where(inArray(yearMetadata.year, affectedYears));
        }

        return NextResponse.json({ message: "Teacher updated successfully" });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error: " + (error as Error).message },
            { status: 500 },
        );
    }
}
