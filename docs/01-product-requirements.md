# Project Horizon — Product Requirements Document (PRD)

**Version:** 1.1  
**Status:** Canonical

## 1. Purpose

Project Horizon is a **Career Return Platform** — a recruitment product that helps talented people return to work after career breaks, and gives employers access to an overlooked talent pool.

It is not a generic job board. Its primary purpose is to connect **verified UK employers** with candidates whose careers have not followed a traditional, uninterrupted path.

## 2. Problem Statement

Many recruitment platforms disadvantage candidates with employment gaps caused by caring, parenting, illness, education, military service, career changes, redundancy, or other life events. These candidates often fail automated screening despite strong skills.

Project Horizon removes that barrier by making career-returner-friendly hiring and employer trust first-class.

## 3. Objectives (MVP)

- Job seekers register and build professional profiles (including qualifications and career-gap narrative).
- Verified UK employers advertise vacancies.
- Candidates apply for jobs (with CV snapshots).
- Employers manage applicants.
- Administrators verify employers and moderate the platform.
- GDPR-ready data export and account deletion.
- Keep the platform simple, secure, and scalable.

## 4. Out of Scope (MVP)

- AI job matching / advanced job recommendations
- AI CV writing
- Messaging between employers and candidates
- Interview scheduling / video interviews
- Paid subscriptions
- Mobile applications
- Recruitment agency management
- Payroll / HR management tools
- Full notification centre (beyond essential transactional emails)
- Non-UK employer onboarding (waitlist only)

## 5. User Types

### Job Seeker

Create a profile, upload a CV, search jobs, apply, track applications, export/delete data.

### Employer

Register a UK company, complete verification, create jobs (once approved), review applicants, download CV snapshots.

### Administrator

Verify employers, moderate users and jobs, create jobs on behalf of approved companies, view simple platform stats.

## 6. Core Features

### Authentication (Clerk)

Register, login, reset password, verify email.

### Job Seeker Profiles

- Profile photo (optional)
- Career summary
- Career-gap narrative (optional but encouraged)
- Employment history
- Education
- Qualifications
- Skills
- CV upload
- Optional saved cover-letter template
- Update profile

**Profile completion required to apply:** Name, Email, Location, Career Summary, at least one Skill, and a CV.

### Employer Profiles & Verification

- UK Companies House registration number (unique)
- Business email, website, recruiter name/title
- Companies House validation + mandatory admin approval
- Rejection with reason + resubmission (`pending_review`)
- Non-UK companies blocked / directed to waitlist

### Job Management

Approved employers (and admins) can create, edit, close, reopen, and delete draft jobs. Public URLs use slugs; internal identity uses numeric job IDs.

### Job Search

Keywords, location, industry, employment type, remote type.

### Applications

- Apply with optional cover letter (per application)
- CV snapshotted at submit time
- Status lifecycle: `applied` → `under_review` → `interview` → `offer` → `hired`, plus `rejected` / `withdrawn`
- Employers shortlist/update status; seekers withdraw when allowed
- Application confirmation email (MVP)

### Admin Dashboard

Approve/reject/suspend employers, manage users, moderate jobs, create jobs for approved companies, view stats/placeholders, audit logs.

### Essential Emails (MVP)

| Email | Provider |
|-------|----------|
| Registration / email verification | Clerk |
| Password reset | Clerk |
| Employer approval | Backend |
| Application confirmation | Backend |

### GDPR

- User data export
- Soft delete, then permanent deletion after retention period

## 7. Success Criteria

- Job seekers can apply successfully.
- Employers can recruit from applications.
- Admins maintain trust via employer verification.
- Platform is stable, secure, and easy to use.

## 8. Non-Functional Requirements

Performance, security (HTTPS, validation, RBAC), accessibility, and scalability for future expansion without major redesign.

## 9. Guiding Principles

Build trust · Reduce barriers · Keep UX simple · Protect privacy · Verify employers · Design for scale · Avoid MVP complexity.
