/***************************************************************
 *
 *                /api/schools/[name]/gateway/route.ts
 *
 *         Author: Zander & Anne
 *           Date: 3/1/2026
 *
 *        Summary: Endpoint to fetch or update a school's
 *                 "gateway" flag in the database.
 *
 **************************************************************/

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { schools } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Fetch the gateway status of a school.
 *
 * @param req NextRequest object
 * @param params Promise containing the school `name` param
 * @returns JSON response with { gateway: boolean } or error
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ name: string }> },
) {
    try {
        const { name } = await params;
        const searchName = name.replace(/-/g, " ");

        const schoolResult = await db
            .select({ id: schools.id, gateway: schools.gateway })
            .from(schools)
            .where(eq(sql`LOWER(${schools.name})`, searchName.toLowerCase()))
            .limit(1);

        if (!schoolResult || schoolResult.length === 0) {
            return NextResponse.json(
                { error: "School not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({ gateway: schoolResult[0].gateway });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error: " + (error as Error).message },
            { status: 500 },
        );
    }
}

/**
 * Update the gateway status of a school.
 *
 * @param req NextRequest object
 * @param params Promise containing the school `name` param
 * @returns JSON response with { message, gateway } or error
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ name: string }> },
) {
    try {
        const { name } = await params;
        const searchName = name.replace(/-/g, " ");

        const body = await req.json();
        const { gateway } = body;

        if (typeof gateway !== "boolean") {
            return NextResponse.json(
                { error: "Invalid gateway value" },
                { status: 400 },
            );
        }

        const schoolResult = await db
            .select({ id: schools.id })
            .from(schools)
            .where(eq(sql`LOWER(${schools.name})`, searchName.toLowerCase()))
            .limit(1);

        if (!schoolResult || schoolResult.length === 0) {
            return NextResponse.json(
                { error: "School not found" },
                { status: 404 },
            );
        }

        await db
            .update(schools)
            .set({ gateway })
            .where(eq(schools.id, schoolResult[0].id));

        return NextResponse.json({
            message: "Gateway updated successfully",
            gateway,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error: " + (error as Error).message },
            { status: 500 },
        );
    }
}
