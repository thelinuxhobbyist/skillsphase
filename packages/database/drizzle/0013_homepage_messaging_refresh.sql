-- Homepage messaging refresh: jobs platform + evidence-based profile.
-- Prefer resetting via admin / `pnpm db:reset-homepage` after deploy so
-- seeded copy matches packages/shared defaults (ADR 002).
-- This migration clears obsolete section types so ensureHomepageSections
-- can seed missing defaults on next request.

DELETE FROM homepage_sections
WHERE type IN ('why_exists');
