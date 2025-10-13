import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const input = searchParams.get("input");

        // Missing query string
        if (input == null) {
            return NextResponse.json(
                { error: "Missing search parameters" },
                { status: 400 },
            );
        }
    } catch (error) {}
}
