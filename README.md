# Project Horizon

**Career Return Platform** — connecting verified UK employers with people returning to work after a career break.

## Quick start

Requirements: Node.js 20+, pnpm 9 (`corepack enable`).

```bash
# Install dependencies
pnpm install

# Copy env templates and fill in secrets when ready
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.dev.vars.example apps/api/.dev.vars

# Generate SQL migrations (requires DATABASE_URL for migrate, not for generate)
pnpm db:generate

# Run API (Cloudflare Workers — http://localhost:8787)
pnpm dev:api

# Run web (Next.js — http://localhost:3000)
pnpm dev:web
```

Health check: `GET http://localhost:8787/health`  
API root: `GET http://localhost:8787/api/v1`

## Documentation

Canonical specs: [`docs/README.md`](./docs/README.md)  
Product decisions: [`docs/decisions/001-canonical-product-decisions.md`](./docs/decisions/001-canonical-product-decisions.md)

## Monorepo layout

```
apps/web                 # Next.js frontend
apps/api                 # Cloudflare Workers API (/api/v1)
packages/database        # Drizzle schema + migrations (Neon)
packages/shared          # Zod schemas + shared constants
packages/ui              # Shared UI primitives
docs/                    # Product & technical specifications
archive/                 # Original docx drafts
```

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Cloudflare Workers + Hono |
| Auth | Clerk |
| Database | Neon PostgreSQL + Drizzle ORM |
| Files | Cloudflare R2 (wired in a later phase) |

## Current status

**Phase 2 — Employer verification** implemented:

- Companies House validation (`POST /companies/verify`) with dev mock when no API key
- Employer registration → `pending_review` (unique UK `company_number`)
- Resubmit after rejection, non-UK `/waitlist`
- Admin approve / reject / suspend / reinstate + audit log + approval email hook
- Employer and admin UI for the verification flow

**Local setup:** Neon `DATABASE_URL`, Clerk keys, optional `COMPANIES_HOUSE_API_KEY` / Resend keys in `apps/api/.dev.vars`, then `pnpm db:migrate`.

Next: Phase 3 — job seeker profile (history, qualifications, CV upload).
