/***************************************************************
 *
 *                Geocoding.ts
 *
 *         Author: Zander Barba & Steven Bagade
 *                 & Hansini ...
 *         Date: 02/01/2026
 *
 *        Summary: Utilities for resolving and storing school
 *        latitude/longitude data.
 *
 **************************************************************/

/**
 * Using [lat, long] for formatting
 */

/**
 * Flow:
 * 1. Check if the school exists in the database
 * 2. If it exists, check if lat/long is already stored
 * 3. If missing, search a CSV file for coordinates
 * 4. Persist coordinates back to the database
 */

import { type CsvRow } from "@/types/csv";
import { db } from "@/lib/db";
import { schools } from "@/lib/schema";
import fs from "fs";
import { eq, sql } from "drizzle-orm";
import path from "path";
import { parse } from "csv-parse/sync";

/**
 * Represents a resolved geographic location.
 */
type SchoolLocation = {
    lat: number;
    long: number;
};

/**
 * Absolute path to the CSV file containing school locations.
 */
const csvPath = path.join(process.cwd(), "public", "MA_schools_long_lat.csv");

/**
 * Identifies a school using name + city.
 * This mirrors how schools are uniquely matched.
 */
export type SchoolID = {
    name: string;
    city: string;
};

/**
 * Attempts to retrieve a school's location.
 *
 * - Verifies the school exists in the database
 * - Uses cached DB coordinates if available
 * - Falls back to CSV lookup if missing
 * - Persists newly found coordinates
 *
 * @param schoolID School identifier (name + city)
 * @returns The school's latitude/longitude, or null if unresolved
 */
export async function updateLocation(schoolID: SchoolID) {
    const schoolIDNum = await dbHasSchool(schoolID);
    if (schoolIDNum === null) return;

    let schoolLocation = await getSchoolLatLong(schoolIDNum);

    if (schoolLocation === null) {
        schoolLocation = findSchoolLocation(schoolID, csvPath);
    }

    if (schoolLocation === null) {
        return;
    }

    await saveSchoolLocation(schoolIDNum, schoolLocation);
}

/**
 * Case-insensitive comparison between two school identifiers.
 *
 * @param schoolID First school identifier
 * @param other Second school identifier
 * @returns True if name and city match
 */
export function doSchoolsMatch(schoolID: SchoolID, other: SchoolID) {
    return schoolID.name === other.name && schoolID.city === other.city;
}

/**
 * Saves latitude and longitude values for a school in the database.
 *
 * @param schoolIDNum Database ID of the school
 * @param schoolLoc Resolved geographic coordinates
 */
export async function saveSchoolLocation(
    schoolIDNum: number,
    schoolLoc: SchoolLocation,
): Promise<void> {
    await db
        .update(schools)
        .set({
            latitude: schoolLoc.lat,
            longitude: schoolLoc.long,
        })
        .where(eq(schools.id, schoolIDNum));
}

/**
 * Searches the CSV file for a matching school and extracts coordinates.
 *
 * @param schoolID School identifier (name + city)
 * @param csvRelativePath Relative path to the CSV file
 * @returns Parsed latitude/longitude or null if not found
 */
export function findSchoolLocation(
    schoolID: SchoolID,
    csvRelativePath: string,
): SchoolLocation | null {
    const csvPath = path.resolve(process.cwd(), csvRelativePath);
    const fileContents = fs.readFileSync(csvPath, "utf-8");

    const records = parse(fileContents, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    }) as CsvRow[];

    const match = records.find((row) =>
        doSchoolsMatch(schoolID, {
            name: row.name,
            city: row.city,
        }),
    );

    if (!match || !match.lat || !match.long) return null;

    return {
        lat: Number(match.lat),
        long: Number(match.long),
    };
}

/**
 * Checks whether a school exists in the database.
 *
 * @param schoolID School identifier (name + city)
 * @returns School database ID or null if not found
 */
export async function dbHasSchool(schoolID: SchoolID): Promise<number | null> {
    const result = await db
        .select({ id: schools.id })
        .from(schools)
        .where(
            sql`
                lower(${schools.name}) = lower(${schoolID.name})
            AND lower(${schools.town}) = lower(${schoolID.city})
            `,
        )
        .limit(1);

    return result.length ? result[0].id : null;
}

/**
 * Retrieves a school's latitude/longitude from the database.
 *
 * @param schoolIDNum Database ID of the school
 * @returns Stored coordinates or null if missing
 */
export async function getSchoolLatLong(
    schoolIDNum: number,
): Promise<SchoolLocation | null> {
    const result = await db
        .select({
            lat: schools.latitude,
            long: schools.longitude,
        })
        .from(schools)
        .where(eq(schools.id, schoolIDNum))
        .limit(1);

    if (result.length === 0) return null;

    const { lat, long } = result[0];
    if (lat === null || long === null) return null;

    return {
        lat: Number(lat),
        long: Number(long),
    };
}
