import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { allowedEmails } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "Invalid email" },
                { status: 400 },
            );
        }
        const normalized = email.trim().toLowerCase();
        const db = getDb();
        const allowed = await db
            .select({ id: allowedEmails.id })
            .from(allowedEmails)
            .where(eq(allowedEmails.email, normalized))
            .limit(1);
        if (allowed.length === 0) {
            return NextResponse.json(
                {
                    error: "This email is not authorized to access this application.",
                },
                { status: 403 },
            );
        }
        return new NextResponse(null, { status: 200 });
    } catch {
        return NextResponse.json(
            { error: "Failed to check email" },
            { status: 500 },
        );
    }
}
