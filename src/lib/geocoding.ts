import { db } from "@/lib/db";
import { schools } from "@/lib/schema";
import fs from "fs";
import { eq } from "drizzle-orm";
import path from "path";
import { parse } from "csv-parse/sync";
import { sql } from "drizzle-orm";

type SchoolLocation = {
    lat: number;
    long: number;
};

type CsvRow = {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    county: string;
    lat: string;
    long: string;
};

type SchoolID = {
    name: string;
    city: string;
};

// 1. We look for school in the database
// 2. Confirm zipCode code / town if its there
// 3. Then see if location exist, store it if so
// 4. If school or zipCode code or location dont exist, we query the csv and populate database, and store location

// Coordinated stored as [lat, long]

export async function updateLocation(
    schoolID: SchoolID,
): Promise<SchoolLocation | null> {
    const schoolIDNum = await dbHasSchool(schoolID);
    if (schoolIDNum === null) return null;

    let schoolLocation = await getSchoolLatLong(schoolIDNum);
    if (schoolLocation === null) {
        schoolLocation = findSchoolLocation(schoolID, "PATH!!!");
    }

    if (schoolLocation === null) return null;

    await saveSchoolLocation(schoolIDNum, schoolLocation);
    return schoolLocation;
}

export function doSchoolsMatch(schoolID: SchoolID, other: SchoolID) {
    return (
        schoolID.name.toLowerCase() === other.name.toLowerCase() &&
        schoolID.city.toLowerCase() === other.city.toLowerCase()
    );
}

export async function saveSchoolLocation(
    schoolIDNum: number,
    schoolLoc: SchoolLocation,
): Promise<void> {
    await db
        .update(schools)
        .set({
            lat: schoolLoc.lat,
            long: schoolLoc.long,
        })
        .where(eq(schools.id, schoolIDNum));
}

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

    if (!match) return null;

    if (!match.lat || !match.long) return null;

    return {
        lat: Number(match.lat),
        long: Number(match.long),
    };
}

export async function dbHasSchool(schoolID: SchoolID): Promise<number | null> {
    const result = await db
        .select({ id: schools.id })
        .from(schools)
        .where(
            sql`
                lower(${schools.name}) = ${schoolID.name.toLowerCase()}
            AND lower(${schools.town}) = ${schoolID.city.toLowerCase()}
            `,
        )
        .limit(1);

    return result.length ? result[0].id : null;
}

export async function getSchoolLatLong(
    schoolIDNum: number,
): Promise<SchoolLocation | null> {
    const result = await db
        .select({
            lat: schools.lat,
            long: schools.long,
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
