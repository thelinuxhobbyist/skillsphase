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

**Phase 1 — Identity & roles** implemented:

- Clerk session validation on the API
- Role selection at registration (`job_seeker` / `employer`)
- `POST /api/v1/users/me/bootstrap`, `GET/PATCH/DELETE /users/me`, `GET /users/me/export`
- Protected dashboards (`/dashboard`, `/employer`, `/admin`) with role redirects
- Admins are not self-serve (provisioned in the database)

**Still required for a full local auth loop:** Neon `DATABASE_URL` + Clerk keys in `apps/web/.env.local` and `apps/api/.dev.vars`, then `pnpm db:migrate`.

Next: Phase 2 — employer verification (Companies House + admin approval).
