ALTER TABLE "jobs" ADD COLUMN "company_about" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "company_size" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "benefits" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "why_returners" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "application_process" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "working_pattern_detail" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "contract_details" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "nice_to_have_skills" jsonb DEFAULT '[]'::jsonb;
