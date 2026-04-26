/***************************************************************
 *
 *                /api/upload/route.ts
 *
 *         Author: Anne Wu & Chiara Martello
 *           Date: 11/17/2025
 *
 *        Summary: API route responsible for getting excel sheet data and
 *                 inserting that data into a NEON database with drizzle.
 *
 **************************************************************/

import { NextRequest, NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
    schools,
    teachers,
    projects,
    yearlyTeacherParticipation,
    yearlySchoolParticipation,
    yearMetadata,
} from "@/lib/schema";
import { standardize, toTitleCase } from "@/lib/string-standardize";
import { studentRequiredColumns } from "@/lib/required-spreadsheet-columns";
import { findRegionOf } from "@/lib/region-finder";
import { yearSchema, MIN_YEAR, MAX_YEAR } from "@/lib/year-validation";

type RowData = Array<string | number | boolean | null>;

type SchoolCoordinateData = {
    schoolId: string;
    lat: number | null;
    long: number | null;
};

let currentProgress = {
    progress: 0,
    complete: false,
};

type SchoolInfoEntry = {
    division: string[];
    implementationModel: string;
    schoolType: string;
    competingStudents: number;
    town: string;
};

/**
 * Removes extraneous whitespace around slashes, e.g. "Private/ Independent" → "Private/Independent".
 */
function normalizeSlashes(s: string): string {
    return s.replace(/\s*\/\s*/g, "/").trim();
}

/**
 * Parses a division cell value into one or more division strings.
 * Handles both comma-separated values in a single cell and empty values.
 */
function parseDivisions(raw: string): string[] {
    return raw
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);
}

/**
 * Builds a lookup map from schoolId → school info fields using the school info spreadsheet.
 * If a school appears on multiple rows (one per division), divisions are accumulated.
 * Comma-separated divisions within a single cell are also supported.
 */
function buildSchoolInfoMap(rawData: RowData[]): Map<string, SchoolInfoEntry> {
    const map = new Map<string, SchoolInfoEntry>();
    if (!rawData || rawData.length === 0) return map;

    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");

    const headers = rawData[0] as string[];
    const headerMap = new Map<string, number>();
    headers.forEach((h, i) => headerMap.set(normalize(h), i));

    const schoolIdIdx =
        headerMap.get(normalize("schoolId")) ??
        headerMap.get(normalize("School id"));
    const divisionIdx = headerMap.get(normalize("division"));
    const implModelIdx =
        headerMap.get(normalize("implementationModel")) ??
        headerMap.get(normalize("Implementation Model"));
    const schoolTypeIdx =
        headerMap.get(normalize("schoolType")) ??
        headerMap.get(normalize("School Type"));
    const competingStudentsIdx =
        headerMap.get(
            normalize("# students who began project at the school level"),
        ) ??
        headerMap.get(normalize("competingStudents")) ??
        headerMap.get(normalize("competing students"));
    const townIdx =
        headerMap.get(normalize("Town")) ?? headerMap.get(normalize("town"));

    if (schoolIdIdx === undefined) return map;

    for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];
        const rawId = row[schoolIdIdx];
        if (rawId === null || rawId === undefined || rawId === "") continue;

        const schoolId = String(rawId).trim();

        const divisions =
            divisionIdx !== undefined
                ? parseDivisions(String(row[divisionIdx] ?? ""))
                : [];
        const implementationModel =
            implModelIdx !== undefined
                ? normalizeSlashes(String(row[implModelIdx] ?? ""))
                : "";
        const schoolType =
            schoolTypeIdx !== undefined
                ? normalizeSlashes(String(row[schoolTypeIdx] ?? ""))
                : "";
        const competingStudents =
            competingStudentsIdx !== undefined
                ? Number(row[competingStudentsIdx] ?? 0) || 0
                : 0;
        const town =
            townIdx !== undefined ? String(row[townIdx] ?? "").trim() : "";

        const existing = map.get(schoolId);
        if (existing) {
            // Accumulate divisions from additional rows for the same school
            for (const div of divisions) {
                if (!existing.division.includes(div)) {
                    existing.division.push(div);
                }
            }
            // Take the first non-zero competingStudents value
            if (existing.competingStudents === 0 && competingStudents > 0) {
                existing.competingStudents = competingStudents;
            }
        } else {
            map.set(schoolId, {
                division: divisions,
                implementationModel,
                schoolType,
                competingStudents,
                town,
            });
        }
    }

    return map;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

export async function POST(req: NextRequest) {
    currentProgress = { progress: 0, complete: false };
    try {
        const jsonReq = await req.json();
        const yearResult = yearSchema.safeParse(jsonReq.formYear);
        if (!yearResult.success) {
            return NextResponse.json(
                {
                    message: `Year must be between ${MIN_YEAR} and ${MAX_YEAR}.`,
                },
                { status: 400 },
            );
        }
        const year = yearResult.data;
        const rawData: RowData[] = JSON.parse(jsonReq.formData);
        const schoolCoordinates: SchoolCoordinateData[] =
            jsonReq.schoolCoordinates || [];

        const schoolInfoMap: Map<string, SchoolInfoEntry> =
            jsonReq.schoolInfoData
                ? buildSchoolInfoMap(JSON.parse(jsonReq.schoolInfoData))
                : new Map();

        // Maps schoolId → town name sourced from the school spreadsheet.
        // Falls back to the student spreadsheet's city column when a school has no entry here.
        const townMap = new Map<string, string>();
        for (const [schoolId, info] of schoolInfoMap) {
            if (info.town) townMap.set(schoolId, toTitleCase(info.town));
        }

        const coordsMap = new Map<
            string,
            { lat: number | null; long: number | null }
        >();
        for (const coord of schoolCoordinates) {
            coordsMap.set(coord.schoolId, { lat: coord.lat, long: coord.long });
        }

        if (rawData.length === 0) {
            return NextResponse.json(
                { message: "No data provided" },
                { status: 400 },
            );
        }

        const headers = rawData[0] as string[];
        const normalizeColumnName = (name: string): string =>
            name.toLowerCase().replace(/\s+/g, "");

        const headerMap = new Map<string, number>();
        headers.forEach((header, index) => {
            headerMap.set(normalizeColumnName(header), index);
        });

        const getColumnIndex = (columnName: string): number | undefined =>
            headerMap.get(normalizeColumnName(columnName));

        const COLUMN_INDICES: Record<string, number> = {};
        studentRequiredColumns.forEach((col) => {
            const index = getColumnIndex(col);
            if (index !== undefined) {
                COLUMN_INDICES[col] = index;
            }
        });

        const missingColumns = studentRequiredColumns.filter(
            (col) => COLUMN_INDICES[col] === undefined,
        );

        if (missingColumns.length > 0) {
            return NextResponse.json(
                {
                    message: `Missing required columns: ${missingColumns.join(", ")}`,
                },
                { status: 400 },
            );
        }

        const filteredRows = rawData.slice(1).filter((row) => row.length > 0);

        // Phase 1: Delete existing year data in parallel
        await Promise.all([
            db.delete(projects).where(eq(projects.year, year)),
            db
                .delete(yearlySchoolParticipation)
                .where(eq(yearlySchoolParticipation.year, year)),
            db
                .delete(yearlyTeacherParticipation)
                .where(eq(yearlyTeacherParticipation.year, year)),
        ]);

        currentProgress.progress = 10;

        // Phase 2: Pre-fetch all referenced schools and teachers in bulk
        const allSchoolIds = [
            ...new Set(
                filteredRows.map((r) => String(r[COLUMN_INDICES.schoolId])),
            ),
        ];
        const allTeacherIds = [
            ...new Set(
                filteredRows.map((r) => String(r[COLUMN_INDICES.teacherId])),
            ),
        ];

        const [existingSchoolsArr, existingTeachersArr] = await Promise.all([
            allSchoolIds.length > 0
                ? db
                      .select()
                      .from(schools)
                      .where(inArray(schools.schoolId, allSchoolIds))
                : Promise.resolve([]),
            allTeacherIds.length > 0
                ? db
                      .select()
                      .from(teachers)
                      .where(inArray(teachers.teacherId, allTeacherIds))
                : Promise.resolve([]),
        ]);

        const schoolMap = new Map(
            existingSchoolsArr.map((s) => [s.schoolId, s]),
        );
        const teacherMap = new Map(
            existingTeachersArr.map((t) => [t.teacherId, t]),
        );

        currentProgress.progress = 20;

        // Phase 3: Process all rows in memory — no DB calls
        type ProjectAccumulator = {
            schoolIdStr: string;
            teacherIdStr: string;
            projectId: string;
            title: string;
            division: string;
            categoryId: string;
            category: string;
            teamProject: boolean;
            numStudents: number;
        };

        const newSchoolsMap = new Map<
            string,
            {
                schoolId: string;
                name: string;
                standardizedName: string;
                town: string;
                latitude: number | null;
                longitude: number | null;
                region: string;
            }
        >();
        const coordUpdateMap = new Map<number, { lat: number; long: number }>();
        const townUpdateMap = new Map<number, string>();
        const newTeachersMap = new Map<
            string,
            { teacherId: string; name: string; email: string }
        >();
        const projectDataMap = new Map<string, ProjectAccumulator>();
        const yearlySchoolSet = new Set<string>();
        // Null byte separator — can't appear in spreadsheet ID values
        const yearlyTeacherMap = new Map<
            string,
            { schoolIdStr: string; teacherIdStr: string }
        >();

        for (const row of filteredRows) {
            const schoolIdValue = String(row[COLUMN_INDICES.schoolId]);
            const teacherIdValue = String(row[COLUMN_INDICES.teacherId]);
            const projectIdValue = String(row[COLUMN_INDICES.projectId]);
            const schoolInfo = schoolInfoMap.get(schoolIdValue);

            // School: collect new ones or flag existing for coord/town update
            if (
                !schoolMap.has(schoolIdValue) &&
                !newSchoolsMap.has(schoolIdValue)
            ) {
                const coords = coordsMap.get(schoolIdValue);
                const region = findRegionOf(coords?.lat, coords?.long);
                // School's town is from school spreadsheet; fallback to student
                // spreadsheet if not in school spreadsheet
                const town =
                    townMap.get(schoolIdValue) ??
                    toTitleCase(row[COLUMN_INDICES.city] as string);
                newSchoolsMap.set(schoolIdValue, {
                    schoolId: schoolIdValue,
                    name: row[COLUMN_INDICES.schoolName] as string,
                    standardizedName: standardize(
                        row[COLUMN_INDICES.schoolName] as string,
                    ),
                    town,
                    latitude: coords?.lat ?? null,
                    longitude: coords?.long ?? null,
                    region: region ?? "",
                });
            } else {
                const existing = schoolMap.get(schoolIdValue);
                if (existing) {
                    if (!existing.latitude && !existing.longitude) {
                        const coords = coordsMap.get(schoolIdValue);
                        if (
                            coords?.lat &&
                            coords?.long &&
                            !coordUpdateMap.has(existing.id)
                        ) {
                            coordUpdateMap.set(existing.id, {
                                lat: coords.lat,
                                long: coords.long,
                            });
                        }
                    }
                    const townFromMap = townMap.get(schoolIdValue);

                    // Only set a new town if it doesn't already exist in db
                    if (
                        townFromMap &&
                        !existing.town &&
                        !townUpdateMap.has(existing.id)
                    ) {
                        townUpdateMap.set(existing.id, townFromMap);
                    }
                }
            }

            // Teacher: collect new ones
            if (
                !teacherMap.has(teacherIdValue) &&
                !newTeachersMap.has(teacherIdValue)
            ) {
                newTeachersMap.set(teacherIdValue, {
                    teacherId: teacherIdValue,
                    name: row[COLUMN_INDICES.teacherName] as string,
                    email: row[COLUMN_INDICES.teacherEmail] as string,
                });
            }

            // Project: accumulate student count
            if (!projectDataMap.has(projectIdValue)) {
                projectDataMap.set(projectIdValue, {
                    schoolIdStr: schoolIdValue,
                    teacherIdStr: teacherIdValue,
                    projectId: projectIdValue,
                    title: row[COLUMN_INDICES.title] as string,
                    division: (schoolInfo?.division ?? []).join(", "),
                    categoryId: String(row[COLUMN_INDICES.categoryId]),
                    category: row[COLUMN_INDICES.categoryName] as string,
                    teamProject: row[COLUMN_INDICES.teamProject] === "True",
                    numStudents: 0,
                });
            }
            projectDataMap.get(projectIdValue)!.numStudents++;

            // Yearly participations
            yearlySchoolSet.add(schoolIdValue);
            const ytKey = `${schoolIdValue}\x00${teacherIdValue}`;
            if (!yearlyTeacherMap.has(ytKey)) {
                yearlyTeacherMap.set(ytKey, {
                    schoolIdStr: schoolIdValue,
                    teacherIdStr: teacherIdValue,
                });
            }
        }

        currentProgress.progress = 40;

        // Phase 4: Batch insert new schools
        if (newSchoolsMap.size > 0) {
            for (const chunk of chunkArray([...newSchoolsMap.values()], 500)) {
                const inserted = await db
                    .insert(schools)
                    .values(chunk)
                    .returning();
                for (const s of inserted) schoolMap.set(s.schoolId, s);
            }
        }

        // Update coordinates and towns for existing schools (run in parallel per school, not per row)
        const schoolUpdatePromises: Promise<unknown>[] = [];
        for (const [id, { lat, long }] of coordUpdateMap) {
            const town = townUpdateMap.get(id);
            schoolUpdatePromises.push(
                db
                    .update(schools)
                    .set(
                        town
                            ? { latitude: lat, longitude: long, town }
                            : { latitude: lat, longitude: long },
                    )
                    .where(eq(schools.id, id)),
            );
            townUpdateMap.delete(id);
        }
        for (const [id, town] of townUpdateMap) {
            schoolUpdatePromises.push(
                db.update(schools).set({ town }).where(eq(schools.id, id)),
            );
        }
        if (schoolUpdatePromises.length > 0) {
            await Promise.all(schoolUpdatePromises);
        }

        currentProgress.progress = 55;

        // Phase 5: Batch insert new teachers
        if (newTeachersMap.size > 0) {
            for (const chunk of chunkArray([...newTeachersMap.values()], 500)) {
                const inserted = await db
                    .insert(teachers)
                    .values(chunk)
                    .returning();
                for (const t of inserted) teacherMap.set(t.teacherId, t);
            }
        }

        currentProgress.progress = 65;

        // Phase 6: Batch insert projects (year was deleted, so all are new)
        const projectValues = [...projectDataMap.values()].map((p) => ({
            schoolId: schoolMap.get(p.schoolIdStr)!.id,
            teacherId: teacherMap.get(p.teacherIdStr)!.id,
            projectId: p.projectId,
            title: p.title,
            division: p.division,
            categoryId: p.categoryId,
            category: p.category,
            year,
            teamProject: p.teamProject,
            numStudents: p.numStudents,
        }));

        for (const chunk of chunkArray(projectValues, 500)) {
            await db.insert(projects).values(chunk);
        }

        currentProgress.progress = 78;

        // Phase 7: Batch insert yearly school participation (all new, year was deleted)
        const yearlySchoolValues = [...yearlySchoolSet].map((schoolIdStr) => {
            const school = schoolMap.get(schoolIdStr)!;
            const info = schoolInfoMap.get(schoolIdStr);
            return {
                year,
                schoolId: school.id,
                division: info?.division ?? [],
                implementationModel: info?.implementationModel ?? "",
                schoolType: info?.schoolType ?? "",
                competingStudents: info?.competingStudents ?? 0,
            };
        });

        for (const chunk of chunkArray(yearlySchoolValues, 500)) {
            await db.insert(yearlySchoolParticipation).values(chunk);
        }

        currentProgress.progress = 90;

        // Phase 8: Batch insert yearly teacher participation (all new, year was deleted)
        const yearlyTeacherValues = [...yearlyTeacherMap.values()].map(
            ({ schoolIdStr, teacherIdStr }) => ({
                year,
                teacherId: teacherMap.get(teacherIdStr)!.id,
                schoolId: schoolMap.get(schoolIdStr)!.id,
            }),
        );

        for (const chunk of chunkArray(yearlyTeacherValues, 500)) {
            await db.insert(yearlyTeacherParticipation).values(chunk);
        }

        currentProgress.progress = 97;

        const now = new Date();
        await db
            .insert(yearMetadata)
            .values({ year, uploadedAt: now, lastUpdatedAt: now })
            .onConflictDoUpdate({
                target: yearMetadata.year,
                set: { uploadedAt: now, lastUpdatedAt: now },
            });

        currentProgress.progress = 100;
        currentProgress.complete = true;

        return NextResponse.json(
            { message: "Upload complete" },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Import failed", error: String(error) },
            { status: 500 },
        );
    }
}

export async function GET() {
    let interval: NodeJS.Timeout;

    const stream = new ReadableStream({
        start(controller) {
            interval = setInterval(() => {
                try {
                    if (!currentProgress.complete) {
                        controller.enqueue(
                            `data: ${JSON.stringify(currentProgress)}\n\n`,
                        );
                    } else {
                        controller.enqueue(
                            `data: ${JSON.stringify(currentProgress)}\n\n`,
                        );
                        clearInterval(interval);
                        controller.close();
                    }
                } catch (err) {
                    clearInterval(interval);
                    controller.close();
                }
            }, 500);
        },
        cancel() {
            clearInterval(interval);
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
