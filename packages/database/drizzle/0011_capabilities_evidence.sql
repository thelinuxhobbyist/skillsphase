-- Multiple capabilities + capability↔evidence/skills links + project technologies.
-- Future trust columns on capabilities are nullable placeholders (unused in product yet).

ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "technologies" jsonb DEFAULT '[]'::jsonb NOT NULL;

CREATE TABLE IF NOT EXISTS "candidate_capabilities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "label" text NOT NULL,
  "is_primary" boolean DEFAULT false NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "confidence" text,
  "last_demonstrated_at" timestamp with time zone,
  "verification_status" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "candidate_capabilities"
    ADD CONSTRAINT "candidate_capabilities_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS "candidate_capabilities_user_id_idx"
  ON "candidate_capabilities" ("user_id");

CREATE TABLE IF NOT EXISTS "capability_skills" (
  "capability_id" uuid NOT NULL,
  "skill_id" uuid NOT NULL,
  CONSTRAINT "capability_skills_capability_id_skill_id_pk"
    PRIMARY KEY ("capability_id", "skill_id")
);

DO $$ BEGIN
  ALTER TABLE "capability_skills"
    ADD CONSTRAINT "capability_skills_capability_id_candidate_capabilities_id_fk"
    FOREIGN KEY ("capability_id") REFERENCES "public"."candidate_capabilities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "capability_skills"
    ADD CONSTRAINT "capability_skills_skill_id_skills_id_fk"
    FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "capability_projects" (
  "capability_id" uuid NOT NULL,
  "project_id" uuid NOT NULL,
  CONSTRAINT "capability_projects_capability_id_project_id_pk"
    PRIMARY KEY ("capability_id", "project_id")
);

DO $$ BEGIN
  ALTER TABLE "capability_projects"
    ADD CONSTRAINT "capability_projects_capability_id_candidate_capabilities_id_fk"
    FOREIGN KEY ("capability_id") REFERENCES "public"."candidate_capabilities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "capability_projects"
    ADD CONSTRAINT "capability_projects_project_id_projects_id_fk"
    FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Backfill primary capability rows from the denormalised user column.
INSERT INTO "candidate_capabilities" ("user_id", "label", "is_primary", "sort_order")
SELECT u.id, trim(u.primary_capability), true, 0
FROM "users" u
WHERE u.primary_capability IS NOT NULL
  AND trim(u.primary_capability) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM "candidate_capabilities" cc
    WHERE cc.user_id = u.id AND cc.is_primary = true
  );
