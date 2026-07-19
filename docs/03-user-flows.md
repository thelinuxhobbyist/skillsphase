# Project Horizon — User Flows

**Version:** 1.1  
**Status:** Canonical

## Purpose

Primary user journeys. Edge cases should be handled during implementation; this document covers the expected happy paths and key branches.

---

### Flow 1 — Job Seeker Registration

1. Visit homepage → Sign Up → Job Seeker.  
2. Clerk registration + email verification.  
3. App creates `users` row (`role = job_seeker`).  
4. Prompted to complete profile (CV optional during onboarding).  
5. Land on dashboard.  

**Result:** Can browse jobs; can apply only when profile completion rules are met.

---

### Flow 2 — Employer Registration (UK only)

1. Register as Employer via Clerk + email verification.  
2. Employer onboarding form: company number, business email, website (HTTPS), recruiter name/title.  
3. If non-UK: block or offer waitlist — do not create a company.  
4. Validate number via Companies House API; show returned name for confirmation.  
5. Reject duplicate `company_number`.  
6. Submit → `verification_status = pending_review`.  
7. Admin reviews → Approve / Reject (with `rejection_reason`).  

**Approved:** access employer dashboard.  
**Rejected:** can update details and resubmit → status resets to `pending_review`.  
**Email:** approval confirmation sent when approved.

---

### Flow 3 — Complete Job Seeker Profile

Dashboard → Complete Profile:

- Personal details (name, location)  
- Career summary  
- Optional career-gap narrative  
- Employment history, education, qualifications, skills  
- CV upload  
- Optional cover-letter template  

Save → `profile_completed` computed from completion rules.

**Required to apply:** Name, Email, Location, Career Summary, ≥1 Skill, CV.

---

### Flow 4 — Search for Jobs

Open `/jobs` → keywords + filters (location, remote, employment type, industry) → select job → `/jobs/{slug}`.

---

### Flow 5 — Apply for a Job

1. Open job details (`/jobs/{slug}`).  
2. Apply → must be logged in as job seeker.  
3. System checks profile completion + CV present.  
4. Review application; optional cover letter (prefill from template if set).  
5. Submit → store application with **CV snapshot**, status `applied`.  
6. Send **application confirmation** email.  
7. Employer sees application in their dashboard.

---

### Flow 6 — Employer Creates a Job

Approved employer → Create Job → title, description, location, salary (optional), employment type, industry, closing date, skills → Save Draft or Publish.

**Admin variant:** Admin selects an approved company, then creates the job the same way.

**Result:** Published jobs are searchable; public URL uses `slug`.

---

### Flow 7 — Employer Reviews Applicants

Dashboard → Job → Applicants → review profile summary + CV snapshot → update status:

`applied` → `under_review` → `interview` → `offer` → `hired`  
Terminal: `rejected`, `withdrawn` (seeker-initiated).

---

### Flow 8 — Admin Approves Employer

Admin → Pending Employers → review CH data, website, business email → Approve / Reject / Suspend.  
Log action. Email employer on approval.

---

### Flow 9 — Update Company Information

Employer updates permitted fields. Changing `company_number` re-triggers verification (`pending_review`) and must remain unique / UK-valid.

---

### Flow 10 — Delete Account (GDPR)

**Job Seeker:** Settings → Delete Account → confirm → **soft delete** → hard delete after retention period; Clerk account removed as part of process.

**Employer:** Must close jobs and resolve outstanding applications first; then soft delete → hard delete after retention.

**Export:** User may export their data before deletion.

---

### Flow 11 — Employer Resubmission After Rejection

1. View rejection reason.  
2. Update company information.  
3. Resubmit → `verification_status = pending_review`, clear or archive prior decision notes as appropriate.  
4. Returns to admin queue.

---

## Error States

Email verification failed · Invalid / non-UK company number · Duplicate company · Approval rejected · CV upload failed · Job closed · Session expired · Permission denied · Profile incomplete for apply.

Each error must explain what happened and how to proceed (no technical leakage).

## Principles

Minimum steps · Clear feedback · Progress for long operations · AuthZ before protected actions.
