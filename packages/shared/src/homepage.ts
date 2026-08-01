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
  "footer",
] as const;

/** Section types rendered in the page body (excludes global layout sections). */
export const HOMEPAGE_BODY_SECTION_TYPES = HOMEPAGE_SECTION_TYPES.filter(
  (type) => type !== "footer",
);

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
  footer: "Footer",
};

/** Optional marketing sections — disabled by default for launch; enable from admin when ready. */
export const HOMEPAGE_OPTIONAL_SECTION_TYPES = [
  "trust",
  "businesses_cta",
  "stats",
  "testimonials",
  "faq",
] as const satisfies readonly HomepageSectionType[];

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
  enabled = true,
): HomepageSection {
  return {
    id: `default-${type}`,
    type,
    enabled,
    sortOrder,
    label: HOMEPAGE_SECTION_LABELS[type],
    content,
  };
}

export function isHomepageBodySection(type: HomepageSectionType): boolean {
  return type !== "footer";
}

export function filterHomepageBodySections(
  sections: HomepageSection[],
): HomepageSection[] {
  return sections.filter(
    (section) => section.enabled && isHomepageBodySection(section.type),
  );
}

/** Canonical default homepage template (used until admin saves overrides). */
export function getDefaultHomepageSections(): HomepageSection[] {
  return [
    section("hero", 10, {
      title: "Skills first. Because life happens.",
      body: "People should be hired for what they can do today—not whether their career followed a straight line. Build a profile around your skills, experience, certifications, and real evidence of your work.",
      primaryCtaLabel: "Create your Skill Profile",
      primaryCtaHref: "/register?as=candidate",
      secondaryCtaLabel: "Discover talent",
      secondaryCtaHref: "/discover-talent",
    }),
    section(
      "trust",
      20,
      {
        items: [
          "Skills-first profiles",
          "Evidence over timelines",
          "Verified UK businesses",
          "Free for candidates",
        ],
      },
      false,
    ),
    section("how_it_works", 30, {
      title: "Three simple steps from profile to conversation.",
      steps: [
        {
          title: "Build your skills-first profile",
          body: "Show what you can do today. Add your skills, experience, certifications, and projects, supported by real portfolio evidence instead of a generic personal statement.",
        },
        {
          title: "Get discovered",
          body: "Verified businesses search for people by skills and experience—not career timelines. When your profile fits what they're looking for, they can view your work and learn more about your capabilities.",
        },
        {
          title: "Start the conversation",
          body: "There is no automatic matching. Businesses decide who they want to contact based on your skills and evidence of your work. You choose whether to continue the conversation.",
        },
      ],
    }),
    section("differentiators", 40, {
      title: "What makes SkillsPhase different",
      subtitle: "A hiring platform built around skills and evidence.",
      items: [
        {
          title: "Skills come first",
          body: "Employers see what you can do today — skills, experience, and real evidence of your work. The path you took to get here matters less than what you can deliver now.",
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
    section(
      "businesses_cta",
      50,
      {
        title: "Hire for skills, not CV timelines.",
        body: "Browse skills-first profiles with real evidence, then reach out directly to people who can do the work.",
        ctaLabel: "Register as a business",
        ctaHref: "/register?as=business",
      },
      false,
    ),
    section(
      "stats",
      60,
      {
        title: "Platform at a glance",
        subtitle: "Live metrics when we have enough activity to share.",
        items: [
          { value: "—", label: "Skill profiles" },
          { value: "—", label: "Verified businesses" },
          { value: "—", label: "Skills listed" },
          { value: "—", label: "Direct conversations" },
        ],
        footnote: "Enable this section from admin when you have real numbers to show.",
      },
      false,
    ),
    section(
      "featured_candidates",
      70,
      {
        title: "Skill profiles",
        subtitle:
          "Discover people by skills, experience, and evidence of their work.",
      },
      true,
    ),
    section(
      "testimonials",
      80,
      {
        title: "What people are saying",
        subtitle: "Add real quotes from candidates and businesses when you have them.",
        items: [
          {
            quote:
              "Placeholder testimonial — replace with a real quote from a candidate or business.",
            name: "Name",
            role: "Role or company",
          },
        ],
      },
      false,
    ),
    section("closing_cta", 90, {
      title: "Skills first. Because life happens.",
      body: "Whether you’re showcasing what you can do, or looking for people who can do it — start with skills and evidence.",
      primaryCtaLabel: "Create your Skill Profile",
      primaryCtaHref: "/register?as=candidate",
      secondaryCtaLabel: "Register as a business",
      secondaryCtaHref: "/register?as=business",
    }),
    section(
      "faq",
      100,
      {
        title: "Frequently asked questions",
        subtitle: "Quick answers for candidates and businesses.",
        items: [
        {
          q: "Who is SkillsPhase for?",
          a: "Anyone who wants to be hired for what they can do today. Your profile leads with skills, experience, certifications, and portfolio evidence — not whether your career followed a straight line.",
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
      },
      false,
    ),
    section("footer", 110, {
      tagline:
        "Skills first. Because life happens. A skills-first hiring platform connecting verified UK businesses with capable people through skills-first profiles and portfolio evidence.",
      copyright: "© {year} SkillsPhase. UK only for business registration.",
      columns: [
        {
          title: "FOR CANDIDATES",
          links: [
            {
              label: "Create your Skill Profile",
              href: "/register?as=candidate",
            },
            { label: "About", href: "/about" },
          ],
        },
        {
          title: "FOR BUSINESSES",
          links: [
            { label: "Browse Skill Profiles", href: "/discover-talent" },
            {
              label: "Register as a business",
              href: "/register?as=business",
            },
            { label: "Non-UK waitlist", href: "/waitlist" },
            { label: "Sign in", href: "/login" },
          ],
        },
        {
          title: "LEGAL & HELP",
          links: [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms & Conditions", href: "/terms" },
            { label: "Contact", href: "/contact" },
            { label: "FAQ", href: "/#faq" },
          ],
        },
      ],
    }),
  ];
}

export function getDefaultFooterSection(): HomepageSection {
  const footer = getDefaultHomepageSections().find(
    (section) => section.type === "footer",
  );
  if (!footer) {
    throw new Error("Default footer section is missing from homepage template.");
  }
  return footer;
}

export function defaultContentForType(
  type: HomepageSectionType,
): Record<string, unknown> {
  const found = getDefaultHomepageSections().find((s) => s.type === type);
  return found ? structuredClone(found.content) : {};
}
