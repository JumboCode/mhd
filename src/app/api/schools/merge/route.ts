import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
    schools,
    schoolHistoricNames,
    projects,
    yearlySchoolParticipation,
    yearlyTeacherParticipation,
} from "@/lib/schema";
import { eq, inArray } from "drizzle-orm";
import { mergeSchoolsBodySchema } from "@/lib/api-schemas";
import { parseOrError, internalError } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = parseOrError(mergeSchoolsBodySchema, body);
        if (!parsed.success) return parsed.response;

        const { baseSchoolId, mergingSchoolId } = parsed.data;

        const [baseSchool, mergingSchool] = await Promise.all([
            db
                .select()
                .from(schools)
                .where(eq(schools.id, baseSchoolId))
                .limit(1),
            db
                .select()
                .from(schools)
                .where(eq(schools.id, mergingSchoolId))
                .limit(1),
        ]);

        if (!baseSchool[0]) {
            return NextResponse.json(
                { error: "Base school not found" },
                { status: 404 },
            );
        }
        if (!mergingSchool[0]) {
            return NextResponse.json(
                { error: "Merging school not found" },
                { status: 404 },
            );
        }

        // --- yearlySchoolParticipation ---
        // For each year the merging school participated:
        //   - If base school already has an entry for a year, union divisions
        //     and keep base school's other fields; fall back to the merging
        //     school's if the base field is empty.
        //   - If the base school has no entry for that year, reassign the row.
        const mergingParticipation = await db
            .select()
            .from(yearlySchoolParticipation)
            .where(eq(yearlySchoolParticipation.schoolId, mergingSchoolId));

        const baseParticipation = await db
            .select()
            .from(yearlySchoolParticipation)
            .where(eq(yearlySchoolParticipation.schoolId, baseSchoolId));

        const baseParticipationByYear = new Map(
            baseParticipation.map((p) => [p.year, p]),
        );

        for (const merging of mergingParticipation) {
            const base = baseParticipationByYear.get(merging.year);
            if (base) {
                // Merge union divisions, prefer base school's non-empty metadata
                const unionedDivisions = Array.from(
                    new Set([...base.division, ...merging.division]),
                );
                await db
                    .update(yearlySchoolParticipation)
                    .set({
                        division: unionedDivisions,
                        implementationModel:
                            base.implementationModel ||
                            merging.implementationModel,
                        schoolType: base.schoolType || merging.schoolType,
                    })
                    .where(eq(yearlySchoolParticipation.id, base.id));
                // Delete the now-redundant merging school row
                await db
                    .delete(yearlySchoolParticipation)
                    .where(eq(yearlySchoolParticipation.id, merging.id));
            } else {
                // No conflict — just reassign to base school
                await db
                    .update(yearlySchoolParticipation)
                    .set({ schoolId: baseSchoolId })
                    .where(eq(yearlySchoolParticipation.id, merging.id));
            }
        }

        // --- projects ---
        // All projects from the merging school become projects of the base school.
        await db
            .update(projects)
            .set({ schoolId: baseSchoolId })
            .where(eq(projects.schoolId, mergingSchoolId));

        // --- yearlyTeacherParticipation ---
        // Reassign each merging school row to the base school, skipping any that
        // would create a duplicate (same teacher + school + year already exists).
        const mergingTeachers = await db
            .select()
            .from(yearlyTeacherParticipation)
            .where(eq(yearlyTeacherParticipation.schoolId, mergingSchoolId));

        const baseTeachers = await db
            .select()
            .from(yearlyTeacherParticipation)
            .where(eq(yearlyTeacherParticipation.schoolId, baseSchoolId));

        const baseTeacherKeys = new Set(
            baseTeachers.map((t) => `${t.teacherId}-${t.year}`),
        );

        const duplicateIds: number[] = [];
        const reassignIds: number[] = [];

        for (const t of mergingTeachers) {
            if (baseTeacherKeys.has(`${t.teacherId}-${t.year}`)) {
                duplicateIds.push(t.id);
            } else {
                reassignIds.push(t.id);
            }
        }

        if (duplicateIds.length > 0) {
            await db
                .delete(yearlyTeacherParticipation)
                .where(inArray(yearlyTeacherParticipation.id, duplicateIds));
        }

        if (reassignIds.length > 0) {
            await db
                .update(yearlyTeacherParticipation)
                .set({ schoolId: baseSchoolId })
                .where(inArray(yearlyTeacherParticipation.id, reassignIds));
        }

        // --- schoolHistoricNames ---
        // Record the merged-away school's identity before deleting it.
        await db.insert(schoolHistoricNames).values({
            absorbingSchoolId: baseSchoolId,
            mergedName: mergingSchool[0].name,
            mergedStandardizedName: mergingSchool[0].standardizedName,
            mergedExternalSchoolId: mergingSchool[0].schoolId,
        });

        // --- Delete the merging school ---
        await db.delete(schools).where(eq(schools.id, mergingSchoolId));

        return NextResponse.json({
            message: `"${mergingSchool[0].name}" was successfully merged into "${baseSchool[0].name}"`,
        });
    } catch {
        return internalError();
    }
}
