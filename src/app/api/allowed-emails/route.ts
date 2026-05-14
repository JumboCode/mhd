import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { allowedEmails, user, session } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const rows = await db
            .select({
                id: allowedEmails.id,
                email: allowedEmails.email,
                createdAt: allowedEmails.createdAt,
            })
            .from(allowedEmails)
            .orderBy(allowedEmails.createdAt);
        return NextResponse.json(rows);
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch allowed emails" },
            { status: 500 },
        );
    }
}

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
        const [inserted] = await db
            .insert(allowedEmails)
            .values({ email: normalized })
            .onConflictDoNothing()
            .returning({
                id: allowedEmails.id,
                email: allowedEmails.email,
                createdAt: allowedEmails.createdAt,
            });
        if (!inserted) {
            return NextResponse.json(
                { error: "Email already exists" },
                { status: 409 },
            );
        }
        return NextResponse.json(inserted, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: "Failed to add email" },
            { status: 500 },
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = Number(searchParams.get("id"));
        if (!id)
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        const [removed] = await db
            .delete(allowedEmails)
            .where(eq(allowedEmails.id, id))
            .returning({ email: allowedEmails.email });

        if (removed) {
            const [matchedUser] = await db
                .select({ id: user.id })
                .from(user)
                .where(eq(user.email, removed.email))
                .limit(1);
            if (matchedUser) {
                await db
                    .delete(session)
                    .where(eq(session.userId, matchedUser.id));
            }
        }

        return new NextResponse(null, { status: 204 });
    } catch {
        return NextResponse.json(
            { error: "Failed to remove email" },
            { status: 500 },
        );
    }
}
