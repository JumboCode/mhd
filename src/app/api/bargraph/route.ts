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
        // fix this if statement
        if (["name", "town"].includes(group)) {
            table = schools;
            groupColumn = group === "name" ? schools.name : schools.town;
        } else {
            table = projects;
            switch (group) {
                case "division":
                    groupColumn = projects.division;
                    break;
                case "category":
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
                    const id = Number(filterValue);
                    if (!isNaN(id)) {
                        if (table === projects) {
                            conditions.push(eq(projects.schoolId, id));
                        } else if (table === schools) {
                            conditions.push(eq(schools.id, id));
                        }
                    }
                    break;

                case "city":
                    conditions.push(eq(schools.town, filterValue));
                    break;

                case "group":
                    conditions.push(eq(projects.group, filterValue));
                    break;

                case "category":
                    conditions.push(eq(projects.category, filterValue));
                    break;
            }
        }

        // measure
        let query;
        let valueSelect;

        if (table === schools) {
            // Schools table
            query = db.select({ category: groupColumn }).from(schools);

            switch (measure) {
                case "total_number_of_schools":
                    valueSelect = sql`COUNT(*)`;
                    break;
                case "total_student_count":
                    query = query.leftJoin(
                        students,
                        eq(students.schoolId, schools.id),
                    );
                    valueSelect = sql`COUNT(${students.id})`;
                    break;
                case "total_teacher_count":
                    query = query.leftJoin(
                        yearlyTeacherParticipation,
                        eq(yearlyTeacherParticipation.schoolId, schools.id),
                    );
                    valueSelect = sql`COUNT(DISTINCT ${yearlyTeacherParticipation.teacherId})`;
                    break;
                case "total_city_count":
                    valueSelect = sql`COUNT(DISTINCT ${schools.town})`;
                    break;
                case "school_return_rate":
                    query = query.leftJoin(
                        yearlySchoolParticipation,
                        eq(yearlySchoolParticipation.schoolId, schools.id),
                    );
                    valueSelect = sql`COUNT(DISTINCT ${yearlySchoolParticipation.year})`;
                    break;
                default:
                    valueSelect = sql`COUNT(*)`;
            }
        } else {
            // Projects table
            query = db
                .select({ category: groupColumn })
                .from(projects)
                .leftJoin(schools, eq(schools.id, projects.schoolId));

            switch (measure) {
                case "total_number_of_schools":
                    valueSelect = sql`COUNT(DISTINCT ${projects.schoolId})`;
                    break;
                case "total_student_count":
                    query = query.leftJoin(
                        students,
                        eq(students.projectId, projects.id),
                    );
                    valueSelect = sql`COUNT(${students.id})`;
                    break;
                case "total_project_count":
                    valueSelect = sql`COUNT(${projects.id})`;
                    break;
                case "total_teacher_count":
                    valueSelect = sql`COUNT(DISTINCT ${projects.teacherId})`;
                    break;
                case "school_return_rate":
                    query = query.leftJoin(
                        yearlySchoolParticipation,
                        eq(
                            yearlySchoolParticipation.schoolId,
                            projects.schoolId,
                        ),
                    );
                    valueSelect = sql`COUNT(DISTINCT ${yearlySchoolParticipation.year})`;
                    break;
                default:
                    valueSelect = sql`COUNT(*)`;
            }
        }
        let rows;
        if (table === projects) {
            rows = await db
                .select({
                    category: groupColumn,
                    value: valueSelect,
                })
                .from(projects)
                .leftJoin(schools, eq(schools.id, projects.schoolId))
                .where(conditions.length ? and(...conditions) : undefined)
                .groupBy(groupColumn);
        } else {
            rows = await db
                .select({
                    category: groupColumn,
                    value: valueSelect,
                })
                .from(schools)
                .where(conditions.length ? and(...conditions) : undefined)
                .groupBy(groupColumn);
        }

        // Add filter conditions if provided
        // if (conditions.length > 0) {
        //     query = query.where(and(...conditions));
        // }

        // Final query
        // query = query.select({ category: groupColumn, value: valueSelect }).groupBy(groupColumn);

        // const rows = await query;
        return NextResponse.json(rows);

        // switch (measure) {
        //     case "total_number_of_schools":
        //         valueSelect = table === schools ? sql`COUNT(*)` : sql`COUNT(DISTINCT ${projects.schoolId})`;
        //         break;
        //     case "total_student_count":
        //         valueSelect = table === schools ? sql`COUNT(${students.id})` : sql`COUNT(${students.id})`; // join needed if projects
        //         break;
        //     case "total_city_count":
        //         valueSelect = sql`COUNT(DISTINCT ${schools.town})`;
        //         break;
        //     case "total_project_count":
        //         valueSelect = table === projects ? sql`COUNT(${projects.id})` : sql`0`;
        //         break;
        //     case "total_teacher_count":
        //         valueSelect = sql`COUNT(${teachers.id})`;
        //         break;
        //     case "school_return_rate":
        //         valueSelect = sql`COUNT(DISTINCT ${yearlySchoolParticipation.year})`;
        //         break;
        //     default:
        //         valueSelect = sql`COUNT(*)`;
        // }

        // switch (measure) {
        //     case "total_number_of_schools":
        //         valueSelect = sql`COUNT(*)`;
        //         break;
        //     case "total_student_count":
        //         valueSelect = sql`COUNT(${students.id})`;
        //         console.log("total student count");
        //         console.log(valueSelect);
        //         break;
        //     case "total_city_count":
        //         valueSelect = sql`COUNT(DISTINCT ${schools.town})`;
        //         console.log("total city count");
        //         console.log(valueSelect);
        //         break;
        //     case "total_project_count":
        //         valueSelect = sql`COUNT(${projects.id})`;
        //         console.log("total proj count");
        //         console.log(valueSelect);
        //         break;
        //     case "total_teacher_count":
        //         valueSelect = sql`COUNT(${teachers.id})`;
        //         console.log("total teacher count");
        //         console.log(valueSelect);
        //         break;
        //     case "school_return_rate":
        //         valueSelect = sql`COUNT(DISTINCT ${yearlySchoolParticipation.year})`;
        //         console.log("school return rate");
        //         console.log(valueSelect);
        //         break;
        //     default:
        //         valueSelect = sql`COUNT(*)`;
        // }

        // if (entity === "School") {
        //   table = schools;
        //   groupColumn = schoolGroupColumns[group as SchoolGroup];
        // } else if (entity === "Project") {
        //   table = projects;
        //   groupColumn = projectGroupColumns[group as ProjectGroup];
        // } else {
        //   throw new Error("Unknown entity type");
        // }
        // let rows;

        // if (table === projects) {
        // // projects table with school join
        // rows = await db
        //     .select({
        //     category: groupColumn,
        //     value: valueSelect,
        //     })
        //     .from(projects)
        //     .leftJoin(schools, eq(schools.id, projects.schoolId))
        //     .where(conditions.length > 0 ? and(...conditions) : undefined)
        //     .groupBy(groupColumn);
        // } else {
        // // schools table only
        // rows = await db
        //     .select({
        //     category: groupColumn,
        //     value: valueSelect,
        //     })
        //     .from(schools)
        //     .where(conditions.length > 0 ? and(...conditions) : undefined)
        //     .groupBy(groupColumn);
        // }

        // console.log("Returning rows:", rows);
        // return NextResponse.json(rows);
    } catch (err) {
        let message = "Unknown error";
        if (err instanceof Error) {
            message = err.message;
        }
        console.error(err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
