-- Skills First Hiring Platform: replace job-board schema with the skills marketplace.

-- Drop job-board tables (children first to satisfy FKs).
DROP TABLE IF EXISTS "job_skills";
DROP TABLE IF EXISTS "applications";
DROP TABLE IF EXISTS "jobs";
DROP TYPE IF EXISTS "public"."application_status";
DROP TYPE IF EXISTS "public"."job_status";

-- New enums for the skills marketplace.
DO $$ BEGIN
  CREATE TYPE "public"."availability" AS ENUM('immediate', 'within_one_month', 'freelance', 'permanent');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE TYPE "public"."candidate_review_action" AS ENUM('skip', 'viewed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Candidate Skill Profile fields on users; drop CV-era columns.
ALTER TABLE "users" DROP COLUMN IF EXISTS "career_gap_narrative";
ALTER TABLE "users" DROP COLUMN IF EXISTS "cover_letter_template";
ALTER TABLE "users" DROP COLUMN IF EXISTS "cv_url";
ALTER TABLE "users" DROP COLUMN IF EXISTS "cv_file_name";
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "professional_title" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "remote_preference" "remote_type";
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "availability" "availability";
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "years_experience" integer;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "salary_min" numeric(12, 2);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "salary_max" numeric(12, 2);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "salary_currency" text DEFAULT 'GBP' NOT NULL;

-- Business trust status: verified business email (Resend flow).
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "business_email_verified" boolean DEFAULT false NOT NULL;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "business_email_verified_at" timestamp with time zone;

-- Portfolio evidence a candidate showcases on their Skill Profile.
CREATE TABLE IF NOT EXISTS "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"role" text,
	"project_url" text,
	"media" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
DO $$ BEGIN
  ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Token-based verification of a business's work email, sent via Resend.
CREATE TABLE IF NOT EXISTS "business_email_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
DO $$ BEGIN
  ALTER TABLE "business_email_verifications" ADD CONSTRAINT "business_email_verifications_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Business-defined groupings for organising saved candidates.
CREATE TABLE IF NOT EXISTS "candidate_lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
DO $$ BEGIN
  ALTER TABLE "candidate_lists" ADD CONSTRAINT "candidate_lists_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Explicit bookmark of a candidate by a business, optionally in a list.
CREATE TABLE IF NOT EXISTS "saved_candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"candidate_user_id" uuid NOT NULL,
	"list_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_candidates_company_id_candidate_user_id_unique" UNIQUE("company_id","candidate_user_id")
);
DO $$ BEGIN
  ALTER TABLE "saved_candidates" ADD CONSTRAINT "saved_candidates_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "saved_candidates" ADD CONSTRAINT "saved_candidates_candidate_user_id_users_id_fk" FOREIGN KEY ("candidate_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "saved_candidates" ADD CONSTRAINT "saved_candidates_list_id_candidate_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."candidate_lists"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Skip/viewed decisions that drive the discovery feed (no repeats).
CREATE TABLE IF NOT EXISTS "candidate_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"candidate_user_id" uuid NOT NULL,
	"action" "candidate_review_action" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "candidate_reviews_company_id_candidate_user_id_unique" UNIQUE("company_id","candidate_user_id")
);
DO $$ BEGIN
  ALTER TABLE "candidate_reviews" ADD CONSTRAINT "candidate_reviews_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "candidate_reviews" ADD CONSTRAINT "candidate_reviews_candidate_user_id_users_id_fk" FOREIGN KEY ("candidate_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- A business reaching out to a candidate. There is no automatic match.
CREATE TABLE IF NOT EXISTS "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"candidate_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contacts_company_id_candidate_user_id_unique" UNIQUE("company_id","candidate_user_id")
);
DO $$ BEGIN
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_candidate_user_id_users_id_fk" FOREIGN KEY ("candidate_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid NOT NULL,
	"sender_user_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
DO $$ BEGIN
  ALTER TABLE "messages" ADD CONSTRAINT "messages_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_user_id_users_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS "projects_user_id_idx" ON "projects" ("user_id");
CREATE INDEX IF NOT EXISTS "saved_candidates_company_id_idx" ON "saved_candidates" ("company_id");
CREATE INDEX IF NOT EXISTS "candidate_reviews_company_id_idx" ON "candidate_reviews" ("company_id");
CREATE INDEX IF NOT EXISTS "contacts_company_id_idx" ON "contacts" ("company_id");
CREATE INDEX IF NOT EXISTS "contacts_candidate_user_id_idx" ON "contacts" ("candidate_user_id");
CREATE INDEX IF NOT EXISTS "messages_contact_id_idx" ON "messages" ("contact_id");
