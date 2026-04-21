ALTER TABLE "school_historic_names" RENAME COLUMN "school_id" TO "absorbing_school_id";--> statement-breakpoint
ALTER TABLE "school_historic_names" RENAME COLUMN "name" TO "merged_name";--> statement-breakpoint
ALTER TABLE "school_historic_names" RENAME COLUMN "standardized_name" TO "merged_standardized_name";--> statement-breakpoint
ALTER TABLE "school_historic_names" RENAME COLUMN "external_school_id" TO "merged_external_school_id";--> statement-breakpoint
ALTER TABLE "school_historic_names" DROP CONSTRAINT "school_historic_names_standardized_name_unique";--> statement-breakpoint
ALTER TABLE "school_historic_names" DROP CONSTRAINT "school_historic_names_school_id_schools_id_fk";
--> statement-breakpoint
ALTER TABLE "school_historic_names" ADD CONSTRAINT "school_historic_names_absorbing_school_id_schools_id_fk" FOREIGN KEY ("absorbing_school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_historic_names" ADD CONSTRAINT "school_historic_names_merged_standardized_name_unique" UNIQUE("merged_standardized_name");