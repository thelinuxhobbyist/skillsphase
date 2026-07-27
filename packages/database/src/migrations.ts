export const MIGRATION_SQLS: string[] = [
  // 0000_init.sql
  `CREATE TYPE "public"."application_status" AS ENUM('applied', 'under_review', 'interview', 'offer', 'hired', 'rejected', 'withdrawn');
CREATE TYPE "public"."job_status" AS ENUM('draft', 'published', 'closed');
CREATE TYPE "public"."remote_type" AS ENUM('on_site', 'hybrid', 'remote');
CREATE TYPE "public"."user_role" AS ENUM('job_seeker', 'employer', 'admin');
CREATE TYPE "public"."verification_status" AS ENUM('pending_review', 'approved', 'rejected', 'suspended');
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"role" "user_role" NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"phone_number" text,
	"city" text,
	"country" text,
	"career_summary" text,
	"career_gap_narrative" text,
	"cover_letter_template" text,
	"profile_photo_url" text,
	"cv_url" text,
	"cv_file_name" text,
	"profile_completed" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
CREATE TABLE IF NOT EXISTS "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"company_number" text NOT NULL,
	"company_name" text NOT NULL,
	"website" text NOT NULL,
	"business_email" text NOT NULL,
	"recruiter_name" text NOT NULL,
	"recruiter_job_title" text NOT NULL,
	"verification_status" "verification_status" DEFAULT 'pending_review' NOT NULL,
	"companies_house_verified" boolean DEFAULT false NOT NULL,
	"companies_house_payload" jsonb,
	"rejection_reason" text,
	"country_code" text DEFAULT 'GB' NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "companies_company_number_unique" UNIQUE("company_number")
);
CREATE TABLE IF NOT EXISTS "jobs" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "jobs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"company_id" uuid NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"salary_min" numeric(12, 2),
	"salary_max" numeric(12, 2),
	"salary_currency" text DEFAULT 'GBP' NOT NULL,
	"location" text NOT NULL,
	"remote_type" "remote_type" NOT NULL,
	"employment_type" text NOT NULL,
	"industry" text NOT NULL,
	"closing_date" date,
	"status" "job_status" DEFAULT 'draft' NOT NULL,
	"removed_by_admin" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_slug_unique" UNIQUE("slug")
);
CREATE TABLE IF NOT EXISTS "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" bigint NOT NULL,
	"user_id" uuid NOT NULL,
	"cover_letter" text,
	"cv_url" text NOT NULL,
	"cv_file_name" text,
	"status" "application_status" DEFAULT 'applied' NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "applications_job_user_unique" UNIQUE("job_id","user_id")
);
CREATE TABLE IF NOT EXISTS "education" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"institution" text NOT NULL,
	"qualification" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "employment_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"employer_name" text NOT NULL,
	"job_title" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"currently_working" boolean DEFAULT false NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "job_skills" (
	"job_id" bigint NOT NULL,
	"skill_id" uuid NOT NULL,
	CONSTRAINT "job_skills_job_id_skill_id_pk" PRIMARY KEY("job_id","skill_id")
);
CREATE TABLE IF NOT EXISTS "qualifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"issuing_body" text,
	"date_awarded" date,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skills_name_unique" UNIQUE("name")
);
CREATE TABLE IF NOT EXISTS "user_skills" (
	"user_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	CONSTRAINT "user_skills_user_id_skill_id_pk" PRIMARY KEY("user_id","skill_id")
);
CREATE TABLE IF NOT EXISTS "admin_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "waitlist_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"company_name" text,
	"country_code" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
DO $$ BEGIN
  ALTER TABLE "companies" ADD CONSTRAINT "companies_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "jobs" ADD CONSTRAINT "jobs_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "education" ADD CONSTRAINT "education_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "employment_history" ADD CONSTRAINT "employment_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "qualifications" ADD CONSTRAINT "qualifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;`,

  // 0001_user_suspended.sql
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "suspended_at" timestamp with time zone;`,

  // 0002_homepage_sections.sql
  `CREATE TABLE IF NOT EXISTS "homepage_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"label" text NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);`,

  // 0003_admin_root.sql
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_root_admin" boolean DEFAULT false NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_admin_login_at" timestamp with time zone;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "admin_role" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "admin_permissions" jsonb;`,

  // 0004_admin_local_auth.sql
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" text;
CREATE TABLE IF NOT EXISTS "admin_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "token_hash" text NOT NULL UNIQUE,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_seen_at" timestamp with time zone DEFAULT now() NOT NULL
);
DO $$ BEGIN
  ALTER TABLE "admin_sessions"
    ADD CONSTRAINT "admin_sessions_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
CREATE INDEX IF NOT EXISTS "admin_sessions_user_id_idx" ON "admin_sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "admin_sessions_expires_at_idx" ON "admin_sessions" ("expires_at");`,

  // 0005_job_listing_details.sql
  `ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "company_about" text;
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "company_size" text;
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "benefits" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "why_returners" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "application_process" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "working_pattern_detail" text;
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "contract_details" text;
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "nice_to_have_skills" jsonb DEFAULT '[]'::jsonb;`,

  // 0006_skills_marketplace.sql
  `DROP TABLE IF EXISTS "job_skills";
DROP TABLE IF EXISTS "applications";
DROP TABLE IF EXISTS "jobs";
DROP TYPE IF EXISTS "public"."application_status";
DROP TYPE IF EXISTS "public"."job_status";
DO $$ BEGIN
  CREATE TYPE "public"."availability" AS ENUM('immediate', 'within_one_month', 'freelance', 'permanent');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE TYPE "public"."candidate_review_action" AS ENUM('skip', 'viewed');
EXCEPTION WHEN duplicate_object THEN null; END $$;
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
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "business_email_verified" boolean DEFAULT false NOT NULL;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "business_email_verified_at" timestamp with time zone;
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
CREATE TABLE IF NOT EXISTS "candidate_lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
DO $$ BEGIN
  ALTER TABLE "candidate_lists" ADD CONSTRAINT "candidate_lists_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
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
CREATE INDEX IF NOT EXISTS "messages_contact_id_idx" ON "messages" ("contact_id");`,
];
