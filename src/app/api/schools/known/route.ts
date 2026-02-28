/***************************************************************
 *
 *                /api/schools/known/route.ts
 *
 *         Author: Jack Liu, Justin Ngan
 *           Date: 02/28/2026
 *
 *        Summary: API endpoint to fetch known schools from CSV
 *                 for frontend matching during upload
 *
 **************************************************************/

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

/**
 * Shape of each row in the CSV file.
 */
type CsvRow = {
    name: string;
    street: string;
    city: string;
    state: string;
    zipcode: string;
    county: string;
    lat: string;
    long: string;
};

/**
 * Known school data returned to frontend
 */
export type KnownSchool = {
    name: string;
    city: string;
    lat: number | null;
    long: number | null;
};

export async function GET() {
    try {
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

        const knownSchools: KnownSchool[] = records.map((row) => ({
            name: (row.name ?? "").trim(),
            city: (row.city ?? "").trim(),
            lat: row.lat ? Number(row.lat) : null,
            long: row.long ? Number(row.long) : null,
        }));

        // Filter out any schools with empty names or cities
        const validSchools = knownSchools.filter(
            (school) => school.name && school.city,
        );

        return NextResponse.json(validSchools);
    } catch (error) {
        console.error("Error reading school CSV:", error);
        return NextResponse.json(
            { message: "Failed to load known schools" },
            { status: 500 },
        );
    }
}
