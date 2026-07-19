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
**API keys & services checklist:** [`docs/14-credentials-and-services.md`](./docs/14-credentials-and-services.md)

> Finish product features first, then provision services **one at a time** (Neon → Clerk → Companies House → R2 → email → deploy).

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

**MVP product features in place** (Phases 0–5 + polish: GDPR settings, admin users/audit/reports, employer edit flows, landing/nav).

**Live Workers (public shell):**
- Web: https://horizon-web.yama.workers.dev  
- API: https://horizon-api.yama.workers.dev/health  

Redeploy: `pnpm --filter @horizon/api run deploy` · `pnpm --filter @horizon/web run deploy`  

API keys are **deferred** — when you are ready, follow the session checklist in [`docs/14-credentials-and-services.md`](./docs/14-credentials-and-services.md) (Neon → Clerk → Companies House → R2 → email), one service at a time. Login/jobs data need Neon + Clerk before the live site is fully functional.
