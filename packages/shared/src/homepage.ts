/** Homepage section template — editable from admin when DB is configured. */

export const HOMEPAGE_SECTION_TYPES = [
  "hero",
  "trust",
  "career_journeys",
  "how_it_works",
  "product_showcase",
  "comparison",
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
  career_journeys: "Career journeys",
  how_it_works: "How it works",
  product_showcase: "Product showcase",
  comparison: "CV comparison",
  differentiators: "Benefits",
  businesses_cta: "Business call-to-action",
  stats: "Platform statistics",
  featured_candidates: "SkillsProfile anatomy",
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
  "differentiators",
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
      titleAccent: "Because life happens",
      body: "You shouldn't have to hide your experience or apologise for your journey. Every skill you've gained is valuable. Showcase it with pride.",
      primaryCtaLabel: "Create your Skill Profile",
      primaryCtaHref: "/register?as=candidate",
      secondaryCtaLabel: "Discover talent",
      secondaryCtaHref: "/discover-talent",
    }),
    section(
      "trust",
      15,
      {
        items: [
          "Jobs you can apply for",
          "Evidence-based profiles",
          "Verified UK businesses",
          "Free for candidates",
        ],
      },
      false,
    ),
    section("featured_candidates", 20, {
      title: "Your application, rebuilt around proof",
      subtitle:
        "Instead of a CV timeline, employers see what you can do—supported by evidence that works for any profession.",
      callouts: [
        {
          label: "Capabilities",
          detail: "What you help people achieve—not just a job title",
        },
        {
          label: "Evidence",
          detail: "Proof that demonstrates capability, linked to real sources",
        },
        {
          label: "Impact",
          detail: "Outcomes you have delivered, in plain language",
        },
        {
          label: "Skills",
          detail: "Searchable abilities employers can filter by",
        },
        {
          label: "Trust signals",
          detail: "Qualifications and checks available upon request",
        },
        {
          label: "Availability",
          detail: "Ready to apply or start—without burying the signal",
        },
      ],
      primaryCtaLabel: "Create your SkillsPhase profile",
      primaryCtaHref: "/register?as=candidate",
    }),
    section("career_journeys", 30, {
      title: "Real careers aren't linear.",
      subtitle:
        "Evidence-based applications work whether skills came from employment, training, caring, or building something yourself.",
      items: [
        { title: "Career Change" },
        { title: "Career Break" },
        { title: "Illness & Recovery" },
        { title: "Caring Responsibilities" },
        { title: "Self-Taught Learning" },
        { title: "Certifications" },
        { title: "Side Projects" },
        { title: "Freelancing" },
        { title: "Small Business" },
        { title: "Volunteering" },
        { title: "Returning to Work" },
        { title: "Redundancy" },
        { title: "Military Service" },
        { title: "Community Projects" },
      ],
      body: "Traditional CVs see gaps. SkillsPhase sees capability.",
    }),
    section("how_it_works", 40, {
      title: "How it works",
      steps: [
        {
          title: "Build your profile",
          body: "Capabilities and evidence—ready to use as your application.",
        },
        {
          title: "Find and apply",
          body: "Search jobs, read the description, apply with your SkillsPhase profile.",
        },
        {
          title: "Employers review proof",
          body: "They see what you can do first—then request more if needed.",
        },
      ],
    }),
    section("product_showcase", 50, {
      title: "Recruit by capability, not keyword bingo",
      subtitle:
        "Browse candidates across professions—teachers, trades, designers, nurses, engineers—and shortlist on evidence.",
      primaryCtaLabel: "Browse candidates",
      primaryCtaHref: "/discover-talent",
    }),
    section("comparison", 60, {
      title: "A better application than a CV",
      traditionalTitle: "Traditional CV",
      traditionalItems: [
        "Job titles first",
        "Employment dates and gaps",
        "Claims without proof",
        "One-page document dump",
      ],
      skillsphaseTitle: "SkillsPhase profile",
      skillsphaseItems: [
        "Capabilities first",
        "Evidence of what you can do",
        "Impact and outcomes",
        "Progressive trust",
        "Works for every profession",
        "Becomes the application",
      ],
    }),
    section(
      "differentiators",
      70,
      {
        title: "Why teams use SkillsPhase",
        items: [
          {
            title: "Familiar hiring journey",
            body: "Search, apply, review, interview—modernised at the application.",
          },
          {
            title: "Proof over timelines",
            body: "Evidence of capability beats keyword-stuffed CVs.",
          },
          {
            title: "Verified businesses",
            body: "Only verified UK businesses can make contact.",
          },
          {
            title: "Every profession",
            body: "The same profile structure works from teaching to trades.",
          },
        ],
      },
      false,
    ),
    section(
      "businesses_cta",
      80,
      {
        title: "Hire for what people can do.",
        body: "Post roles, review evidence-based applications, and contact candidates directly.",
        ctaLabel: "Register as a business",
        ctaHref: "/register?as=business",
      },
      false,
    ),
    section(
      "stats",
      85,
      {
        title: "Platform at a glance",
        subtitle: "Live metrics when we have enough activity to share.",
        items: [
          { value: "—", label: "Open roles" },
          { value: "—", label: "SkillsPhase profiles" },
          { value: "—", label: "Verified businesses" },
          { value: "—", label: "Applications with proof" },
        ],
        footnote:
          "Enable this section from admin when you have real numbers to show.",
      },
      false,
    ),
    section(
      "testimonials",
      88,
      {
        title: "What people are saying",
        subtitle:
          "Add real quotes from candidates and businesses when you have them.",
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
      title: "Apply for jobs with proof, not just a CV.",
      titleAccent: "not just a CV.",
      body: "Create a SkillsPhase profile once—then use it to apply.",
      primaryCtaLabel: "Create your SkillsPhase profile",
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
            q: "What is SkillsPhase?",
            a: "A jobs platform that modernises applications by replacing the traditional CV with an evidence-based SkillsPhase profile.",
          },
          {
            q: "Who is SkillsPhase for?",
            a: "Anyone looking for work or hiring—across teaching, healthcare, trades, design, hospitality, professional services, engineering, and more.",
          },
          {
            q: "Is it free for candidates?",
            a: "Yes. Creating a SkillsPhase profile and applying for jobs is free.",
          },
          {
            q: "Do I need a CV?",
            a: "You apply with your SkillsPhase profile. Supporting documents such as a CV, certificates, or references can be shared later when an employer requests them.",
          },
          {
            q: "How do businesses find candidates?",
            a: "Verified businesses browse profiles by capability and evidence, then contact candidates or review applications directly.",
          },
          {
            q: "Who can register as a business?",
            a: "Any UK company verified against Companies House with a confirmed company email.",
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
        "SkillsPhase is a jobs platform that replaces the traditional CV with an evidence-based profile.",
      copyright: "© {year} SkillsPhase. UK only for business registration.",
      columns: [
        {
          title: "FOR CANDIDATES",
          links: [
            {
              label: "Create your SkillsPhase profile",
              href: "/register?as=candidate",
            },
            { label: "Browse jobs", href: "/jobs" },
            { label: "About", href: "/about" },
          ],
        },
        {
          title: "FOR BUSINESSES",
          links: [
            { label: "Post jobs", href: "/register?as=business" },
            { label: "Browse candidates", href: "/discover-talent" },
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
