import { relations } from "drizzle-orm";
import {
    pgTable,
    integer,
    text,
    serial,
    doublePrecision,
    boolean,
    timestamp,
    index,
} from "drizzle-orm/pg-core";

// Represents metadata (relatively unchanging data) about a school
export const schools = pgTable("schools", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    standardizedName: text("standardized_name").notNull(),
    town: text("town"), // regional schools may not have a town
    schoolId: text("school_id").unique().notNull(),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    zipcode: text("zipcode"),
    gateway: boolean("gateway").default(false).notNull(),
    region: text("region").default("").notNull(),
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
        division: text("division").array().notNull().default([]),
        implementationModel: text("implementation_model").notNull().default(""),
        schoolType: text("school_type").notNull().default(""),
    },
);

// Represents a teacher and their relevant information
export const teachers = pgTable("teachers", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    teacherId: text("teacher_id").unique().notNull(),
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
    projectId: text("project_id").notNull(),
    title: text("title").notNull(),
    division: text("division").notNull(),
    categoryId: text("category_id").notNull(),
    category: text("category").notNull(),
    year: integer("year").notNull(),
    teamProject: boolean("team_project").notNull(), // True if team project, false if individual
    numStudents: integer("num_students").notNull().default(1),
});

// Tracks upload and edit timestamps for each year's dataset
export const yearMetadata = pgTable("year_metadata", {
    year: integer("year").primaryKey(),
    uploadedAt: timestamp("uploaded_at").notNull(),
    lastUpdatedAt: timestamp("last_updated_at").notNull(),
});

// Ties a teacher to a school for a given year
export const yearlyTeacherParticipation = pgTable(
    "yearly_teacher_participation",
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

// Stores historic names for schools that have been merged into another school
export const schoolHistoricNames = pgTable("school_historic_names", {
    id: serial("id").primaryKey(),
    absorbingSchoolId: integer("absorbing_school_id")
        .notNull()
        .references(() => schools.id, { onDelete: "cascade" }),
    mergedName: text("merged_name").notNull(),
    mergedStandardizedName: text("merged_standardized_name").notNull().unique(),
    mergedExternalSchoolId: text("merged_external_school_id"),
});

// Better-Auth generated Schema below
export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const session = pgTable(
    "session",
    {
        id: text("id").primaryKey(),
        expiresAt: timestamp("expires_at").notNull(),
        token: text("token").notNull().unique(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
    "account",
    {
        id: text("id").primaryKey(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at"),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
        scope: text("scope"),
        password: text("password"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
    "verification",
    {
        id: text("id").primaryKey(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));

export const schema = { user, session, account, verification };
