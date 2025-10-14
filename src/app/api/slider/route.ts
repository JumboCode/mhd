import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const characterIDParam = searchParams.get("characterID");

        // Character ID must be included
        if (characterIDParam === null) {
            return NextResponse.json(
                { error: "Character ID is necessary" },
                { status: 400 },
            );
        }

        const characterID = parseInt(characterIDParam, 10);

        // Character ID must be a number between 1 and 84
        if (isNaN(characterID) || characterID < 1 || characterID > 84) {
            return NextResponse.json(
                { error: "Character ID must be a number between 1 and 84" },
                { status: 400 },
            );
        }

        const res = await fetch(`https://swapi.dev/api/people/${characterID}/`);

        if (!res.ok) {
            if (res.status === 404) {
                return NextResponse.json(
                    { error: `Character ${characterID} not found` },
                    { status: 404 },
                );
            }

            return NextResponse.json(
                { error: `Failed to fetch character data` },
                { status: 502 }, // Bad gateway
            );
        }

        const characterData = await res.json();

        return NextResponse.json(characterData, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
