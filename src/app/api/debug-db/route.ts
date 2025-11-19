import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects, students, schools, teachers } from "@/lib/schema";
import { sql } from "drizzle-orm";

// Temporary debug route to inspect whether the server is connected to the expected DB.
export async function GET() {
    try {
        // Simple counts to show what's in the connected database
        const totalsResult = await db.execute(sql`
      SELECT
        COUNT(DISTINCT ${projects.schoolId}) AS total_schools,
        COUNT(DISTINCT ${projects.teacherId}) AS total_teachers,
        COUNT(DISTINCT ${students.id}) AS total_students,
        COUNT(${projects.id}) AS total_projects
      FROM ${projects}
      LEFT JOIN ${students} ON ${students.projectId} = ${projects.id}
    `);

        const totals = totalsResult.rows[0] || {};

        // Check individual table counts with safe try/catch in case tables don't exist
        const tableCounts: Record<string, string | number> = {};
        try {
            const p = await db.execute(
                sql`SELECT COUNT(*) AS c FROM ${projects}`,
            );
            tableCounts.projects = Number(p.rows[0]?.c ?? 0);
        } catch (e) {
            tableCounts.projects = "missing";
        }
        try {
            const s = await db.execute(
                sql`SELECT COUNT(*) AS c FROM ${students}`,
            );
            tableCounts.students = Number(s.rows[0]?.c ?? 0);
        } catch (e) {
            tableCounts.students = "missing";
        }
        try {
            const sc = await db.execute(
                sql`SELECT COUNT(*) AS c FROM ${schools}`,
            );
            tableCounts.schools = Number(sc.rows[0]?.c ?? 0);
        } catch (e) {
            tableCounts.schools = "missing";
        }
        try {
            const t = await db.execute(
                sql`SELECT COUNT(*) AS c FROM ${teachers}`,
            );
            tableCounts.teachers = Number(t.rows[0]?.c ?? 0);
        } catch (e) {
            tableCounts.teachers = "missing";
        }

        // Sample up to 5 projects (if the table exists)
        let sampleProjects: any[] = [];
        try {
            const sample = await db.execute(
                sql`SELECT * FROM ${projects} LIMIT 5`,
            );
            sampleProjects = sample.rows || [];
        } catch (e) {
            sampleProjects = [];
        }

        // Return a masked DB url presence flag (don't leak full URL)
        const hasDbUrl = Boolean(process.env.DATABASE_URL);

        return NextResponse.json({
            hasDbUrl,
            totals,
            tableCounts,
            sampleProjects,
        });
    } catch (err) {
        console.error("/api/debug-db error:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
