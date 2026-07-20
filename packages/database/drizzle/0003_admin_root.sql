ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_root_admin" boolean DEFAULT false NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_admin_login_at" timestamp with time zone;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "admin_role" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "admin_permissions" jsonb;
