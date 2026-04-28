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
    schoolHistoricNames,
} from "@/lib/schema";
import type { ConflictResolution } from "@/components/SpreadsheetConflicts";
import { standardize, toTitleCase } from "@/lib/string-standardize";
import { studentRequiredColumns } from "@/lib/required-spreadsheet-columns";
import { findRegionOf } from "@/lib/region-finder";
import { yearSchema, MIN_YEAR, MAX_YEAR } from "@/lib/year-validation";

type RowData = Array<string | number | boolean | null>;

type SchoolCoordinateData = {
    schoolKey: string; // composite: standardize(name) + "__" + city.toLowerCase()
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
 * Builds two maps from the school info spreadsheet:
 *   infoMap: composite key (standardize(name) + "__" + town.toLowerCase()) → school info fields
 *   townMap: standardize(name) → canonical town (title-cased)
 * Keying by name+town matches the DB unique constraint and avoids any schoolId dependency.
 * If a school appears on multiple rows (one per division), divisions are accumulated.
 * Comma-separated divisions within a single cell are also supported.
 */
function buildSchoolInfoMap(rawData: RowData[]): {
    infoMap: Map<string, SchoolInfoEntry>;
    townMap: Map<string, string>;
} {
    const infoMap = new Map<string, SchoolInfoEntry>();
    const townMap = new Map<string, string>();
    if (!rawData || rawData.length === 0) return { infoMap, townMap };

    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");

    const headers = rawData[0] as string[];
    const headerMap = new Map<string, number>();
    headers.forEach((h, i) => headerMap.set(normalize(h), i));

    const schoolNameIdx =
        headerMap.get(normalize("schoolName")) ??
        headerMap.get(normalize("School name"));
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

    if (schoolNameIdx === undefined || townIdx === undefined)
        return { infoMap, townMap };

    for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];
        const rawName = row[schoolNameIdx];
        if (rawName === null || rawName === undefined || rawName === "")
            continue;

        const schoolName = String(rawName).trim();
        const town = String(row[townIdx] ?? "")
            .trim()
            .replace(/, ma/i, "")
            .trim();
        if (!town) continue;

        const stdName = standardize(schoolName);
        const schoolKey = `${stdName}__${town.toLowerCase()}`;

        // Track standardize(name) → town for student-row lookups
        if (!townMap.has(stdName)) townMap.set(stdName, toTitleCase(town));

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

        const existing = infoMap.get(schoolKey);
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
            infoMap.set(schoolKey, {
                division: divisions,
                implementationModel,
                schoolType,
                competingStudents,
            });
        }
    }

    return { infoMap, townMap };
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

        const { infoMap: schoolInfoMap, townMap } = jsonReq.schoolInfoData
            ? buildSchoolInfoMap(JSON.parse(jsonReq.schoolInfoData))
            : {
                  infoMap: new Map<string, SchoolInfoEntry>(),
                  townMap: new Map<string, string>(),
              };

        const conflictResolutions: ConflictResolution[] =
            jsonReq.conflictResolutions ?? [];
        const useDbResolutions = conflictResolutions.filter(
            (r) => r.action === "use-db",
        );

        const coordsMap = new Map<
            string,
            { lat: number | null; long: number | null }
        >();
        for (const coord of schoolCoordinates) {
            coordsMap.set(coord.schoolKey, {
                lat: coord.lat,
                long: coord.long,
            });
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
        const allStandardizedNames = [
            ...new Set(
                filteredRows.map((r) =>
                    standardize(String(r[COLUMN_INDICES.schoolName])),
                ),
            ),
        ];
        const allTeacherIds = [
            ...new Set(
                filteredRows.map((r) => String(r[COLUMN_INDICES.teacherId])),
            ),
        ];

        const [existingSchoolsArr, existingTeachersArr] = await Promise.all([
            allStandardizedNames.length > 0
                ? db
                      .select()
                      .from(schools)
                      .where(
                          inArray(
                              schools.standardizedName,
                              allStandardizedNames,
                          ),
                      )
                : Promise.resolve([]),
            allTeacherIds.length > 0
                ? db
                      .select()
                      .from(teachers)
                      .where(inArray(teachers.teacherId, allTeacherIds))
                : Promise.resolve([]),
        ]);

        // Keyed by composite: standardize(name) + "__" + town.toLowerCase()
        const schoolMap = new Map(
            existingSchoolsArr.map((s) => [
                `${s.standardizedName}__${(s.town ?? "").toLowerCase()}`,
                s,
            ]),
        );
        const teacherMap = new Map(
            existingTeachersArr.map((t) => [t.teacherId, t]),
        );

        // For "use-db" resolutions, point the uploaded school's key to the
        // existing DB school so all rows for that uploaded school get routed
        // to the correct school record.
        if (useDbResolutions.length > 0) {
            const dbIds = [
                ...new Set(useDbResolutions.map((r) => r.dbSchoolId)),
            ];
            const resolvedDbSchools = await db
                .select()
                .from(schools)
                .where(inArray(schools.id, dbIds));
            const dbSchoolById = new Map(
                resolvedDbSchools.map((s) => [s.id, s]),
            );
            for (const r of useDbResolutions) {
                const dbSchool = dbSchoolById.get(r.dbSchoolId);
                if (dbSchool) {
                    schoolMap.set(r.uploadedSchoolKey, dbSchool);
                }
            }
        }

        // Auto-remap schools whose conflicts were resolved in a previous upload.
        // schoolHistoricNames stores the uploaded school's composite key
        // (mergedStandardizedName + mergedTown) alongside the absorbing school.
        // Without this, a previously-resolved uploaded school would silently
        // create a new DB record instead of routing to the correct school.
        if (allStandardizedNames.length > 0) {
            const historicAliases = await db
                .select({
                    mergedStandardizedName:
                        schoolHistoricNames.mergedStandardizedName,
                    mergedTown: schoolHistoricNames.mergedTown,
                    absorbingSchoolId: schoolHistoricNames.absorbingSchoolId,
                })
                .from(schoolHistoricNames)
                .where(
                    inArray(
                        schoolHistoricNames.mergedStandardizedName,
                        allStandardizedNames,
                    ),
                );

            if (historicAliases.length > 0) {
                const absorbingIds = [
                    ...new Set(historicAliases.map((a) => a.absorbingSchoolId)),
                ];
                const absorbingSchools = await db
                    .select()
                    .from(schools)
                    .where(inArray(schools.id, absorbingIds));
                const absorbingById = new Map(
                    absorbingSchools.map((s) => [s.id, s]),
                );
                for (const alias of historicAliases) {
                    if (!alias.mergedTown) continue;
                    const aliasKey = `${alias.mergedStandardizedName}__${alias.mergedTown}`;
                    if (schoolMap.has(aliasKey)) continue;
                    const absorbing = absorbingById.get(
                        alias.absorbingSchoolId,
                    );
                    if (absorbing) {
                        schoolMap.set(aliasKey, absorbing);
                    }
                }
            }
        }

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
        // Null byte separator — can't appear in spreadsheet values
        const yearlyTeacherMap = new Map<
            string,
            { schoolKey: string; teacherIdStr: string }
        >();

        for (const row of filteredRows) {
            const teacherIdValue = String(row[COLUMN_INDICES.teacherId]);
            const projectIdValue = String(row[COLUMN_INDICES.projectId]);

            // Canonical town from school spreadsheet (keyed by standardized name); fallback to student spreadsheet
            const stdSchoolName = standardize(
                String(row[COLUMN_INDICES.schoolName]),
            );
            const canonicalTown =
                townMap.get(stdSchoolName) ??
                toTitleCase(row[COLUMN_INDICES.city] as string);
            const schoolKey = `${stdSchoolName}__${canonicalTown.toLowerCase()}`;
            const schoolInfo = schoolInfoMap.get(schoolKey);

            // School: collect new ones or flag existing for coord/town update
            if (!schoolMap.has(schoolKey) && !newSchoolsMap.has(schoolKey)) {
                const coords = coordsMap.get(schoolKey);
                const region = findRegionOf(coords?.lat, coords?.long);
                newSchoolsMap.set(schoolKey, {
                    name: row[COLUMN_INDICES.schoolName] as string,
                    standardizedName: standardize(
                        row[COLUMN_INDICES.schoolName] as string,
                    ),
                    town: canonicalTown,
                    latitude: coords?.lat ?? null,
                    longitude: coords?.long ?? null,
                    region: region ?? "",
                });
            } else {
                const existing = schoolMap.get(schoolKey);
                if (existing) {
                    if (!existing.latitude && !existing.longitude) {
                        const coords = coordsMap.get(schoolKey);
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
                    const townFromMap = townMap.get(stdSchoolName);
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
                    schoolIdStr: schoolKey,
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
            yearlySchoolSet.add(schoolKey);
            const ytKey = `${schoolKey}\x00${teacherIdValue}`;
            if (!yearlyTeacherMap.has(ytKey)) {
                yearlyTeacherMap.set(ytKey, {
                    schoolKey,
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
                for (const s of inserted)
                    schoolMap.set(
                        `${s.standardizedName}__${(s.town ?? "").toLowerCase()}`,
                        s,
                    );
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
        const yearlySchoolValues = [...yearlySchoolSet].map((schoolKey) => {
            const school = schoolMap.get(schoolKey)!;
            const info = schoolInfoMap.get(schoolKey);
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
            ({ schoolKey, teacherIdStr }) => ({
                year,
                teacherId: teacherMap.get(teacherIdStr)!.id,
                schoolId: schoolMap.get(schoolKey)!.id,
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

        // Persist "use-db" resolutions as historic name aliases so future
        // uploads auto-remap without showing the conflict dialog again.
        if (useDbResolutions.length > 0) {
            const aliasValues = useDbResolutions.map((r) => {
                const [stdName, town] = r.uploadedSchoolKey.split("__");
                return {
                    absorbingSchoolId: r.dbSchoolId,
                    mergedName: r.uploadedSchoolName,
                    mergedStandardizedName: stdName,
                    mergedTown: town ?? "",
                };
            });
            await db
                .insert(schoolHistoricNames)
                .values(aliasValues)
                .onConflictDoNothing();
        }

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
