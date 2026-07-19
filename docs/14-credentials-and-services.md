# Project Horizon — Credentials & External Services

**Version:** 1.0  
**Status:** Living checklist  

This is the single inventory of every API key, secret, and third-party service the MVP needs.  
**Do not put real secrets in this file or in git.** Use local env files only (see below).

---

## Where secrets live

| Environment | File(s) | Notes |
|-------------|---------|--------|
| Next.js (local) | `apps/web/.env.local` | From `apps/web/.env.example` |
| Workers (local) | `apps/api/.dev.vars` | From `apps/api/.dev.vars.example` |
| Root reference | `.env.example` | Template only — never commit real values |
| Production | Cloudflare / Neon / Clerk dashboards | Set via Wrangler secrets + host dashboards |

---

## Setup order (after the app is feature-complete)

Work through these **one service at a time** when you are ready:

1. **Neon** — database URL + run migrations  
2. **Clerk** — auth keys for web + API  
3. **Companies House** — employer verification (optional mock works in dev)  
4. **Cloudflare R2** — CV / photo storage  
5. **Resend (or email provider)** — approval + application emails  
6. **Cloudflare account** — Pages + Workers deploy, Hyperdrive (recommended for Neon)

---

## Service inventory

### 1. Clerk (authentication) — **required for real login**

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | web | Browser Clerk SDK |
| `CLERK_SECRET_KEY` | web + api | Server / Worker verification |
| `CLERK_PUBLISHABLE_KEY` | api | Worker `authenticateRequest` |
| `CLERK_AUTHORIZED_PARTIES` | api | Allowed front-end origins (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | web | `/login` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | web | `/register` |

**Dashboard:** https://dashboard.clerk.com  
**Also configure in Clerk UI:**

- Allowed redirect URLs: `http://localhost:3000/*` (and production domain later)
- Email verification enabled (registration emails are Clerk-owned)

**Without keys:** UI shell works; sign-in/sign-up show a “configure Clerk” message.

---

### 2. Neon (PostgreSQL) — **required for any persisted data**

| Variable | Where | Purpose |
|----------|--------|---------|
| `DATABASE_URL` | api (+ drizzle migrate) | App database connection string |

**Dashboard:** https://console.neon.tech  
**After creating DB:**

```bash
# put DATABASE_URL in apps/api/.dev.vars and shell env for migrate
pnpm db:migrate
```

**Without URL:** API returns `DATABASE_NOT_CONFIGURED` on data routes. Health still works.

---

### 3. Companies House API — **required for real UK company checks**

| Variable | Where | Purpose |
|----------|--------|---------|
| `COMPANIES_HOUSE_API_KEY` | api | Basic-auth username for CH REST API |

**Dashboard:** https://developer.company-information.service.gov.uk  
Create an **API Key** application (REST, not streaming).

**Without key (development):** API uses a **mock** company lookup so employer flows can be tested.

---

### 4. Cloudflare R2 — **required for CV / photo uploads (Phase 3+)**

| Variable / binding | Where | Purpose |
|--------------------|--------|---------|
| R2 bucket binding `UPLOADS` | `apps/api/wrangler.jsonc` | In-Worker object storage |
| `R2_ACCOUNT_ID` | api (if using S3-compatible SDK) | Account id |
| `R2_ACCESS_KEY_ID` | api | S3 API access key |
| `R2_SECRET_ACCESS_KEY` | api | S3 API secret |
| `R2_BUCKET_NAME` | api | e.g. `horizon-uploads` |

**Dashboard:** Cloudflare → R2  
Bucket must be **private**. Serve via signed URLs / authorised API only.

**Status:** R2 binding `UPLOADS` is configured in `wrangler.jsonc`. Local Wrangler simulates the bucket; production needs a real bucket. If the binding is unavailable in development, CV uploads fall back to a `dev://` marker so profile completion can still be tested.

---

### 5. Email (Resend recommended) — **required for MVP transactional mail**

| Variable | Where | Purpose |
|----------|--------|---------|
| `EMAIL_API_KEY` | api | Resend API key |
| `EMAIL_FROM` | api | Verified sender, e.g. `Horizon <noreply@yourdomain.com>` |

**MVP emails:**

| Email | Owner |
|-------|--------|
| Registration / email verification | **Clerk** |
| Password reset | **Clerk** |
| Employer approval | **Horizon API** (Resend) |
| Application confirmation | **Horizon API** (Resend) — Phase 5 |

**Without keys:** Approval/application sends are logged and skipped (no hard failure).

---

### 6. Cloudflare platform — **required for deploy**

| Item | Purpose |
|------|---------|
| Cloudflare account | Pages (web) + Workers (api) |
| `wrangler` login | Deploy API |
| Hyperdrive (recommended) | Pooled Neon connections from Workers |
| DNS / custom domain | Production hostnames |

**Not secrets in repo:** use `wrangler secret put` for production secrets.

---

### 7. App / ops config (not third-party keys)

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | web | e.g. `http://localhost:8787/api/v1` |
| `ENVIRONMENT` | api | `development` \| `staging` \| `production` |
| `DATA_RETENTION_DAYS` | api | Soft-delete → hard-delete window (default `30`) |

---

## Checklist (copy when provisioning)

```
[ ] Neon project created → DATABASE_URL
[ ] pnpm db:migrate succeeded
[ ] Clerk app created → publishable + secret keys
[ ] Clerk redirect URLs set for local (and later prod)
[ ] Companies House API key created
[ ] R2 bucket created + binding / S3 credentials
[ ] Resend account + verified domain → EMAIL_API_KEY, EMAIL_FROM
[ ] Cloudflare Pages + Workers wired for staging/prod
[ ] Admin user provisioned in Neon (role = admin)
[ ] Production secrets set via wrangler secret put (not .env in git)
```

---

## Deferred credentials session (do later — not now)

Keys are **not** required to finish product UI. When you are ready to create accounts and paste secrets, walk this list **one step at a time** in a dedicated chat session. Do not skip ahead.

### Session TODO (copy into the chat when ready)

```
Credentials walkthrough — Project Horizon
[ ] 0. Confirm local env files exist (apps/web/.env.local, apps/api/.dev.vars) from examples
[ ] 1. Neon — create project → paste DATABASE_URL → pnpm db:migrate → smoke /health + a data route
[ ] 2. Clerk — create app → paste publishable/secret keys (web + api) → set redirect URLs → first register/login
[ ] 3. Companies House — create API key → paste COMPANIES_HOUSE_API_KEY → real company lookup
[ ] 4. Cloudflare R2 — create private bucket horizon-uploads → bind UPLOADS / S3 keys → real CV upload
[ ] 5. Resend — verify domain → EMAIL_API_KEY + EMAIL_FROM → approval + application emails
[ ] 6. Cloudflare deploy — Pages (web) + Workers (api) + secrets via wrangler secret put
[ ] 7. Promote one Neon user to role=admin (SQL) and verify /admin
```

**Rules for that session:** you create each account in the browser; the assistant only tells you where to click and which env var to paste. Never commit real secrets.

Until then, keep building against mocks / optional keys so product work is not blocked.
