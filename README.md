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

**Phases 0–3 in place** (foundations, identity, employer verification, seeker profiles).

See [`docs/14-credentials-and-services.md`](./docs/14-credentials-and-services.md) for every API key — provision them **after** features, one service at a time.

Next product work: Phase 4 — jobs (create, publish, public search).
