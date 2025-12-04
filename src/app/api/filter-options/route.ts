import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { schools, projects } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (!type) return NextResponse.json([], { status: 400 });

    switch (type) {
        case "school":
            // return all schools
            const schoolsList = await db
                .select({ label: schools.name, value: schools.id })
                .from(schools)
                .orderBy(schools.name);
            return NextResponse.json(schoolsList);

        case "city":
            // return all distinct cities
            const cities = await db
                .select({ label: schools.town, value: schools.town })
                .from(schools)
                .groupBy(schools.town)
                .orderBy(schools.town);
            return NextResponse.json(cities);

        case "project_type":
            const projectTypes = await db
                .select({ label: projects.category, value: projects.category })
                .from(projects)
                .groupBy(projects.category)
                .orderBy(projects.category);
            return NextResponse.json(projectTypes);

        // you can add more filter types here, like region, group, teacher_participation_years, etc.

        default:
            return NextResponse.json([], { status: 400 });
    }
}
