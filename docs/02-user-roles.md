# Project Horizon — User Roles & Permissions

**Version:** 1.1  
**Status:** Canonical

## Purpose

Defines every user role and permission. **Permissions must always be enforced on the backend.** Frontend restrictions are usability-only.

## Roles

1. Job Seeker  
2. Employer  
3. Administrator  

Future (not MVP): Recruitment Agency, Company Administrator, Company Recruiter, Platform Moderator, Support Agent.

---

## Job Seeker

**Can:** register/login/logout, reset password, verify email, complete profile (including qualifications & career-gap narrative), upload/replace CV, optional photo, optional cover-letter template, search/view jobs, apply (when profile complete), withdraw applications, view history, account settings, **export data**, **delete account** (soft delete).

**Cannot:** create/edit jobs, view applicants, approve employers, access admin features, view other users’ personal data.

---

## Employer

### States

| State | Allowed | Not allowed |
|-------|---------|-------------|
| `pending_review` | Login, complete/update company profile, view status, resubmit after rejection | Create jobs, view applicants, recruitment features |
| `approved` | Full recruitment: jobs, applicants, CV downloads, company profile | Admin features, other companies’ data |
| `rejected` | Login, view rejection feedback, update company info, **resubmit** → `pending_review` | Create jobs, view applicants |
| `suspended` | Login, view suspension notice | Jobs, applicants, recruitment features |

**Can (approved):** create/edit/close/reopen jobs; delete drafts; view own applicants; download application CV snapshots; update company/recruiter details.

**Cannot:** approve employers; access other companies’ applicants; access admin analytics; register a duplicate `company_number`; onboard as non-UK company (waitlist only).

Employers may only manage jobs belonging to their own company.

**Account deletion:** Not allowed while active jobs or unresolved applications exist. Close jobs and resolve applications first, then soft-delete.

---

## Administrator

**Can:** approve/reject/suspend/reinstate employers; delete users (not self); remove/close jobs; **create jobs for approved companies**; view users/employers/jobs; view platform statistics (simple); view audit logs; access `/admin`.

**Cannot:** delete their own account.

Every admin action must be audit-logged.

---

## Permission Matrix (summary)

| Action | Seeker | Employer Pending/Rejected/Suspended | Employer Approved | Admin |
|--------|--------|-------------------------------------|-------------------|-------|
| Register / Login | ✅ | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ | ✅ |
| Upload CV | ✅ | ❌ | ❌ | ❌ |
| Search / view jobs | ✅ | ✅ | ✅ | ✅ |
| Apply for job | ✅ | ❌ | ❌ | ❌ |
| Create job | ❌ | ❌ | ✅ | ✅ |
| Edit own company jobs | ❌ | ❌ | ✅ | ✅* |
| View applicants | ❌ | ❌ | ✅ (own) | ✅ |
| Download CV snapshot | ❌ | ❌ | ✅ (own) | ✅ |
| Approve / suspend employers | ❌ | ❌ | ❌ | ✅ |
| Delete users | ❌ | ❌ | ❌ | ✅ |
| Export own data | ✅ | ✅ | ✅ | ✅ |
| Soft-delete own account | ✅ | ✅** | ✅** | ❌ (self) |

\* Admin may manage any job for moderation or create jobs for an approved company.  
\*\* Subject to employer deletion constraints above.

## Authorisation Principles

1. Backend enforces all permissions.  
2. Users access only their own resources unless explicitly authorised.  
3. Employers manage only their organisation’s jobs.  
4. Admins have full platform access (except deleting themselves).  
5. Every protected API endpoint verifies authentication **and** authorisation.
