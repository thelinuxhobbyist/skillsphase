# Project Horizon — Admin Panel Specification

**Version:** 1.1  
**Status:** Canonical

## Purpose

Internal tool for quality, security, and integrity. Not customer-facing. Every administrative action is logged.

## Design Principles

Fast · Clear · Secure · Easy to navigate · Audit-friendly.

## Dashboard — `/admin`

**Widgets:** pending employer approvals, total employers, total job seekers, active jobs, pending applications, recent users, recent admin actions.

**Quick actions:** review employers, review jobs, search users, view audit logs.

## Employer Management — `/admin/employers`

Filters: company name, registration number, verification status, registration date.

Details: CH number/name, business email, website, recruiter fields, CH result, dates, status, rejection reason.

Actions (with confirmation): Approve, Reject, Suspend, Reinstate, View profile.

Rejecting requires `rejection_reason`. Approving sends approval email.

## User Management — `/admin/users`

Filters: name, email, role, registration date.

Actions: View profile, Suspend, Reactivate, Delete (confirm).  
**Administrators cannot delete their own account.**

## Job Moderation — `/admin/jobs`

Filters: employer, industry, published date, status.

Actions: View, Close, Remove (retain for audit), View employer.

### Admin job creation — `/admin/jobs/new`

Admins **can create jobs**. Must select an **approved** company, then use the same job fields as employers. `created_by_user_id` = admin; `company_id` = selected company.

## Audit Logs — `/admin/audit`

Read-only. Fields: timestamp, administrator, action, entity, entity ID, optional notes.

Examples: Employer Approved/Suspended, User Deleted, Job Removed, Job Created By Admin.

## Reports — `/admin/reports`

**Placeholder** for MVP: simple counts already shown on the dashboard are sufficient. Advanced analytics are out of scope.

## Search

Partial-match search across users, employers, and jobs.

## Notifications

In-app admin notifications are **future**. MVP relies on admins checking the pending queue; essential emails are for end users only.

## Security

Admin role required on every admin API. Hidden nav is not enough. Meaningful errors without sensitive leakage.

## Performance

Pagination and sorting on large lists; avoid over-fetching.

## Success Criteria

Efficient employer decisions · remove fraud · safe user management · complete audit trail · low operational overhead.
