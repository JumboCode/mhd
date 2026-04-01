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
import { teachers } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        // Parse and validate the teacher ID from the URL
        const numericId = Number(id);

        if (isNaN(numericId) || !Number.isInteger(numericId)) {
            return NextResponse.json(
                { error: "Invalid teacher ID" },
                { status: 400 },
            );
        }

        const body = await req.json();

        // Build updates object with only the fields present in the request body
        const updates: Partial<{ name: string; email: string }> = {};

        if ("name" in body) {
            const val = String(body.name).trim();
            if (!val)
                return NextResponse.json(
                    { error: "name cannot be empty" },
                    { status: 400 },
                );
            updates.name = val;
        }
        if ("email" in body) {
            const val = String(body.email).trim();
            if (!val)
                return NextResponse.json(
                    { error: "email cannot be empty" },
                    { status: 400 },
                );
            // Validate basic email format before writing to the database
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(val)) {
                return NextResponse.json(
                    { error: "Invalid email format" },
                    { status: 400 },
                );
            }
            updates.email = val;
        }

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

        return NextResponse.json({ message: "Teacher updated successfully" });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error: " + (error as Error).message },
            { status: 500 },
        );
    }
}
