# Project Horizon — Pages & Information Architecture

**Version:** 1.1  
**Status:** Canonical

## Public Pages

| Route | Purpose |
|-------|---------|
| `/` | Hero, mission (Career Return Platform), search, how it works, benefits, featured jobs, CTA |
| `/about` | Mission and values |
| `/jobs` | Browse/search/filter/paginate/sort published jobs |
| `/jobs/{slug}` | Job details; Apply requires login + complete profile |
| `/login` | Clerk |
| `/register` | Choose Job Seeker or Employer → Clerk |
| `/waitlist` | Non-UK employer interest capture |

## Job Seeker Pages

| Route | Purpose |
|-------|---------|
| `/dashboard` | Recent applications, profile completion, quick links (no advanced recommendations) |
| `/profile` | Personal details, career summary, career-gap narrative, history, education, qualifications, skills, CV, cover-letter template |
| `/applications` | Track applications |
| `/settings` | Account, password (Clerk), export data, delete account |

**Application statuses shown:** `Applied`, `Under Review`, `Interview`, `Offer`, `Hired`, `Rejected`, `Withdrawn`.

## Employer Pages

| Route | Purpose |
|-------|---------|
| `/employer` | Active/draft jobs, applications received, company status |
| `/employer/company` | Company details, verification status, rejection reason (if any), resubmit |
| `/employer/jobs` | List vacancies |
| `/employer/jobs/new` | Create job (draft/publish) |
| `/employer/jobs/{id}/edit` | Edit job (numeric id) |
| `/employer/jobs/{id}/applications` | Review applicants, update status, download CV snapshot |
| `/employer/settings` | Account settings, export, delete (when eligible) |

Pending/rejected/suspended employers see clear status banners; job creation hidden/disabled.

## Administrator Pages

| Route | Purpose |
|-------|---------|
| `/admin` | Stats widgets, quick actions |
| `/admin/employers` | Approve / Reject / Suspend / Reinstate |
| `/admin/users` | Suspend / Reactivate / Delete (not self) |
| `/admin/jobs` | Moderate jobs; admins may create jobs for approved companies |
| `/admin/jobs/new` | Admin create job (select approved company) |
| `/admin/audit` | Read-only audit log |
| `/admin/reports` | **Placeholder** simple counts (advanced analytics out of MVP) |

See also [09 — Admin Panel](./09-admin-panel.md).

## Error Pages

`/403` · `/404` · `/500`

## Navigation

- **Public:** Home, Jobs, About, Login, Register  
- **Seeker:** Dashboard, Jobs, Applications, Profile, Settings  
- **Employer:** Dashboard, Jobs, Company, Settings  
- **Admin:** Dashboard, Employers, Users, Jobs, Audit, Reports  

Role-appropriate nav only. Consistent layout; responsive; keyboard-accessible where practical.
