/***************************************************************
 *
 *                /api/schools/known/route.ts
 *
 *         Author: Jack Liu, Justin Ngan
 *           Date: 02/28/2026
 *
 *        Summary: API endpoint to fetch known schools for frontend
 *                 matching during upload. DB schools (with coordinates)
 *                 are returned first; CSV schools fill in the rest.
 *
 **************************************************************/

import { type CsvRow } from "@/types/csv";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { db } from "@/lib/db";
import { schools } from "@/lib/schema";
import { type KnownSchool } from "@/lib/school-matching";
import { isNotNull } from "drizzle-orm";

export async function GET() {
    try {
        // Fetch DB schools that already have coordinates
        const dbSchools = await db
            .select({
                name: schools.name,
                city: schools.town,
                lat: schools.latitude,
                long: schools.longitude,
            })
            .from(schools)
            .where(isNotNull(schools.latitude));

        const knownSchools: KnownSchool[] = dbSchools.map((s) => ({
            name: s.name,
            city: s.city ?? "",
            lat: s.lat,
            long: s.long,
        }));

        // Build a set of name+city keys already covered by DB results
        const dbKeys = new Set(
            knownSchools
                .filter((s) => s.name && s.city)
                .map((s) => `${s.name.toLowerCase()}|${s.city.toLowerCase()}`),
        );

        // Parse CSV and append any schools not already in the DB list
        const csvPath = path.join(
            process.cwd(),
            "public",
            "MA_schools_long_lat.csv",
        );
        const fileContents = fs.readFileSync(csvPath, "utf-8");

        const records = parse(fileContents, {
            columns: (header: string[]) => header.map((col) => col.trim()),
            skip_empty_lines: true,
            trim: true,
        }) as CsvRow[];

        for (const row of records) {
            const name = (row.name ?? "").trim();
            const city = (row.city ?? "").trim();
            if (!name || !city) continue;

            const key = `${name.toLowerCase()}|${city.toLowerCase()}`;
            if (dbKeys.has(key)) continue;

            knownSchools.push({
                name,
                city,
                lat: row.lat ? Number(row.lat) : null,
                long: row.long ? Number(row.long) : null,
            });
        }

        return NextResponse.json(knownSchools);
    } catch (error) {
        return NextResponse.json(
            { message: "Failed to load known schools" },
            { status: 500 },
        );
    }
}
