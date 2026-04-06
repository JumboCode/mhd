/***************************************************************
 *
 *                /api/coordinate-to-region/route.ts
 *
 *         Author: Zander
 *           Date: 4/4/2026
 *
 *        Summary: API to find the MA region of a given coordinate
 *
 **************************************************************/

import { findRegionOf } from "@/lib/region-finder";
import { NextRequest, NextResponse } from "next/server";

/**
 * Returns region of a lat long coordinate.
 *
 * @param req NextRequest object
 * @returns JSON response with success or error
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const lat = Number(searchParams.get("lat"));
    const long = Number(searchParams.get("long"));

    if (isNaN(lat) || isNaN(long)) {
        return NextResponse.json(
            { error: "Invalid lat/long parameters" },
            { status: 400 },
        );
    }

    const region = findRegionOf(lat, long);
    return NextResponse.json({ region });
}
