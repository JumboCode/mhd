import { NextResponse } from "next/server";

export async function GET() {
    try {
        const res = await fetch("https://thequoteshub.com/api/random");

        if (!res.ok) {
            if (res.status === 404) {
                return NextResponse.json(
                    { error: "No quote data found" },
                    { status: 404 },
                );
            }

            return NextResponse.json(
                { error: "Failed to fetch any quote data" },
                { status: 502 }, // Bad gateway
            );
        }

        const data = await res.json();

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: `Internal server error: ${error}` },
            { status: 500 },
        );
    }
}
