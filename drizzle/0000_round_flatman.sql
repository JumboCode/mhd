CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"teacher_id" integer NOT NULL,
	"project_id" text NOT NULL,
	"title" text NOT NULL,
	"division" text NOT NULL,
	"category_id" text NOT NULL,
	"category" text NOT NULL,
	"year" integer NOT NULL,
	"team_project" boolean NOT NULL,
	"num_students" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_historic_names" (
	"id" serial PRIMARY KEY NOT NULL,
	"absorbing_school_id" integer NOT NULL,
	"merged_name" text NOT NULL,
	"merged_standardized_name" text NOT NULL,
	"merged_external_school_id" text,
	CONSTRAINT "school_historic_names_merged_standardized_name_unique" UNIQUE("merged_standardized_name")
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"standardized_name" text NOT NULL,
	"town" text,
	"school_id" text NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"zipcode" text,
	"gateway" boolean DEFAULT false NOT NULL,
	"region" text DEFAULT '' NOT NULL,
	CONSTRAINT "schools_school_id_unique" UNIQUE("school_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"teacher_id" text NOT NULL,
	CONSTRAINT "teachers_teacher_id_unique" UNIQUE("teacher_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "year_metadata" (
	"year" integer PRIMARY KEY NOT NULL,
	"uploaded_at" timestamp NOT NULL,
	"last_updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "yearly_school_participation" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"year" integer NOT NULL,
	"division" text[] DEFAULT '{}' NOT NULL,
	"implementation_model" text DEFAULT '' NOT NULL,
	"school_type" text DEFAULT '' NOT NULL,
	"competing_students" integer
);
--> statement-breakpoint
CREATE TABLE "yearly_teacher_participation" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"year" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_historic_names" ADD CONSTRAINT "school_historic_names_absorbing_school_id_schools_id_fk" FOREIGN KEY ("absorbing_school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "yearly_school_participation" ADD CONSTRAINT "yearly_school_participation_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "yearly_teacher_participation" ADD CONSTRAINT "yearly_teacher_participation_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "yearly_teacher_participation" ADD CONSTRAINT "yearly_teacher_participation_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");