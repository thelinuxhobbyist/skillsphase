# Project Horizon — Database Schema

**Version:** 1.1  
**Status:** Canonical  
**Engine:** PostgreSQL (**Neon**)

## Design Principles

- `jobs.id` is **BIGINT** (numeric). All other MVP entity PKs are **UUID**.
- Foreign keys where appropriate; `created_at` / `updated_at` on every table.
- Soft deletes where required for GDPR (`deleted_at`); hard delete after retention.
- Auth identity lives in Clerk; this DB stores business data.
- Unique `companies.company_number` (UK only for MVP).

## Entity Overview

`users`, `companies`, `jobs`, `applications`, `skills`, `user_skills`, `job_skills`, `employment_history`, `education`, `qualifications`, `admin_logs`, `waitlist_entries`

---

### `users`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| clerk_user_id | TEXT UNIQUE | |
| role | ENUM | `job_seeker`, `employer`, `admin` |
| email | TEXT | Synced from Clerk for export/display |
| first_name | TEXT | |
| last_name | TEXT | |
| phone_number | TEXT NULL | |
| city | TEXT NULL | Part of Location |
| country | TEXT NULL | Default `GB` for seekers; informational |
| career_summary | TEXT NULL | Required to apply |
| career_gap_narrative | TEXT NULL | Core MVP field |
| cover_letter_template | TEXT NULL | Optional saved template |
| profile_photo_url | TEXT NULL | R2 key/URL |
| cv_url | TEXT NULL | Current CV in R2 |
| cv_file_name | TEXT NULL | Original filename for UX |
| profile_completed | BOOLEAN | Derived/cached from completion rules |
| deleted_at | TIMESTAMPTZ NULL | Soft delete |
| created_at / updated_at | TIMESTAMPTZ | |

**Completion to apply:** name, email, location (city/country), career_summary, ≥1 skill, cv_url.

---

### `companies`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| owner_user_id | UUID FK → users | One primary owner for MVP |
| company_number | TEXT UNIQUE | UK Companies House number |
| company_name | TEXT | From Companies House confirmation |
| website | TEXT | HTTPS |
| business_email | TEXT | |
| recruiter_name | TEXT | |
| recruiter_job_title | TEXT | |
| verification_status | ENUM | `pending_review`, `approved`, `rejected`, `suspended` |
| companies_house_verified | BOOLEAN | |
| companies_house_payload | JSONB NULL | Cached validation snapshot |
| rejection_reason | TEXT NULL | Shown to employer when rejected |
| country_code | TEXT | MVP: `GB` only |
| deleted_at | TIMESTAMPTZ NULL | |
| created_at / updated_at | TIMESTAMPTZ | |

---

### `jobs`

| Column | Type | Notes |
|--------|------|-------|
| id | **BIGINT** PK | Numeric internal ID (identity/serial) |
| company_id | UUID FK → companies | |
| created_by_user_id | UUID FK → users | Employer or admin |
| title | TEXT | |
| slug | TEXT UNIQUE | Public URLs `/jobs/{slug}` |
| description | TEXT | |
| salary_min / salary_max | NUMERIC NULL | |
| salary_currency | TEXT | Default `GBP` |
| location | TEXT | |
| remote_type | ENUM | `on_site`, `hybrid`, `remote` |
| employment_type | TEXT | e.g. full_time, part_time, contract |
| industry | TEXT | |
| closing_date | DATE NULL | |
| status | ENUM | `draft`, `published`, `closed` |
| removed_by_admin | BOOLEAN | Soft moderation flag |
| deleted_at | TIMESTAMPTZ NULL | |
| created_at / updated_at | TIMESTAMPTZ | |

---

### `applications`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| job_id | BIGINT FK → jobs | |
| user_id | UUID FK → users | |
| cover_letter | TEXT NULL | Per application |
| cv_url | TEXT | **Snapshot** at submit time (R2) |
| cv_file_name | TEXT NULL | |
| status | ENUM | See below |
| deleted_at | TIMESTAMPTZ NULL | |
| created_at / updated_at | TIMESTAMPTZ | |
| UNIQUE(job_id, user_id) | | One active application per job per user |

**Status enum:**  
`applied`, `under_review`, `interview`, `offer`, `hired`, `rejected`, `withdrawn`

**Transitions (employer):** `applied` → `under_review` → `interview` → `offer` → `hired`, or to `rejected`.  
**Seeker:** may set `withdrawn` until a final decision (`hired` / `rejected` / `offer` — withdraw blocked after `hired` or `rejected`; allowed before those terminal states except when already `withdrawn`).

---

### `employment_history`

id (UUID), user_id, employer_name, job_title, start_date, end_date NULL, currently_working, description, timestamps

### `education`

id (UUID), user_id, institution, qualification, start_date, end_date NULL, description, timestamps

### `qualifications`

id (UUID), user_id, name, issuing_body NULL, date_awarded NULL, description NULL, timestamps  

*(Core MVP — professional certifications / licences distinct from education rows.)*

### `skills`

id (UUID), name UNIQUE, category NULL

### `user_skills` / `job_skills`

Composite PK `(user_id, skill_id)` / `(job_id, skill_id)`

---

### `admin_logs`

id (UUID), admin_user_id, action, entity, entity_id (TEXT), notes NULL, created_at  

Immutable (no updates/deletes via app).

### `waitlist_entries`

id (UUID), email, company_name NULL, country_code, notes NULL, created_at  

For non-UK employers blocked from full registration.

---

## Indexes (minimum)

- users: `clerk_user_id`, `deleted_at`  
- companies: `company_number`, `verification_status`  
- jobs: `slug`, `status`, `location`, `employment_type`, `industry`, `closing_date`  
- applications: `job_id`, `user_id`, `status`  
- skills: `name`

## Storage

| Concern | Store |
|---------|--------|
| Auth | Clerk |
| Business data | Neon PostgreSQL |
| Current CVs / photos / application CV snapshots | Cloudflare R2 (private) |

## GDPR

- Soft delete sets `deleted_at` and revokes access.  
- Hard delete (and R2 object cleanup) after retention (default **30 days**, configurable).  
- Data export assembles user profile, history, education, qualifications, skills, applications metadata.

## Future (not MVP)

notifications, saved_jobs, messages, interviews, subscriptions, company_users, recruiter_notes
