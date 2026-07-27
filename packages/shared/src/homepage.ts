/** Homepage section template — editable from admin when DB is configured. */

export const HOMEPAGE_SECTION_TYPES = [
  "hero",
  "trust",
  "how_it_works",
  "differentiators",
  "businesses_cta",
  "stats",
  "featured_candidates",
  "testimonials",
  "closing_cta",
  "faq",
] as const;

export type HomepageSectionType = (typeof HOMEPAGE_SECTION_TYPES)[number];

export const HOMEPAGE_SECTION_LABELS: Record<HomepageSectionType, string> = {
  hero: "Hero",
  trust: "Trust signals",
  how_it_works: "How it works",
  differentiators: "What makes us different",
  businesses_cta: "Business call-to-action",
  stats: "Platform statistics",
  featured_candidates: "Featured skill profiles",
  testimonials: "Testimonials",
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
      eyebrow: "Skills-first hiring · UK",
      title: "Skills first. Because life happens.",
      body: "People should be hired for what they can do today — not for whether their career ran in a straight line. Build a profile around skills, experience, and real evidence of your work, so employers see ability first.",
      primaryCtaLabel: "Create your Skill Profile",
      primaryCtaHref: "/register?as=candidate",
      secondaryCtaLabel: "Discover talent",
      secondaryCtaHref: "/discover-talent",
    }),
    section("trust", 20, {
      items: [
        "Skills-first profiles",
        "Career gaps welcome",
        "Verified UK businesses",
        "Free for candidates",
      ],
    }),
    section("how_it_works", 30, {
      title: "How it works",
      subtitle: "Three simple steps from profile to conversation.",
      steps: [
        {
          title: "Build a skills-first profile",
          body: "Add your skills, experience, certifications, and projects — with real portfolio evidence, not a generic personal statement.",
        },
        {
          title: "Get discovered",
          body: "Verified businesses browse skill-based profiles and open full details for people who match what they need.",
        },
        {
          title: "Get contacted directly",
          body: "There’s no automatic matching. A business reaches out when your skills fit, and you reply when you’re ready.",
        },
      ],
    }),
    section("differentiators", 40, {
      title: "What makes SkillsPhase different",
      subtitle: "A hiring platform built around skills and evidence.",
      items: [
        {
          title: "Skills come first",
          body: "Employers see what you can do today. Career breaks for parenting, caring, illness, study, or a change of direction are a normal part of life — they don’t define your ability.",
        },
        {
          title: "Proof over platitudes",
          body: "Your profile leads with projects, certifications, and real work — not phrases like “motivated team player with excellent communication skills.”",
        },
        {
          title: "Direct discovery for businesses",
          body: "Browse skill profiles, filter by capability, and contact people who fit — without sorting through cover letters.",
        },
        {
          title: "Verified UK businesses only",
          body: "Every business is checked against Companies House and activates with a verified company email before contacting candidates.",
        },
      ],
    }),
    section("businesses_cta", 50, {
      title: "Hire for skills, not CV timelines.",
      body: "Browse skills-first profiles with real evidence, then reach out directly to people who can do the work.",
      ctaLabel: "Register as a business",
      ctaHref: "/register?as=business",
    }),
    section("stats", 60, {
      title: "Growing with candidates and businesses",
      subtitle: "Figures update as SkillsPhase grows.",
      footnote: "*Placeholder social proof until live metrics are ready.",
      items: [
        { value: "8k+", label: "Skill profiles created" },
        { value: "320+", label: "Verified UK businesses" },
        { value: "1.9k", label: "Portfolio projects shared" },
        { value: "92%", label: "Would recommend us*" },
      ],
    }),
    section("featured_candidates", 70, {
      title: "Example skill profiles",
      subtitle: "Real candidates appear once people join SkillsPhase.",
      demoCards: [
        {
          title: "Senior React Developer",
          skills: ["React", "TypeScript", "Node.js", "AWS"],
          yearsExperience: 8,
          topProject: "Built SaaS platforms for two Series B startups",
          availability: "immediate",
        },
        {
          title: "Brand & Marketing Lead",
          skills: ["Marketing", "Content Strategy", "SEO", "Figma"],
          yearsExperience: 5,
          topProject: "Grew organic traffic 4x for a D2C retailer",
          availability: "within_one_month",
        },
        {
          title: "Full-Stack Product Designer",
          skills: ["Figma", "Design Systems", "React", "User Research"],
          yearsExperience: 6,
          topProject: "Designed and shipped a fintech mobile app",
          availability: "freelance",
        },
      ],
    }),
    section("testimonials", 80, {
      title: "What people are saying",
      subtitle: "From candidates and hiring teams who put skills first.",
      items: [
        {
          quote:
            "I took three years out to care for family. SkillsPhase let my projects and certifications lead — not the gap on my timeline.",
          name: "Amira K.",
          role: "Candidate · Product Designer",
        },
        {
          quote:
            "We stopped obsessing over uninterrupted employment history and started hiring on demonstrated skills. It changed who we found.",
          name: "James O.",
          role: "Hiring manager · Cedar Health",
        },
        {
          quote:
            "My portfolio said more in five minutes than my old CV ever did. Judged on ability, not on how I explained my career break.",
          name: "Priya S.",
          role: "Candidate · Marketing",
        },
      ],
    }),
    section("closing_cta", 90, {
      title: "Skills first. Because life happens.",
      body: "Whether you’re showcasing what you can do, or looking for people who can do it — start with skills and evidence.",
      primaryCtaLabel: "Create your Skill Profile",
      primaryCtaHref: "/register?as=candidate",
      secondaryCtaLabel: "Register as a business",
      secondaryCtaHref: "/register?as=business",
    }),
    section("faq", 100, {
      title: "Frequently asked questions",
      subtitle: "Quick answers for candidates and businesses.",
      items: [
        {
          q: "Is SkillsPhase only for people with career gaps?",
          a: "No. Anyone can build a skills-first profile. Focusing on skills and evidence simply means a gap in your timeline won’t count against you the way it might on a traditional CV.",
        },
        {
          q: "Is it free for candidates?",
          a: "Yes. Creating a Skill Profile, adding portfolio evidence, and being discovered by businesses is free.",
        },
        {
          q: "Do I need a CV?",
          a: "No. Your skills-first profile — skills, qualifications, experience, certifications, and projects — stands in for a traditional CV.",
        },
        {
          q: "How do businesses find me?",
          a: "Verified businesses browse and filter by skills. When your profile fits what they need, they can open your full details and contact you directly.",
        },
        {
          q: "Who can register as a business?",
          a: "Any UK company verified against Companies House with a confirmed company email address.",
        },
        {
          q: "Is this only for the UK?",
          a: "Business registration is UK-only today. Non-UK organisations can join the waitlist.",
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
