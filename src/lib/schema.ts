import { relations } from "drizzle-orm";
import {
    pgTable,
    integer,
    text,
    serial,
    boolean,
    timestamp,
    index,
} from "drizzle-orm/pg-core";

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
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
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
