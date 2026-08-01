ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "primary_capability" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "outcome" text;
