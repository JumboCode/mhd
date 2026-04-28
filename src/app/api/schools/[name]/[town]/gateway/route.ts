import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { schools } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";
import { gatewayPatchBodySchema } from "@/lib/api-schemas";
import { parseOrError, internalError } from "@/lib/api-utils";

function decodeTownSegment(segment: string): string {
    return segment.replace(/-/g, " ");
}

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ name: string; town: string }> },
) {
    try {
        const { name, town } = await params;
        const townQuery = decodeTownSegment(town);

        const schoolResult = await db
            .select({ id: schools.id, gateway: schools.gateway })
            .from(schools)
            .where(
                and(
                    eq(schools.standardizedName, name),
                    sql`LOWER(${schools.town}) = ${townQuery}`,
                ),
            )
            .limit(1);

        if (!schoolResult || schoolResult.length === 0) {
            return NextResponse.json(
                { error: "School not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({ gateway: schoolResult[0].gateway });
    } catch {
        return internalError();
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ name: string; town: string }> },
) {
    try {
        const { name, town } = await params;
        const townQuery = decodeTownSegment(town);

        const body = await req.json();
        const parsed = parseOrError(gatewayPatchBodySchema, body);
        if (!parsed.success) return parsed.response;

        const { gateway } = parsed.data;

        const schoolResult = await db
            .select({ id: schools.id })
            .from(schools)
            .where(
                and(
                    eq(schools.standardizedName, name),
                    sql`LOWER(${schools.town}) = ${townQuery}`,
                ),
            )
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
    } catch {
        return internalError();
    }
}
