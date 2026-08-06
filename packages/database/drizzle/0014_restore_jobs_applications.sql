-- Restore jobs board (ADR 002): profile-as-application, progressive trust.
-- Applications do not require a CV; documents are requested after mutual interest.

DO $$ BEGIN
  CREATE TYPE "public"."job_status" AS ENUM('draft', 'published', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."application_status" AS ENUM(
    'applied',
    'under_review',
    'interview',
    'offer',
    'hired',
    'rejected',
    'withdrawn'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "jobs" (
  "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
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
  "profile_snapshot" jsonb,
  "status" "application_status" DEFAULT 'applied' NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "applications_job_user_unique" UNIQUE("job_id", "user_id")
);

CREATE TABLE IF NOT EXISTS "job_skills" (
  "job_id" bigint NOT NULL,
  "skill_id" uuid NOT NULL,
  CONSTRAINT "job_skills_job_id_skill_id_pk" PRIMARY KEY("job_id", "skill_id")
);

DO $$ BEGIN
  ALTER TABLE "jobs"
    ADD CONSTRAINT "jobs_company_id_companies_id_fk"
    FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id")
    ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "jobs"
    ADD CONSTRAINT "jobs_created_by_user_id_users_id_fk"
    FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id")
    ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "applications"
    ADD CONSTRAINT "applications_job_id_jobs_id_fk"
    FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "applications"
    ADD CONSTRAINT "applications_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "job_skills"
    ADD CONSTRAINT "job_skills_job_id_jobs_id_fk"
    FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "job_skills"
    ADD CONSTRAINT "job_skills_skill_id_skills_id_fk"
    FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "jobs_status_idx" ON "jobs" ("status");
CREATE INDEX IF NOT EXISTS "jobs_company_id_idx" ON "jobs" ("company_id");
CREATE INDEX IF NOT EXISTS "applications_user_id_idx" ON "applications" ("user_id");
CREATE INDEX IF NOT EXISTS "applications_job_id_idx" ON "applications" ("job_id");
