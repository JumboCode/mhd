/***************************************************************
 *
 *                school-matching.ts
 *
 *         Author: Jack Liu, Justin Ngan
 *           Date: 02/28/2026
 *
 *        Summary: Frontend school matching service that matches
 *                 uploaded schools against known schools from CSV.
 *                 Uses the same logic as the backend geocoding.
 *
 **************************************************************/

import { standardize } from "./string-standardize";

/**
 * Known school data from the CSV
 */
export type KnownSchool = {
    name: string;
    city: string;
    lat: number | null;
    long: number | null;
};

/**
 * School extracted from uploaded spreadsheet
 */
export type UploadedSchool = {
    name: string;
    city: string;
    schoolKey: string; // composite: standardize(name) + "__" + canonicalTown.toLowerCase()
    rowIndices: number[]; // Which rows in the spreadsheet reference this school
};

/**
 * School with assigned coordinates (matched or manually assigned)
 */
export type SchoolWithCoordinates = {
    name: string;
    city: string;
    schoolKey: string; // composite: standardize(name) + "__" + canonicalTown.toLowerCase()
    lat: number | null;
    long: number | null;
};

/**
 * Result of the matching process
 */
export type SchoolMatchResult = {
    matched: SchoolWithCoordinates[];
    unmatched: UploadedSchool[];
};

/**
 * Builds a standardizedName → town lookup from the school info spreadsheet.
 * Used to get the canonical town for each school during matching.
 */
export function buildSchoolTownMap(
    schoolInfoData: (string | number | boolean | null | undefined)[][],
): Map<string, string> {
    const townMap = new Map<string, string>();
    if (!schoolInfoData || schoolInfoData.length === 0) return townMap;

    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");
    const headers = schoolInfoData[0];
    const headerMap = new Map<string, number>();
    headers.forEach((h, i) => headerMap.set(normalize(String(h ?? "")), i));

    const schoolNameIdx =
        headerMap.get(normalize("School name")) ??
        headerMap.get(normalize("schoolName"));
    const townIdx = headerMap.get(normalize("Town"));

    if (schoolNameIdx === undefined || townIdx === undefined) return townMap;

    for (let i = 1; i < schoolInfoData.length; i++) {
        const row = schoolInfoData[i];
        if (!row) continue;
        const name = String(row[schoolNameIdx] ?? "").trim();
        const town = String(row[townIdx] ?? "").trim();
        const key = standardize(name);
        if (key && town && !townMap.has(key)) {
            townMap.set(key, town);
        }
    }

    return townMap;
}

/**
 * Extracts unique schools from spreadsheet data.
 * Uses the school spreadsheet's townMap (standardizedName → town) to get the
 * canonical town for the key, falling back to the student spreadsheet's city.
 */
export function extractSchoolsFromSpreadsheet(
    spreadsheetData: (string | number | boolean | null | undefined)[][],
    columnIndices: { schoolName: number; city: number },
    townMap?: Map<string, string>,
): UploadedSchool[] {
    const schoolMap = new Map<string, UploadedSchool>();

    // Skip header row
    for (let i = 1; i < spreadsheetData.length; i++) {
        const row = spreadsheetData[i];
        if (!row || row.length === 0) continue;

        const name = String(row[columnIndices.schoolName] ?? "").trim();
        const city = String(row[columnIndices.city] ?? "").trim();

        if (!name || !city) continue;

        const canonicalTown = townMap?.get(standardize(name)) ?? city;
        const schoolKey = `${standardize(name)}__${canonicalTown.toLowerCase()}`;

        if (schoolMap.has(schoolKey)) {
            schoolMap.get(schoolKey)!.rowIndices.push(i);
        } else {
            schoolMap.set(schoolKey, {
                name,
                city: canonicalTown,
                schoolKey,
                rowIndices: [i],
            });
        }
    }

    return Array.from(schoolMap.values());
}

/**
 * Checks if two schools match using exact comparison (case-insensitive)
 * This mirrors the backend doSchoolsMatch function
 */
function exactMatch(
    uploadedName: string,
    uploadedCity: string,
    knownName: string,
    knownCity: string,
): boolean {
    return (
        uploadedName.toLowerCase() === knownName.toLowerCase() &&
        uploadedCity.toLowerCase() === knownCity.toLowerCase()
    );
}

/**
 * Checks if two schools match after standardization
 */
function standardizedMatch(
    uploadedName: string,
    uploadedCity: string,
    knownName: string,
    knownCity: string,
): boolean {
    const uploadedStd = standardize(uploadedName) + standardize(uploadedCity);
    const knownStd = standardize(knownName) + standardize(knownCity);
    return uploadedStd === knownStd;
}

/**
 * Main matching function - matches uploaded schools against known schools.
 * Returns matched schools (with coordinates) and unmatched schools (need manual assignment).
 */
export function matchSchools(
    uploadedSchools: UploadedSchool[],
    knownSchools: KnownSchool[],
): SchoolMatchResult {
    const matched: SchoolWithCoordinates[] = [];
    const unmatched: UploadedSchool[] = [];

    for (const uploaded of uploadedSchools) {
        // Try exact match first
        let matchedSchool = knownSchools.find((known) =>
            exactMatch(uploaded.name, uploaded.city, known.name, known.city),
        );

        // Try standardized match if exact match fails
        if (!matchedSchool) {
            matchedSchool = knownSchools.find((known) =>
                standardizedMatch(
                    uploaded.name,
                    uploaded.city,
                    known.name,
                    known.city,
                ),
            );
        }

        if (
            matchedSchool &&
            matchedSchool.lat !== null &&
            matchedSchool.long !== null
        ) {
            matched.push({
                name: uploaded.name,
                city: uploaded.city,
                schoolKey: uploaded.schoolKey,
                lat: matchedSchool.lat,
                long: matchedSchool.long,
            });
        } else {
            // No match found - add to unmatched list
            unmatched.push(uploaded);
        }
    }

    return { matched, unmatched };
}

/**
 * Gets column indices from spreadsheet headers
 */
export function getSchoolColumnIndices(
    headers: (string | number | boolean | null | undefined)[],
): { schoolName: number; city: number } | null {
    const normalizeColumnName = (name: string): string => {
        return name.toLowerCase().replace(/\s+/g, "");
    };

    const headerMap = new Map<string, number>();
    headers.forEach((header, index) => {
        if (header !== null) {
            headerMap.set(normalizeColumnName(String(header)), index);
        }
    });

    const schoolNameIdx = headerMap.get("schoolname");
    const cityIdx = headerMap.get("city");

    if (schoolNameIdx === undefined || cityIdx === undefined) {
        return null;
    }

    return {
        schoolName: schoolNameIdx,
        city: cityIdx,
    };
}
