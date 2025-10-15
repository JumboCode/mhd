import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const categoriesParam = searchParams.get("categories");

        if (categoriesParam === null) {
            return NextResponse.json(
                { error: "Categories query must be included" },
                { status: 400 },
            );
        }

        const possibleCategories = [
            "any",
            "programming",
            "misc",
            "dark",
            "pun",
            "spooky",
            "christmas",
        ];
        const categories = categoriesParam.split(",");

        // Ensure each category given from frontend are valid categories
        for (const category of categories) {
            if (!possibleCategories.includes(category.toLowerCase())) {
                console.log("should be returning");
                return NextResponse.json(
                    { error: `${category} is not a valid category` },
                    { status: 400 },
                );
            }
        }

        const res = await fetch(
            `https://v2.jokeapi.dev/joke/${categories.join(",")}?blacklistFlags=nsfw,religious,political,racist,sexist,explicit`,
        );

        if (!res.ok) {
            if (res.status === 404) {
                return NextResponse.json(
                    {
                        error: `Endpoint for given categories ${categories.join(",")} not found`,
                    },
                    { status: 404 },
                );
            }

            return NextResponse.json(
                { error: `Failed to get joke for given categories` },
                { status: 502 }, // Bad gateway
            );
        }

        const joke = await res.json();

        return NextResponse.json(joke, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
