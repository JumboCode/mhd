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

import { standardize } from "./school_name_standardize";

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
    schoolId: string;
    rowIndices: number[]; // Which rows in the spreadsheet reference this school
};

/**
 * School with assigned coordinates (matched or manually assigned)
 */
export type SchoolWithCoordinates = {
    name: string;
    city: string;
    schoolId: string;
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
 * Extracts unique schools from spreadsheet data
 */
export function extractSchoolsFromSpreadsheet(
    spreadsheetData: (string | number | boolean | null | undefined)[][],
    columnIndices: { schoolName: number; city: number; schoolId: number },
): UploadedSchool[] {
    const schoolMap = new Map<string, UploadedSchool>();

    // Skip header row
    for (let i = 1; i < spreadsheetData.length; i++) {
        const row = spreadsheetData[i];
        if (!row || row.length === 0) continue;

        const name = String(row[columnIndices.schoolName] ?? "").trim();
        const city = String(row[columnIndices.city] ?? "").trim();
        const schoolId = String(row[columnIndices.schoolId] ?? "").trim();

        if (!name || !city) continue;

        // Use schoolId as unique key (one school per ID, multiple rows allowed)
        const key = schoolId;

        if (schoolMap.has(key)) {
            schoolMap.get(key)!.rowIndices.push(i);
        } else {
            schoolMap.set(key, {
                name,
                city,
                schoolId,
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
                schoolId: uploaded.schoolId,
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
): { schoolName: number; city: number; schoolId: number } | null {
    const normalizeColumnName = (name: string): string => {
        return name.toLowerCase().replace(/\s+/g, "");
    };

    const headerMap = new Map<string, number>();
    headers.forEach((header, index) => {
        if (header != null) {
            headerMap.set(normalizeColumnName(String(header)), index);
        }
    });

    const schoolNameIdx = headerMap.get("schoolname");
    const cityIdx = headerMap.get("city");
    const schoolIdIdx = headerMap.get("schoolid");

    if (
        schoolNameIdx === undefined ||
        cityIdx === undefined ||
        schoolIdIdx === undefined
    ) {
        return null;
    }

    return {
        schoolName: schoolNameIdx,
        city: cityIdx,
        schoolId: schoolIdIdx,
    };
}
