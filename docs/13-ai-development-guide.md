# Project Horizon — AI Development Guide

**Version:** 1.1  
**Status:** Canonical

## Purpose

How AI coding assistants must contribute. Documentation in `/docs` is authoritative. On conflict, prefer the newest version and [ADR 001](./decisions/001-canonical-product-decisions.md). Highlight ambiguity instead of guessing.

## Required Reading Order

1. Root `README.md` (quick-start)  
2. `docs/01-product-requirements.md`  
3. `docs/02-user-roles.md`  
4. Relevant feature spec (API, Auth, Verification, Admin, Schema, …)  
5. `docs/10-security.md`  
6. `docs/12-development-standards.md`  
7. This guide  

## MVP Priorities

Simplicity · Security · Maintainability · Scalability · Trust  

Do not add out-of-scope features (AI matching, messaging, full notification centre, non-UK onboarding, etc.) unless explicitly requested.

## Stack (do not replace)

Next.js · React · TypeScript · Tailwind · shadcn/ui · Cloudflare Workers · Neon · Drizzle · Clerk · R2 · Zod · `/api/v1`

## Hard Rules

- Verify Clerk session → load user → role → ownership → validate → act  
- Snapshot CVs on apply; never mutate historical application CVs when profile CV changes  
- Application statuses: `applied`, `under_review`, `interview`, `offer`, `hired`, `rejected`, `withdrawn`  
- Public job URLs use `slug`; internal job identity uses numeric `id`  
- UK employers only; unique `company_number`; rejection + resubmit → `pending_review`  
- GDPR export + soft delete  
- No new frameworks without approval; no hardcoded secrets; no inventing requirements  

## Workflow

1. Read docs  
2. Identify dependencies  
3. Plan  
4. Implement **one** feature  
5. Test (or describe tests)  
6. Update docs if behaviour/schema/API changed  

## Prompt Template

> Read the relevant documentation in `/docs` before making changes. Implement only the requested feature. Do not modify unrelated code. Follow the documented stack and standards. Explain assumptions before implementation if anything is unclear.

## Success

AI output should match well-reviewed human code quality. Documentation remains the source of truth.
