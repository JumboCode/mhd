ALTER TABLE "school_historic_names" DROP CONSTRAINT "school_historic_names_merged_standardized_name_unique";--> statement-breakpoint
ALTER TABLE "school_historic_names" ADD COLUMN "merged_town" text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "school_historic_names_name_town_idx" ON "school_historic_names" USING btree ("merged_standardized_name","merged_town");