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
import { z } from "zod";

const projectParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

const projectPatchBodySchema = z
    .object({
        title: z.string().trim().min(1).optional(),
        category: z.string().trim().min(1).optional(),
        categoryId: z.string().trim().min(1).optional(),
        division: z.string().trim().min(1).optional(),
        teamProject: z
            .union([z.boolean(), z.literal("true"), z.literal("false")])
            .transform((value) => value === true || value === "true")
            .optional(),
        numStudents: z.coerce.number().int().min(1).optional(),
    })
    .strict();

type ProjectUpdates = Partial<{
    title: string;
    category: string;
    categoryId: string;
    division: string;
    teamProject: boolean;
    numStudents: number;
}>;

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const parsedParams = projectParamsSchema.safeParse(await params);
        if (!parsedParams.success) {
            return NextResponse.json(
                { error: "Invalid project ID" },
                { status: 400 },
            );
        }
        const numericId = parsedParams.data.id;

        const parsedBody = projectPatchBodySchema.safeParse(await req.json());
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

        // Build an updates object containing only the fields present in the body.
        // This ensures we never overwrite fields the caller didn't intend to change.
        const updates = Object.fromEntries(
            Object.entries(parsedBody.data).filter(
                ([, value]) => value !== undefined,
            ),
        ) as ProjectUpdates;

        // Reject the request if the body contained no recognized fields
        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: "No valid fields to update" },
                { status: 400 },
            );
        }

        // Write only the changed fields to the database
        const result = await db
            .update(projects)
            .set(updates)
            .where(eq(projects.id, numericId))
            .returning({ id: projects.id, year: projects.year });

        // If no rows were returned the ID didn't match any record
        if (result.length === 0) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 },
            );
        }

        // Bump lastUpdatedAt for this year
        await db
            .update(yearMetadata)
            .set({ lastUpdatedAt: new Date() })
            .where(eq(yearMetadata.year, result[0].year));

        return NextResponse.json({ message: "Project updated successfully" });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error: " + (error as Error).message },
            { status: 500 },
        );
    }
}
