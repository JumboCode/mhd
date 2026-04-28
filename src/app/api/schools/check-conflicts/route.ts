import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { schools, schoolHistoricNames } from "@/lib/schema";
import { inArray } from "drizzle-orm";
import { internalError } from "@/lib/api-utils";

export type ConflictUploadedSchool = {
    name: string;
    town: string;
    schoolKey: string; // standardize(name) + "__" + town.toLowerCase()
};

export type ConflictDbSchool = {
    id: number;
    name: string;
    town: string;
    standardizedName: string;
};

export type SchoolConflict = {
    uploaded: ConflictUploadedSchool;
    db: ConflictDbSchool;
};

// Returns conflicts (uploaded schools whose standardized name matches a DB
// school but whose town does not (case-insensitive), excluding schools that
// already have a historic name alias (i.e. resolved in a previous upload)).
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const uploadedSchools: ConflictUploadedSchool[] = body.schools ?? [];

        if (uploadedSchools.length === 0) {
            return NextResponse.json({ conflicts: [] });
        }

        const stdNames = [
            ...new Set(uploadedSchools.map((s) => s.schoolKey.split("__")[0])),
        ];

        const [dbSchools, existingAliases] = await Promise.all([
            db
                .select({
                    id: schools.id,
                    name: schools.name,
                    town: schools.town,
                    standardizedName: schools.standardizedName,
                })
                .from(schools)
                .where(inArray(schools.standardizedName, stdNames)),
            db
                .select({
                    mergedStandardizedName:
                        schoolHistoricNames.mergedStandardizedName,
                    mergedTown: schoolHistoricNames.mergedTown,
                })
                .from(schoolHistoricNames)
                .where(
                    inArray(
                        schoolHistoricNames.mergedStandardizedName,
                        stdNames,
                    ),
                ),
        ]);

        const aliasSet = new Set(
            existingAliases.map(
                (a) => `${a.mergedStandardizedName}__${a.mergedTown}`,
            ),
        );

        const conflicts: SchoolConflict[] = [];
        const autoRemappedKeys: string[] = [];

        for (const uploaded of uploadedSchools) {
            if (aliasSet.has(uploaded.schoolKey)) {
                autoRemappedKeys.push(uploaded.schoolKey);
                continue;
            }

            const stdName = uploaded.schoolKey.split("__")[0];
            const uploadedTown = uploaded.town.toLowerCase();

            for (const dbSchool of dbSchools) {
                if (dbSchool.standardizedName !== stdName) continue;
                if ((dbSchool.town ?? "").toLowerCase() === uploadedTown)
                    continue;
                conflicts.push({ uploaded, db: dbSchool });
            }
        }

        return NextResponse.json({ conflicts, autoRemappedKeys });
    } catch {
        return internalError();
    }
}
