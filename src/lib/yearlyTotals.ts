import { db } from "@/lib/db";
import { projects, students } from "@/lib/schema";
import { sql } from "drizzle-orm";

export async function getYearlyStats(year: number) {
    const totalsResult = await db.execute(sql`
    SELECT 
      COUNT(DISTINCT ${projects.schoolId}) AS total_schools,
      COUNT(DISTINCT ${projects.teacherId}) AS total_teachers,
      COUNT(DISTINCT ${students.id}) AS total_students,
      COUNT(${projects.id}) AS total_projects
    FROM ${projects}
    JOIN ${students} ON ${students.projectId} = ${projects.id}
    WHERE ${projects.year} = ${year}
  `);
    const totals = totalsResult.rows[0] as {
        total_schools: number;
        total_teachers: number;
        total_students: number;
        total_projects: number;
    };
    const categoryResult = await db.execute(sql`
    SELECT 
      ${projects.category} AS category,
      COUNT(*) AS count
    FROM ${projects}
    WHERE ${projects.year} = ${year}
    GROUP BY ${projects.category}
  `);

    const totalProjects = totals?.total_projects || 1;

    const categoryPercentages = categoryResult.rows.map((c: any) => ({
        category: c.category,
        percentage: ((Number(c.count) / totalProjects) * 100).toFixed(1),
    }));

    return { year, totals, categoryPercentages };
}
