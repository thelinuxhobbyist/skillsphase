/** Homepage section template — editable from admin when DB is configured. */

import { HOMEPAGE_DEMO_JOBS } from "./demo-jobs";

export const HOMEPAGE_SECTION_TYPES = [
  "hero",
  "trust",
  "story",
  "how_it_works",
  "differentiators",
  "employers_cta",
  "stats",
  "logos",
  "testimonials",
  "success_stories",
  "featured_jobs",
  "closing_cta",
  "faq",
] as const;

export type HomepageSectionType = (typeof HOMEPAGE_SECTION_TYPES)[number];

export const HOMEPAGE_SECTION_LABELS: Record<HomepageSectionType, string> = {
  hero: "Hero",
  trust: "Trust signals",
  story: "Story / mission",
  how_it_works: "How it works",
  differentiators: "What makes us different",
  employers_cta: "Employer call-to-action",
  stats: "Platform statistics",
  logos: "Employer logos",
  testimonials: "Testimonials",
  success_stories: "Success stories",
  featured_jobs: "Featured jobs + search",
  closing_cta: "Closing call-to-action",
  faq: "FAQ",
};

export type HomepageSection = {
  id: string;
  type: HomepageSectionType;
  enabled: boolean;
  sortOrder: number;
  label: string;
  content: Record<string, unknown>;
};

function section(
  type: HomepageSectionType,
  sortOrder: number,
  content: Record<string, unknown>,
): HomepageSection {
  return {
    id: `default-${type}`,
    type,
    enabled: true,
    sortOrder,
    label: HOMEPAGE_SECTION_LABELS[type],
    content,
  };
}

/** Canonical default homepage template (used until admin saves overrides). */
export function getDefaultHomepageSections(): HomepageSection[] {
  return [
    section("hero", 10, {
      eyebrow: "Career Return Platform",
      title: "Project Horizon",
      body: "A career break doesn't erase your experience. Restart, return, and move forward with employers who hire the whole human — not just the uninterrupted timeline.",
      primaryCtaLabel: "Register as a returner",
      primaryCtaHref: "/register?as=seeker",
      secondaryCtaLabel: "Register as an employer",
      secondaryCtaHref: "/register?as=employer",
    }),
    section("trust", 20, {
      items: [
        "Verified employers",
        "Secure applications",
        "Free for returners",
        "UK focused",
      ],
    }),
    section("story", 30, {
      title: "Your pause wasn't a detour from your career — it was part of it.",
      body: "Millions of talented people step away to raise families, care for loved ones, recover, relocate, or simply breathe. Too many job sites treat that chapter as a flaw. We built this platform so returning feels obvious: your skills still count, your story still matters, and the right employers are already looking for people like you.",
    }),
    section("how_it_works", 40, {
      title: "How it works",
      subtitle: "Three calm steps — no pressure to move faster than you're ready.",
      steps: [
        {
          title: "Tell your story once",
          body: "Build a profile that includes skills, experience, and space for your career-gap narrative — on your terms.",
        },
        {
          title: "Apply to verified employers",
          body: "Every listing comes from a UK organisation that has passed verification. Your CV is snapshotted at apply time.",
        },
        {
          title: "Track progress calmly",
          body: "Follow each application from applied through interview, offer, or hire — without guessing where you stand.",
        },
      ],
    }),
    section("differentiators", 50, {
      title: "What makes us different",
      subtitle:
        "Not another generic job board — a return-to-work platform built around how careers actually unfold.",
      items: [
        {
          title: "Skills and experience over career gaps",
          body: "We designed profiles so your real capability shows first — not an unbroken calendar of employment.",
        },
        {
          title: "Built specifically for people returning to work",
          body: "Every flow assumes a career break is normal: narrative space, gap-friendly employers, and hiring that respects your pace.",
        },
        {
          title: "Direct applications to verified employers",
          body: "Apply once with a snapshotted CV. You're speaking to organisations that have passed UK verification — not an anonymous marketplace.",
        },
        {
          title: "Employers actively looking for returners",
          body: "Companies join because they want depth, loyalty, and perspective — not because they need another generic job board.",
        },
      ],
    }),
    section("employers_cta", 60, {
      title: "Untapped talent is still talent.",
      body: "Hire people with real depth: former team leads returning after parental leave, analysts who stepped away to care for family, specialists restarting after relocation or recovery. They bring commercial judgement, calm under pressure, and loyalty that short-tenure markets rarely deliver — without you competing for the same overcrowded shortlists.",
      ctaLabel: "Register as an employer",
      ctaHref: "/register?as=employer",
    }),
    section("stats", 70, {
      title: "Growing with returners and employers",
      subtitle: "Sample figures for layout — replace with live metrics when ready.",
      footnote: "*Placeholder social proof until real data is available.",
      items: [
        { value: "12k+", label: "Returners ready to join" },
        { value: "480+", label: "Verified UK employers" },
        { value: "3.2k", label: "Applications this quarter" },
        { value: "94%", label: "Would recommend us*" },
      ],
    }),
    section("logos", 80, {
      title: "Employers welcoming returners",
      subtitle: "Logo placeholders — swap in partner marks when confirmed.",
      items: [
        "Northbridge",
        "Cedar Health",
        "Brightpath",
        "Harbour Legal",
        "Greenfield Foods",
        "Atlas Logistics",
      ],
    }),
    section("testimonials", 90, {
      title: "Voices from the community",
      subtitle: "Example quotes for layout — replace with consented testimonials.",
      items: [
        {
          quote:
            "I worried a four-year break would define me. Here, employers asked about my skills first — the gap was just context.",
          name: "Amira K.",
          role: "Returner · Operations",
        },
        {
          quote:
            "We hired two returners in a month. The quality of experience was outstanding — exactly the maturity we'd been missing.",
          name: "James O.",
          role: "Hiring manager · Cedar Health",
        },
        {
          quote:
            "Registering took minutes, and tracking applications felt calm. No pressure to pretend my timeline was perfect.",
          name: "Priya S.",
          role: "Returner · Finance",
        },
      ],
    }),
    section("success_stories", 100, {
      title: "Success stories",
      subtitle: "Illustrative stories for structure — publish real ones when ready.",
      items: [
        {
          title: "From carer to team lead in six months",
          body: "After supporting a parent full-time, Sam returned via a hybrid ops role with a company that treated caring experience as leadership practice.",
        },
        {
          title: "Parental leave → finance business partner",
          body: "Elena restarted with a part-time FBP role, then moved full-time when ready — without hiding the break on her CV.",
        },
      ],
    }),
    section("featured_jobs", 110, {
      title: "Featured jobs",
      subtitleLive: "Roles from verified UK employers welcoming career returners.",
      subtitleDemo:
        "Example roles so you can see how listings will look — live vacancies appear here once employers publish.",
      showSearch: true,
      demoJobs: HOMEPAGE_DEMO_JOBS.map(
        ({ slug, title, companyName, location, remoteType, blurb }) => ({
          slug,
          title,
          companyName,
          location,
          remoteType,
          blurb,
        }),
      ),
    }),
    section("closing_cta", 120, {
      title: "A better way back into work.",
      body: "Whatever your story, your next chapter starts here. It's free to join, and there's no pressure to move at anyone's pace but your own.",
      primaryCtaLabel: "Register as a returner",
      primaryCtaHref: "/register?as=seeker",
      secondaryCtaLabel: "Register as an employer",
      secondaryCtaHref: "/register?as=employer",
    }),
    section("faq", 130, {
      title: "Frequently asked questions",
      subtitle: "Quick answers for returners and employers.",
      items: [
        {
          q: "Is it free for people returning to work?",
          a: "Yes. Creating a profile, browsing jobs, and applying is free for returners.",
        },
        {
          q: "Will employers see my career break?",
          a: "You control how you tell your story. Profiles invite a career-gap narrative so the break is context, not a red flag.",
        },
        {
          q: "Who can post jobs?",
          a: "Only verified UK employers. Companies are checked against Companies House and approved before they can publish roles.",
        },
        {
          q: "I'm an employer — what kind of candidates will I find?",
          a: "Experienced professionals returning after parental leave, caring responsibilities, health recovery, relocation, or a planned pause — people with proven skills and renewed commitment.",
        },
        {
          q: "Do I have to apply immediately after registering?",
          a: "No. Join at your own pace. Complete your profile when you're ready and apply only when a role feels right.",
        },
        {
          q: "Is this only for the UK?",
          a: "Employer registration is UK-only today. Non-UK organisations can join the waitlist.",
        },
      ],
    }),
  ];
}

export function defaultContentForType(
  type: HomepageSectionType,
): Record<string, unknown> {
  const found = getDefaultHomepageSections().find((s) => s.type === type);
  return found ? structuredClone(found.content) : {};
}
