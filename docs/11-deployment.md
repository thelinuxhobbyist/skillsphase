# Project Horizon — Deployment & Infrastructure

**Version:** 1.1  
**Status:** Canonical

## Architecture

```
Internet
   ↓
Cloudflare DNS
   ↓
Cloudflare Pages (Next.js frontend)
   ↓
Cloudflare Workers API (/api/v1)
   ├── Neon PostgreSQL
   ├── Cloudflare R2
   ├── Clerk
   └── Companies House API
```

Transactional email for employer approval + application confirmation is sent from Workers (provider chosen at implementation, e.g. Resend). Clerk owns registration/password-reset email.

## Components

| Layer | Tech | Notes |
|-------|------|-------|
| Frontend | Next.js, React, Tailwind, shadcn/ui | Cloudflare Pages |
| Backend | Cloudflare Workers (TypeScript) | Business logic, authZ, R2, CH |
| Database | **Neon PostgreSQL** | Drizzle ORM, SSL, pooling |
| Storage | Cloudflare R2 | Private CVs/photos/snapshots |
| Auth | Clerk | Sessions validated in Workers |

Frontend never talks to Neon, R2 admin APIs, or Companies House directly.

## Environments

| Env | Purpose |
|-----|---------|
| Development | Local web + workers; Clerk/Neon/R2 dev resources |
| Staging | Production-like pre-release |
| Production | Public, monitored, backed up |

## Example environment variables

**Frontend:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_API_BASE_URL`  
**Backend:** `CLERK_SECRET_KEY`, `DATABASE_URL` (Neon), `COMPANIES_HOUSE_API_KEY`, R2 credentials, email provider key, `DATA_RETENTION_DAYS`, `ENVIRONMENT`

Never commit secrets.

## CI/CD

Feature branch → PR → checks → review → merge `main` → deploy staging → manual approval → production.

## Operations

- Daily Neon backups + periodic restore tests  
- R2 versioning/lifecycle for orphaned uploads  
- Monitor Worker errors, latency, Neon, R2, Clerk, Companies House, email send failures  
- Document disaster recovery: DB restore, secret rotation, R2 recovery, DNS/deploy rollback  

## Scalability (later)

Queues, search indexing, AI recommendations, analytics — design-compatible, not MVP scope.
