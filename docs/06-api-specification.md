# Project Horizon — API Specification

**Version:** 1.1  
**Status:** Canonical  
**Base URL:** `/api/v1`

The frontend communicates only with this API. It never accesses the database, R2 credentials, or Companies House directly.

## Authentication

Clerk session required on protected routes. Backend loads the application user and enforces role + resource ownership. Never trust role data from the client.

## Conventions

**Success**
```json
{ "success": true, "data": {} }
```

**Error**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The supplied company registration number is invalid."
  }
}
```

Pagination: `page`, `pageSize` query params; responses include `meta: { page, pageSize, total }`.

---

## Health

`GET /health` — public — `{ status, timestamp }`

---

## Users

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| GET | `/users/me` | any auth | Current profile + completion flags |
| PATCH | `/users/me` | any auth | Update profile fields |
| POST | `/users/me/cv` | job_seeker | Upload/replace current CV (R2) |
| POST | `/users/me/photo` | job_seeker | Upload profile photo |
| GET | `/users/me/export` | any auth | GDPR JSON export |
| DELETE | `/users/me` | seeker/employer* | Soft-delete account |

\* Employers blocked if active jobs / unresolved applications exist.

---

## Profile sub-resources (job seeker)

CRUD-style endpoints for:

- `/users/me/employment-history`
- `/users/me/education`
- `/users/me/qualifications`
- `/users/me/skills`

---

## Companies

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| POST | `/companies` | employer | Create registration → `pending_review` (UK only; unique `company_number`) |
| GET | `/companies/me` | employer | Own company |
| PATCH | `/companies/me` | employer | Update; changing company number re-enters `pending_review` |
| POST | `/companies/verify` | employer | Companies House preview validation |
| POST | `/companies/me/resubmit` | employer | After rejection → `pending_review` |
| POST | `/waitlist` | public | Non-UK employer waitlist |

---

## Jobs

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/jobs` | public | List **published** jobs (filters + pagination) |
| GET | `/jobs/by-slug/{slug}` | public | Public job detail |
| GET | `/jobs/{id}` | auth as needed | Job by numeric id (employer/admin) |
| POST | `/jobs` | approved employer **or** admin | Create (admin must pass `companyId`) |
| PATCH | `/jobs/{id}` | owner employer or admin | Update |
| DELETE | `/jobs/{id}` | owner employer or admin | Delete **draft** only |
| POST | `/jobs/{id}/publish` | owner employer or admin | Publish |
| POST | `/jobs/{id}/close` | owner employer or admin | Close |
| POST | `/jobs/{id}/reopen` | owner employer or admin | Reopen closed → published |

**Filters:** `keyword`, `location`, `employment_type`, `remote_type`, `industry`

---

## Applications

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| POST | `/jobs/{id}/apply` | job_seeker | Apply; requires complete profile; **snapshots CV**; status `applied`; sends confirmation email |
| GET | `/applications/me` | job_seeker | Own applications |
| DELETE | `/applications/{id}` | job_seeker | Withdraw → `withdrawn` (blocked if `hired` or `rejected`) |
| GET | `/jobs/{id}/applications` | approved employer (owner) or admin | List applicants |
| PATCH | `/applications/{id}` | approved employer (owner) or admin | Update status |
| GET | `/applications/{id}/cv` | approved employer (owner) or admin | Signed URL for **snapshot** CV |

**Employer-assignable statuses:** `under_review`, `interview`, `offer`, `hired`, `rejected`  
(Initial status on create is always `applied`.)

---

## Administration

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/admin/dashboard` | Simple stats |
| GET | `/admin/employers` | List/filter employers |
| PATCH | `/admin/employers/{id}` | `approve` \| `reject` \| `suspend` \| `reinstate` (+ `rejection_reason` when rejecting); email on approve |
| GET | `/admin/users` | List users |
| PATCH | `/admin/users/{id}` | Suspend / reactivate |
| DELETE | `/admin/users/{id}` | Soft-delete user (not self) |
| GET | `/admin/jobs` | Moderation list |
| DELETE | `/admin/jobs/{id}` | Remove job (flag / soft-remove; retain for audit) |
| GET | `/admin/audit` | Read-only audit log |
| GET | `/admin/reports` | Placeholder metrics |

All admin routes: role `admin` only + audit log on mutating actions.

---

## Validation, rate limits, logging

Validate auth, authZ, body, query, uploads on every route.

Rate-limit: login (Clerk), employer registration, CH verify, job create, applications, uploads.

Log: auth failures, employer decisions, job create/delete, admin actions — never secrets or full CV contents.

## Principles

Predictable REST · consistent envelopes · correct HTTP status codes · never trust the client · document changes as the API evolves.
