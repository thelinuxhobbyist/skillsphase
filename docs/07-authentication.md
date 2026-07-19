# Project Horizon — Authentication & Authorisation

**Version:** 1.1  
**Status:** Canonical

## Separation of Concerns

| Question | System |
|----------|--------|
| Who is this user? | **Clerk** |
| What can they do? | **Project Horizon** (Workers + Neon) |

## Stack

Next.js · Cloudflare Workers · Neon PostgreSQL · Clerk · Cloudflare R2

## Registration

1. User chooses Job Seeker or Employer.  
2. Clerk creates account + verifies email.  
3. Redirect to Horizon.  
4. Backend ensures `users` row exists (`clerk_user_id`, `role`, timestamps).  
5. Route to seeker onboarding or employer company form (UK only).

**Emails:** registration / verification and password reset are **Clerk**-owned.

## Login

1. Clerk authenticates and issues session.  
2. Frontend calls `/api/v1/...` with session.  
3. Worker validates Clerk session → loads app user → checks role, company status, ownership → executes.

## Roles

Stored in Neon (`users.role`). Do **not** rely solely on Clerk public metadata for authorisation.

## Employer Approval vs Authentication

Authentication succeeds regardless of `verification_status`.  
Authorisation blocks job/applicant features unless `approved` (admins exempt for moderation/create-for-company).

## Session Validation Checklist

1. Validate Clerk session  
2. Load application user (reject if soft-deleted)  
3. Check role  
4. Check permissions / ownership / company status  
5. Validate input  
6. Execute  

## Route Protection

| Class | Rules |
|-------|-------|
| Public | `/`, `/jobs`, `/jobs/{slug}`, `/about`, `/login`, `/register`, `/waitlist` |
| Authenticated | dashboards, profile, applications, settings |
| Employer | role = employer; recruitment routes require `approved` |
| Admin | role = admin |

Frontend middleware improves UX; **API enforces security**.

## GDPR Account Lifecycle

1. Optional `GET /users/me/export`  
2. `DELETE /users/me` → soft delete (`deleted_at`), revoke sessions, schedule Clerk deletion  
3. After retention period → hard delete app data + R2 objects  

## Future (not MVP)

MFA, SSO, organisations, passkeys, magic links — Clerk-capable later without redesigning RBAC.
