# ADR 003 — Skills-First Universal Profile & Flexible Supporting Information

**Status:** Accepted  
**Date:** 2026-08-07  
**Context:** Canonical product vision, profile direction, and onboarding UX for SkillsPhase. Guarantees an approachable, ultra-fast experience for every profession (warehouse operatives, retail assistants, care workers, electricians, teachers, software developers).

These decisions are authoritative for product messaging, homepage copy, database schema, onboarding UX, and profile editing.

---

## 1. Core Principle & Vision

> **Skills first. Because life happens.**

Careers are not linear. Interruptions happen—illness, raising children, caring for family, military service, education, redundancy, relocation, career changes, and other life events.

Traditional CVs force employers to focus on timeline gaps rather than actual capability. SkillsPhase turns this around: employers understand what someone is capable of before making assumptions based on career timelines.

---

## 2. Onboarding & Core UX Decisions

### A. First Question Prompt
Upon registration or creating a profile, the platform immediately asks:
> **"What kind of job are you looking for?"**

This grounds the profile in its primary purpose—applying for a job—before asking for secondary details.

### B. Plain Language over Tech Jargon
- Replace "Primary Capability" with **"Desired Role / Main Role"** or **"What type of work you do"**.
- Field labels are friendly, clear, and universally understood across all trades and professions.

### C. Separate Availability & Employment Type
Availability and employment type are distinct fields:
1. **Notice Period / Availability**: *Available immediately*, *1 week notice*, *2 weeks notice*, *1 month notice*, *Negotiable*.
2. **Desired Employment Type**: *Full-time*, *Part-time*, *Contract / Temporary*, *Flexible / Any*.

### D. Ultra-Minimal Required Profile to Apply (Under 2 Minutes)
To remove friction for candidates in warehouse, retail, care, trade, and entry-level roles, only **4 essential items** are required to complete a profile and apply for jobs:
1. **Name**
2. **Location** (City)
3. **Desired Job Title / Role** (*What kind of job are you looking for?*)
4. **At least 1 Skill**

Everything else is **optional** and can be added later or provided upon employer request:
- Work History (Optional)
- Education (Optional)
- Qualifications & Licences (Optional)
- Supporting Links & CV (Optional)

---

## 3. Universal Profile Structure

One simple structure for every profession:
1. **Name & Location**
2. **Desired Role / Job Title**
3. **Availability & Employment Type** (Separated)
4. **Skills** (min. 1)
5. **About Me** (supported by 4 guided questions)
6. **Experience** (optional)
7. **Qualifications & Licences** (optional)
8. **Supporting Information** (optional)

---

## 4. Guided Profile Completion (4 Simple Questions)

To eliminate writer's block:
1. **What type of work are you looking for?**
2. **What are your strongest skills?**
3. **What kind of work do you enjoy?**
4. **What would you like employers to know about you?**

The platform generates an editable first draft for the candidate.

---

## 5. The 10 Product Principles

1. **Skills before career gaps.**
2. **Modernise the CV, not recruitment.**
3. **Keep applying for jobs familiar.**
4. **One profile that works for every profession.**
5. **Keep profiles simple.**
6. **Supporting information should be flexible, never mandatory.**
7. **Help users create strong profiles.**
8. **Don't assume every profession has a portfolio.**
9. **Make the platform feel inclusive.**
10. **Remember why SkillsPhase exists.**

---

## 6. The Key Design Test

Whenever making a product or design decision, ask:

> **Does this help employers understand what someone can do without allowing career gaps to become the defining feature of their application?**
