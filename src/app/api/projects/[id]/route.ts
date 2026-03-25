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
import { projects } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        // Parse and validate the project ID from the URL
        const numericId = Number(id);

        if (isNaN(numericId) || !Number.isInteger(numericId)) {
            return NextResponse.json(
                { error: "Invalid project ID" },
                { status: 400 },
            );
        }

        const body = await req.json();

        // Build an updates object containing only the fields present in the body.
        // This ensures we never overwrite fields the caller didn't intend to change.
        const updates: Partial<{
            title: string;
            category: string;
            categoryId: string;
            division: string;
            teamProject: boolean;
            numStudents: number;
        }> = {};

        // Validate and coerce each allowed field to its correct DB type
        if ("title" in body) {
            const val = String(body.title).trim();
            if (!val)
                return NextResponse.json(
                    { error: "title cannot be empty" },
                    { status: 400 },
                );
            updates.title = val;
        }
        if ("category" in body) {
            const val = String(body.category).trim();
            if (!val)
                return NextResponse.json(
                    { error: "category cannot be empty" },
                    { status: 400 },
                );
            updates.category = val;
        }
        if ("categoryId" in body) {
            updates.categoryId = String(body.categoryId).trim();
        }
        if ("division" in body) {
            const val = String(body.division).trim();
            if (!val)
                return NextResponse.json(
                    { error: "division cannot be empty" },
                    { status: 400 },
                );
            updates.division = val;
        }
        if ("teamProject" in body) {
            // Accept both boolean true and the string "true" from JSON
            updates.teamProject =
                body.teamProject === true || body.teamProject === "true";
        }
        if ("numStudents" in body) {
            // Must be a positive integer — reject decimals, negatives, and NaN
            const val = Number(body.numStudents);
            if (isNaN(val) || !Number.isInteger(val) || val < 1) {
                return NextResponse.json(
                    { error: "numStudents must be a positive integer" },
                    { status: 400 },
                );
            }
            updates.numStudents = val;
        }

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
            .returning({ id: projects.id });

        // If no rows were returned the ID didn't match any record
        if (result.length === 0) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({ message: "Project updated successfully" });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error: " + (error as Error).message },
            { status: 500 },
        );
    }
}
