import { db } from "@/lib/db";
import { projects, students } from "@/lib/schema";
import { eq, count } from "drizzle-orm";

export async function getYearlyStats(year: number) {
    // Totals Query
    const [totals] = await db
        .selectDistinct({
            total_schools: count(projects.schoolId),
            total_teachers: count(projects.teacherId),
            total_students: count(students.id),
            total_projects: count(projects.id),
        })
        .from(projects)
        .innerJoin(students, eq(students.projectId, projects.id))
        .where(eq(projects.year, year));

    // --- Category Percentages Query ---
    // const categoryCounts = await db
    //     .select({
    //         category: projects.category,
    //         count: count(projects.id),
    //     })
    //     .from(projects)
    //     .where(eq(projects.year, year))
    //     .groupBy(projects.category);

    // const totalProjects = totals?.total_projects || 1;

    // const categoryPercentages = categoryCounts.map((c) => ({
    //     category: c.category,
    //     percentage: ((c.count / totalProjects) * 100).toFixed(1),
    // }));

    // return { year, totals, categoryPercentages };
    return { year, totals };
}
