CREATE TABLE "library_entries" (
	"id" varchar PRIMARY KEY DEFAULT 'gen_random_uuid()' NOT NULL,
	"postcode" text NOT NULL,
	"company_name" text DEFAULT '' NOT NULL,
	"what3words" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"image1_url" text DEFAULT '' NOT NULL,
	"image2_url" text DEFAULT '' NOT NULL,
	"source" text DEFAULT 'library' NOT NULL,
	"source_note_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "driver_notes" ADD COLUMN "file_url" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "driver_notes" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "driver_notes" ADD COLUMN "reviewed_by" varchar;--> statement-breakpoint
ALTER TABLE "driver_notes" ADD COLUMN "reviewed_at" timestamp;