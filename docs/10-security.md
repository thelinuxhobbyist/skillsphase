# Project Horizon — Security Specification

**Version:** 1.1  
**Status:** Canonical

## Principles

Least privilege · Defence in depth · Secure by default · Validate all input · Never trust the client · Encrypt in transit · Minimise personal data.

## Authentication & Authorisation

- Clerk: email verification, secure sessions; passwords never stored by Horizon.
- Every protected endpoint: authenticate → load user → role → permission/ownership → validate → act.
- Frontend checks are not sufficient.

## Input Validation

Shared Zod schemas for forms, query/route params, uploads, search terms — frontend and backend.

## File Uploads

- Types: PDF, DOCX  
- Max size: **5 MB** (MVP)  
- Generated object keys (not user filenames as storage keys)  
- Private R2; access via authorised APIs / signed URLs  
- Application CV snapshots are distinct objects from the live profile CV  
- Malware scanning: future

## Transport & Data

- HTTPS everywhere in deployed environments  
- Drizzle/parameterised queries only  
- Least-privilege DB credentials  
- Neon backups enabled  

## XSS / CSRF / Injection

- React default escaping; no unsafe HTML unless required and sanitised  
- CSRF mitigated via Clerk session model; add tokens if a cookie pattern requires them  
- No string-concatenated SQL  

## Rate Limiting

Login, password reset, employer registration, CH verification, job create, applications, uploads — configurable.

## Logging & Secrets

Log security-relevant events; never log secrets, full CV contents, or unnecessary PII.  
Secrets via environment variables only (Clerk, Neon, Companies House, R2).

## GDPR

- Privacy Policy, Cookie Policy, Terms  
- Data export (`GET /users/me/export`)  
- Soft delete → hard delete after retention (default 30 days)  
- UK GDPR compliance  

## Audit Trail

Immutable `admin_logs` for administrative actions.

## Monitoring & Backups

Errors, latency, auth failures, DB/R2 health; encrypted backups with tested restore.

## Pre-release Checklist

Auth works · RBAC enforced · uploads validated · rate limits on · secrets safe · HTTPS · safe errors · backups · logs · GDPR export/delete · UK-only employer gate · unique company numbers.
