import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
    schools,
    projects,
    students,
    teachers,
    yearlySchoolParticipation,
    yearlyTeacherParticipation,
} from "@/lib/schema";
import { eq, sql, and, inArray } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const { measure, group, filter, filterValue } = await req.json();
        console.log("in post", measure, group, filter);

        const conditions: any[] = [];

        // ---------- GROUP COLUMN ----------
        // no region
        const schoolGroupColumns = {
            town: schools.town,
            name: schools.name,
        } as const;

        const projectGroupColumns = {
            division: projects.division,
            project_type: projects.category,
            year: projects.year,
            group: projects.group,
        } as const;

        type SchoolGroup = keyof typeof schoolGroupColumns;
        type ProjectGroup = keyof typeof projectGroupColumns;
        let table: typeof schools | typeof projects;
        let groupColumn:
            | (typeof schoolGroupColumns)[SchoolGroup]
            | (typeof projectGroupColumns)[ProjectGroup];

        // Determine table based on group
        if (["name", "town"].includes(group)) {
            table = schools;
            groupColumn = group === "name" ? schools.name : schools.town;
        } else {
            table = projects;
            switch (group) {
                case "division":
                    groupColumn = projects.division;
                    break;
                case "project_type":
                    groupColumn = projects.category;
                    break;
                case "year":
                    groupColumn = projects.year;
                    break;
                case "group":
                    groupColumn = projects.group;
                    break;
                default:
                    groupColumn = projects.category;
            }
        }
        if (filter && filterValue) {
            switch (filter) {
                case "school":
                    // Filter by specific school ID
                    if (table === schools) {
                        conditions.push(eq(schools.id, parseInt(filterValue)));
                    } else {
                        // If querying projects table, need to filter by school_id
                        conditions.push(
                            eq(projects.schoolId, parseInt(filterValue)),
                        );
                    }
                    break;
                case "city":
                    // Filter by specific city/town
                    if (table === schools) {
                        conditions.push(eq(schools.town, filterValue));
                    }
                    // Note: If table is projects and you need to filter by city,
                    // you'll need to add a join with schools table
                    break;
                case "group":
                    // Filter by individual or group projects
                    if (table === projects) {
                        conditions.push(eq(projects.group, filterValue));
                    }
                    break;
                case "category":
                    // Filter by project category/type
                    if (table === projects) {
                        conditions.push(eq(projects.category, filterValue));
                    }
                    break;
            }
        }

        if (filter === "school" && table === schools) {
            // filter all schools? probably no-op if user just selects "filter by school"
        } else if (filter === "city" && table === schools) {
            // filter by city if needed
        } else if (filter === "project_type" && table === projects) {
            // filter by project_type if needed
        }
        // switch(filter) {
        //   case "school":
        //     table = schools;
        //     // groupColumn = group === "name" ? schools.name : schools.town;
        //     // groupColumn = schools.name;
        //     break;
        //   case "city":
        //     table = schools;
        //     // groupColumn = schools.town;
        //     break;
        //   case "project_type":
        //     table = projects;
        //     // groupColumn = projects.category;
        //     break;
        //   case "division":
        //     table = projects;
        //     // groupColumn = projects.division;
        //     break;
        //   default:
        //     table = projects;
        //     // groupColumn = projects.category;
        // }

        // switch(group) {
        //   case "name":
        //     groupColumn = schools.name;
        //     break;
        //   case "town":
        //     groupColumn = schools.town;
        //     break;
        //   case "division":
        //     groupColumn = projects.division;
        //     break;
        //   case "project_type":
        //     groupColumn = projects.category;
        //     break;
        //   default:
        //     groupColumn = schools.name; // fallback
        // }

        // ---------- MEASURE ----------
        let valueSelect;
        switch (measure) {
            case "total_number_of_schools":
                valueSelect = sql`COUNT(*)`;
                break;
            case "total_student_count":
                valueSelect = sql`COUNT(${students.id})`;
                console.log("total student count");
                console.log(valueSelect);
                break;
            case "total_city_count":
                valueSelect = sql`COUNT(DISTINCT ${schools.town})`;
                console.log("total city count");
                console.log(valueSelect);
                break;
            case "total_project_count":
                valueSelect = sql`COUNT(${projects.id})`;
                console.log("total proj count");
                console.log(valueSelect);
                break;
            case "total_teacher_count":
                valueSelect = sql`COUNT(${teachers.id})`;
                console.log("total teacher count");
                console.log(valueSelect);
                break;
            case "school_return_rate":
                valueSelect = sql`COUNT(DISTINCT ${yearlySchoolParticipation.year})`;
                console.log("school return rate");
                console.log(valueSelect);
                break;
            default:
                valueSelect = sql`COUNT(*)`;
        }

        // if (entity === "School") {
        //   table = schools;
        //   groupColumn = schoolGroupColumns[group as SchoolGroup];
        // } else if (entity === "Project") {
        //   table = projects;
        //   groupColumn = projectGroupColumns[group as ProjectGroup];
        // } else {
        //   throw new Error("Unknown entity type");
        // }

        // ---------- FINAL QUERY ----------
        const rows = await db
            .select({
                category: groupColumn,
                value: valueSelect,
            })
            .from(table)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .groupBy(groupColumn);

        return NextResponse.json(rows);
    } catch (err) {
        let message = "Unknown error";
        if (err instanceof Error) {
            message = err.message;
        }
        console.error(err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
