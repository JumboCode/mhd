import { NextResponse } from "next/server";
import { getYearlyStats } from "@/lib/yearlyTotals";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const year = parseInt(searchParams.get("year") || "2024");

        const data = await getYearlyStats(year);

        return NextResponse.json(data);
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("/api/yearly-totals error:", err);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
