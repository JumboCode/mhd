ALTER TABLE "schools" DROP CONSTRAINT "schools_school_id_unique";--> statement-breakpoint
ALTER TABLE "schools" ALTER COLUMN "town" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "schools" ALTER COLUMN "town" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "schools" ALTER COLUMN "school_id" DROP NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "schools_standardized_name_town_idx" ON "schools" USING btree ("standardized_name","town");