# ADR 001 — Canonical Product Decisions

**Status:** Accepted  
**Date:** 2026-07-19  
**Context:** Ambiguities identified during the full documentation review.

These decisions are authoritative. Where earlier drafts conflict, this ADR (and the updated `/docs` specs) take precedence.

## Decisions

| Topic | Decision |
|-------|----------|
| Document 09 | Added: Admin Panel Specification |
| Application statuses | `applied` → `under_review` → `interview` → `offer` → `hired`, plus terminal `rejected` and `withdrawn` |
| Job identity | Numeric `id` (BIGINT) internally; human-readable `slug` for public URLs |
| API versioning | `/api/v1` from day one |
| Repository layout | Root `README.md` = quick-start; detailed specs in `/docs` |
| Product naming | **Project Horizon** = project name; **Career Return Platform** = product description |
| Qualifications & career-gap narrative | Core MVP features — include schema and UI |
| CV handling | Snapshot CV onto the application at submit time |
| Cover letters | Per-application; optional saved template on the user profile |
| Profile completion (to apply) | Name, Email, Location, Career Summary, ≥1 Skill, CV |
| Admin job creation | Allowed |
| Database | PostgreSQL on **Neon** |
| Emails (MVP) | Registration, password reset, employer approval, application confirmation only |
| Employer rejection | Store `rejection_reason`; resubmit resets status to `pending_review` |
| Duplicate companies | Unique constraint on `company_number` |
| GDPR | Data export + account deletion; soft delete then hard delete after retention |
| Suggested jobs | Out of MVP (no advanced recommendations) |
| Admin reports | Simple placeholders acceptable |
| Non-UK employers | Blocked / waitlist only for MVP |

## Reasonable defaults (not contradicted by product)

1. **Primary keys:** `jobs.id` is `BIGINT` (numeric). All other MVP tables use `UUID` primary keys (original schema principle), unless a later ADR changes this.
2. **Verification status enum:** `pending_review` \| `approved` \| `rejected` \| `suspended`.
3. **Retention period (soft → hard delete):** **30 days** default, configurable via environment.
4. **Essential email delivery:** Clerk handles registration + password reset; application confirmation and employer approval are sent from the Workers backend (provider TBD at implementation — e.g. Resend).
5. **Non-UK waitlist:** Simple `waitlist_entries` table (email, company name, country, created_at) — no full employer onboarding.
6. **Admin-created jobs:** Must be associated with an existing approved company (admin selects company).
