# Project Horizon — Employer Verification

**Version:** 1.1  
**Status:** Canonical

## Goal

Only legitimate **UK** organisations post jobs. MVP = automated Companies House validation + mandatory manual admin approval.

## Principles

Secure · Simple · Transparent · Hard to abuse · Easy to administer · Protect seekers over reducing employer friction.

## Workflow

### 1. Create account (Clerk)

Email + password (or supported method) + email verification → Employer Registration form.

### 2. Company information

| Field | Rules |
|-------|-------|
| Company registration number | Required; UK Companies House number; **unique** |
| Business email | Required; free providers allowed but flagged for review |
| Website | Required; HTTPS |
| Recruiter name / job title | Required |

**Non-UK:** do not accept full registration; offer `/waitlist`.

Company **name** is taken from Companies House confirmation, not free-typed as the primary identifier.

### 3. Companies House validation

Backend calls Companies House API: exists, name, status, optional address/incorporation date.  
Show name to employer for confirmation.  
**Never auto-approve** from CH data alone.

### 4. Pending review

`verification_status = pending_review`.  
Can log in; cannot post jobs. Clear banner: awaiting approval.

### 5. Admin decision

Approve · Reject (store `rejection_reason`) · Suspend.  
All decisions → `admin_logs`.  
**Email employer on approval** (MVP essential email).

### 6. Resubmission after rejection

Employer updates details → `POST /companies/me/resubmit` → status **`pending_review`** again → returns to admin queue.

## Duplicate prevention

Unique DB constraint on `company_number`. API returns a clear error if already registered.

## Suspended employers

Login allowed; no job create/edit/publish; no applicant access.

## Audit events

Registration submitted · CH validation completed · Approved · Rejected · Suspended · Reinstated · Resubmitted.

## Security

Server-side validation only · rate-limit registration & CH calls · never trust browser · log suspicious patterns.

## Success criteria

Block fake employers · low admin burden · seeker trust · legitimate UK employers finish in minutes.
