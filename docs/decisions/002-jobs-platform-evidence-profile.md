# ADR 002 — Jobs Platform + Evidence-Based Profile

**Status:** Accepted  
**Date:** 2026-08-06  
**Context:** Homepage and profile work risked drifting toward a LinkedIn-style professional identity product. This ADR restores the intended product shape and records profile design principles.

These decisions are authoritative for product messaging, homepage copy, and SkillsPhase profile design. Where earlier drafts conflict (including career-return-only framing or identity-network framing), this ADR takes precedence for product identity. Implementation details in older specs remain valid unless they contradict this direction.

## Product statement

> **SkillsPhase is a jobs platform that modernises the application process by replacing the traditional CV with an evidence-based SkillsPhase profile.**

SkillsPhase is still a jobs platform, like Indeed or Reed.

People visit primarily to **search for jobs** or **recruit candidates**.

The innovation is **not** replacing the job board.  
The innovation is **replacing the traditional CV**.

## What this is not

- Not a better LinkedIn
- Not a social network
- Not a standalone portfolio website
- Not “GitHub for everyone”
- Not an IT-only platform

The profile is not the product by itself. The profile exists because it **becomes the application**. Without jobs, there is little reason to create a SkillsPhase profile.

## Familiar recruitment journey

The hiring flow should still feel familiar:

1. Search jobs  
2. Read the job description  
3. Apply  
4. Employer reviews the application  
5. Interview  

The difference: candidates apply with a **SkillsPhase profile** focused on capabilities supported by evidence, instead of uploading a traditional CV.

## Homepage implication

The homepage should feel like a **jobs platform**, not a social network or portfolio site.

Lead message direction:

> Apply for jobs with proof, not just a CV.

Then explain that SkillsPhase replaces the traditional CV with an evidence-based profile that helps employers understand what candidates can do.

## Profile design principles

### 1. Capability before job title

Profiles should not introduce someone primarily by job title. Lead with what they help people achieve.

Examples:

| Profession | Capability lead |
|------------|-----------------|
| Teacher | Helps GCSE students improve confidence and exam performance. |
| Graphic designer | Creates memorable brands that help businesses stand out. |
| Electrician | Installs and maintains safe commercial electrical systems. |
| Software engineer | Builds reliable platforms that help engineering teams deliver software faster. |

Wording changes by profession; the principle does not.

**Guided drafting:** Do not present a blank “About” / capability field and expect candidates to invent effective wording. Guide them through simple questions (who they help, what they help achieve, how) and generate an editable first draft. This reduces writer’s block, keeps profiles consistent, and reinforces capability-over-job-description messaging.

### 2. Profession-agnostic by design

The platform must feel equally natural for teachers, nurses, accountants, electricians, chefs, designers, project managers, marketers, software engineers, tradespeople, and anyone with professional skills.

If a feature only makes sense for developers, it is the wrong abstraction. Demo data must not imply an IT-only product.

### 3. Evidence means proof of capability

Evidence is not “software projects.” It is anything that demonstrates capability.

| Profession | Example evidence |
|------------|------------------|
| Teacher | Lesson plans, classroom resources, teaching videos, student outcomes, parent testimonials |
| Graphic designer | Portfolio, branding projects, client testimonials, live websites |
| Electrician | Completed installations, customer reviews, qualifications, before/after photos |
| Chef | Menus, food photography, customer reviews, awards |
| Software engineer | GitHub, live apps, documentation, technical case studies |

Same structure. Different artefacts.

### 4. Curate evidence, do not replace it

Most professionals already have evidence across the web. SkillsPhase organises and explains that evidence, linking to original sources where appropriate (personal sites, YouTube, GitHub, Behance, articles, company sites, testimonials).

Host inside SkillsPhase what belongs to the profile itself: capability descriptions, achievement summaries, testimonials, and similar profile-native content. Do not become another cloud storage dump.

### 5. Progressive trust

Recruitment does not happen all at once. Profiles should reflect staged disclosure.

| Stage | Employer question | What is shown / allowed |
|-------|-------------------|-------------------------|
| Public profile | “Is this someone I want to speak to?” | Capabilities, professional summary, public achievements, selected evidence, public links |
| Verified employer | Trust before deep access | Contact, save profiles, request additional information / references / qualifications — without automatically exposing private documents |
| After mutual interest | Deeper diligence | CV, certificates, references, qualification documents, other supporting evidence — on request |

Public copy may state that items exist without revealing them, e.g. “DBS Check — Available upon request.”

Companies House + company email verification remain a core trust mechanism for employers.

### 6. Sections answer employer questions

Organise profiles around employer questions, not CV chronology:

1. What can this person do?  
2. What evidence supports that?  
3. What impact have they had?  
4. Can I trust them?  
5. Should I contact them?

## Design test

When evaluating copy, UI, demos, or features, ask:

1. Does this still feel like a jobs platform?  
2. Does the profile clearly replace the CV in the application?  
3. Would this feel natural for a teacher or electrician, not only a software engineer?  
4. Does public content answer “should I speak to this person?” without oversharing?

If the answer to any is no, redesign before shipping.

## Consequences

- Homepage messaging leads with jobs + proof-based applications.  
- Profile UX and demo data stay profession-agnostic.  
- Job search / apply / review remains the primary journey; the evidence profile is the application artefact.  
- CV upload may still exist as supporting material requested later; it is not the primary application signal.  
- Applications store a profile snapshot at apply time; documents are progressive, not required upfront.  
- Older docs that centre CV-first apply flows should be updated over time to match this ADR.
