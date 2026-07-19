# Project Horizon — Development Standards

**Version:** 1.1  
**Status:** Canonical

## Principles

Simplicity · Readability · Security · Maintainability · Performance · Accessibility.

## Technology Stack

| Area | Choice |
|------|--------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Cloudflare Workers, TypeScript |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM |
| Auth | Clerk |
| Storage | Cloudflare R2 |
| Validation | Zod |

## Repository Layout

Root `README.md` is a **quick-start**. Detailed specs live in `/docs`.

```
apps/
  web/                 # Next.js frontend
  api/                 # Cloudflare Workers API
packages/
  database/            # Drizzle schema + migrations
  ui/                  # Shared UI
  shared/              # Shared Zod types/utils
docs/                  # Canonical specifications + ADRs
scripts/
tests/
archive/               # Original source materials (e.g. docx drafts)
```

## Language & Style

- TypeScript strict; avoid `any` without documented justification  
- Files: kebab-case · Components: PascalCase · vars: camelCase · DB: plural snake_case  
- Small focused functions; comments explain **why**  

## API & Database

- All routes under `/api/v1`  
- Auth + authZ + Zod validation on every protected endpoint  
- Migrations for every schema change  
- Index hot query paths  

## Git

- `main` always deployable  
- Branches: `feature/...`, `fix/...`, `chore/...`  
- Clear commit messages (“Add employer registration workflow”)  

## Testing

Unit tests for business logic · API integration tests · manual critical flows.

## Accessibility & Performance

Semantic HTML, labels, keyboard support, contrast, clear errors.  
SSR where appropriate; efficient queries; avoid premature optimisation.

## Documentation

Major features update `/docs` (and ADRs when decisions change). Docs and code stay synchronised.

## Definition of Done

Requirements met · types/tests pass · docs updated · security reviewed · code reviewed · no known critical issues.
