CREATE TABLE "audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT 'gen_random_uuid()' NOT NULL,
	"user_id" varchar,
	"action" text NOT NULL,
	"details" jsonb,
	"ip_address" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "driver_notes" (
	"id" varchar PRIMARY KEY DEFAULT 'gen_random_uuid()' NOT NULL,
	"driver_id" varchar,
	"driver_name" text NOT NULL,
	"postcode" text NOT NULL,
	"what3words" text DEFAULT '' NOT NULL,
	"notes" text NOT NULL,
	"file_name" text DEFAULT '' NOT NULL,
	"file_content" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
