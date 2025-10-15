import { NextRequest, NextResponse } from "next/server";

type Episode = {
    id: number;
    name: string;
    season: number;
    number: number;
    summary: string | null;
    runtime: number | null;
    showName: string;
};

type LargeEpisode = {
    id: number;
    url: string;
    name: string;
    season: number;
    number: number;
    type?: string;
    airdate?: string;
    airtime?: string;
    airstamp?: string;
    runtime?: number;
    rating?: {
        average: number | null;
    };
    image?: {
        medium?: string;
        original?: string;
    } | null;
    summary?: string | null;
    show?: {
        id: number;
        url: string;
        name: string;
        type: string;
        language: string;
        genres?: string[];
        status?: string;
        runtime?: number | null;
        averageRuntime?: number | null;
        premiered?: string | null;
        officialSite?: string | null;
        schedule?: {
            time: string;
            days: string[];
        };
        rating?: {
            average: number | null;
        };
        weight?: number;
        network?: {
            id: number;
            name: string;
            country?: {
                name: string;
                code: string;
                timezone: string;
            } | null;
        } | null;
        webChannel?: null;
        externals?: {
            tvrage?: number | null;
            thetvdb?: number | null;
            imdb?: string | null;
        };
        image?: {
            medium?: string;
            original?: string;
        } | null;
        summary?: string | null;
        updated?: number;
    };
    _links?: {
        self: {
            href: string;
        };
        show: {
            href: string;
        };
    };
};

function extractEpisodes(data: LargeEpisode[]): Episode[] {
    return data.map((item) => {
        return {
            id: item.id,
            name: item.name,
            season: item.season,
            number: item.number,
            summary: item.summary ?? null,
            runtime: item.runtime ?? null,
            showName: item.show?.name ?? "Unknown Show",
        };
    });
}

function isValidDate(dateStr: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

    const [year, month, day] = dateStr.split("-").map(Number);

    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date");

        if (date === null) {
            return NextResponse.json(
                { error: "Date string is required in format YYYY-MM-DD" },
                { status: 400 },
            );
        }

        if (!isValidDate(date)) {
            return NextResponse.json(
                { error: "Improperly formatted date" },
                { status: 400 },
            );
        }

        const res = await fetch(
            `https://api.tvmaze.com/schedule?country=US&date=${date}`,
        );

        if (!res.ok) {
            if (res.status === 404) {
                return NextResponse.json(
                    { error: `No show data found` },
                    { status: 404 },
                );
            }

            return NextResponse.json(
                { error: `Failed to fetch any show data` },
                { status: 502 }, // Bad gateway
            );
        }

        const showData = await res.json();
        const episodes = extractEpisodes(showData);

        return NextResponse.json(episodes, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: `Internal server error: ${error}` },
            { status: 500 },
        );
    }
}
