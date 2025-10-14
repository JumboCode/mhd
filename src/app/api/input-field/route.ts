import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const inputNumberParam = searchParams.get("input");

        // Input number must be included
        if (inputNumberParam == null) {
            return NextResponse.json(
                { error: "Missing input number" },
                { status: 400 },
            );
        }

        const inputNumber = parseInt(inputNumberParam, 10);

        // Input number must be a number
        if (isNaN(inputNumber) || inputNumber < 9 || inputNumber > 32) {
            return NextResponse.json(
                { error: "Input number must be a number between 9 and 32" },
                { status: 400 },
            );
        }

        const res = await fetch(
            `https://opentdb.com/api.php?amount=1&category=${inputNumber}`,
        );

        if (!res.ok) {
            if (res.status === 404) {
                return NextResponse.json(
                    {
                        error: `Endpoint for input number ${inputNumber} not found`,
                    },
                    { status: 404 },
                );
            }

            return NextResponse.json(
                { error: `Failed to get input number data` },
                { status: 502 }, // Bad gateway
            );
        }

        const triviaQuestion = await res.json();

        return NextResponse.json(triviaQuestion, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
