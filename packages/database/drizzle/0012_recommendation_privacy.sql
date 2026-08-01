-- Anonymous public recommendations: summary + themes; referee identity & full docs private.

ALTER TABLE "recommendations" ALTER COLUMN "author_name" DROP NOT NULL;
ALTER TABLE "recommendations" ALTER COLUMN "body" DROP NOT NULL;

ALTER TABLE "recommendations" ADD COLUMN IF NOT EXISTS "public_summary" text;
ALTER TABLE "recommendations" ADD COLUMN IF NOT EXISTS "key_themes" jsonb DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE "recommendations" ADD COLUMN IF NOT EXISTS "verification_status" text DEFAULT 'self_attested';
ALTER TABLE "recommendations" ADD COLUMN IF NOT EXISTS "document_key" text;
ALTER TABLE "recommendations" ADD COLUMN IF NOT EXISTS "document_file_name" text;
ALTER TABLE "recommendations" ADD COLUMN IF NOT EXISTS "document_content_type" text;

-- Backfill public summaries from existing body text.
UPDATE "recommendations"
SET "public_summary" = left(trim(body), 280)
WHERE ("public_summary" IS NULL OR trim("public_summary") = '')
  AND body IS NOT NULL
  AND trim(body) <> '';

UPDATE "recommendations"
SET "public_summary" = 'Professional reference on file.'
WHERE "public_summary" IS NULL OR trim("public_summary") = '';

ALTER TABLE "recommendations" ALTER COLUMN "public_summary" SET DEFAULT '';
ALTER TABLE "recommendations" ALTER COLUMN "public_summary" SET NOT NULL;
