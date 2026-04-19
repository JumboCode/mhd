import { findRegionOf } from "@/lib/region-finder";
import { NextRequest, NextResponse } from "next/server";
import { latLongQuerySchema } from "@/lib/api-schemas";
import { parseOrError, searchParamsToObject } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
    const parsed = parseOrError(latLongQuerySchema, searchParamsToObject(req));
    if (!parsed.success) return parsed.response;

    const { lat, long } = parsed.data;
    const region = findRegionOf(lat, long);
    return NextResponse.json({ region });
}
