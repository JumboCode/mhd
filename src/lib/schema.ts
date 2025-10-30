import { pgTable, integer, text, serial, boolean } from "drizzle-orm/pg-core";

// Represents metadata (relatively unchanging data) about a school
export const schools = pgTable("schools", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    town: text("town").notNull(),
});

// Ties a school to the years it has participated
export const yearlySchoolParticipation = pgTable(
    "yearly_school_participation",
    {
        id: serial("id").primaryKey(),
        schoolId: integer("school_id")
            .notNull()
            .references(() => schools.id),
        year: integer("year").notNull(),
    },
);

// Represents a teacher and their relevant information
export const teachers = pgTable("teachers", {
    id: serial("id").primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
});

// Represents a project and its relevant information
export const projects = pgTable("projects", {
    id: serial("id").primaryKey(),
    schoolId: integer("school_id")
        .notNull()
        .references(() => schools.id),
    teacherId: integer("teacher_id")
        .notNull()
        .references(() => teachers.id),
    entryId: integer("entry_id").unique(),
    title: text("title").notNull(),
    division: text("division").notNull(),
    category: text("category").notNull(),
    year: integer("year").notNull(),
    group: boolean("group").notNull(), // True if group project, false if individual
});

// Ties a student to a project and a school and whether they are returning
export const students = pgTable("students", {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
        .notNull()
        .references(() => projects.id),
    schoolId: integer("school_id")
        .notNull()
        .references(() => schools.id),
});

// Ties a teacher to the years they participated
export const yearlyTeacherParticipation = pgTable(
    "yearly_teacher_partipication",
    {
        id: serial("id").primaryKey(),
        teacherId: integer("teacher_id")
            .notNull()
            .references(() => teachers.id),
        schoolId: integer("school_id")
            .notNull()
            .references(() => schools.id),
        year: integer("year").notNull(),
    },
);

// Ties a teacher to a school
export const teacherSchools = pgTable("teacher_schools", {
    id: serial("id").primaryKey(),
    teacherId: integer("teacher_id")
        .notNull()
        .references(() => teachers.id),
    schoolId: integer("school_id")
        .notNull()
        .references(() => schools.id),
});
