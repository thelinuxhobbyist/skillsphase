export type JobListingSkill = {
  name: string;
  level: "essential" | "nice_to_have";
};

/**
 * Example / full listing content.
 * Optional narrative fields mirror what an employer can provide on a polished post.
 */
export type JobListingContent = {
  slug: string;
  title: string;
  companyName: string;
  location: string;
  remoteType: "on_site" | "hybrid" | "remote";
  employmentType: string;
  industry: string;
  companySize: string;
  companyAbout: string;
  salaryLabel: string;
  postedLabel: string;
  /** Short card summary for the homepage featured list. */
  blurb: string;
  skills: JobListingSkill[];
  /** Full job description. */
  description: string;
  benefits: string[];
  whyReturners: string[];
  applicationProcess: string[];
  /** Extra location / hybrid / hours detail. */
  workingPatternDetail: string;
  /** Permanent / fixed-term, hours, etc. */
  contractDetails: string;
};

/** Example listings shown on the homepage until real jobs are published. */
export const HOMEPAGE_DEMO_JOBS: JobListingContent[] = [
  {
    slug: "operations-manager-hybrid",
    title: "Operations Manager",
    companyName: "Northbridge Retail Group",
    location: "Manchester",
    remoteType: "hybrid",
    employmentType: "Full-time",
    industry: "Retail",
    companySize: "500–1,000 employees",
    companyAbout:
      "Northbridge Retail Group operates multi-site retail brands across the North of England. We invest in managers who can coach teams, calm chaos, and keep customer experience consistent — including people returning after a career break.",
    salaryLabel: "£42,000 – £48,000",
    postedLabel: "Posted recently",
    blurb:
      "Skills-first role: lead regional ops with people leadership and planning ability — career breaks welcome.",
    skills: [
      { name: "People leadership", level: "essential" },
      { name: "Operational planning", level: "essential" },
      { name: "Stakeholder communication", level: "essential" },
      { name: "Process improvement", level: "essential" },
      { name: "Retail or multi-site ops", level: "nice_to_have" },
      { name: "Change management", level: "nice_to_have" },
    ],
    description: `You will lead a regional retail operations team across Greater Manchester. The focus is coaching store and area managers, keeping service and stock standards consistent, and improving how work gets done day to day.

Typical responsibilities
• Guide and develop store and area managers through regular one-to-ones and on-the-floor coaching
• Own weekly ops rhythms for stock accuracy, labour planning, and customer service standards
• Partner with HR and finance on return-to-work friendly scheduling and seasonal peaks
• Identify process improvements that reduce friction for customers and frontline teams
• Report progress clearly to senior leadership without drowning people in jargon

You will work closely with area managers, HR business partners, and the regional leadership team. Success in the first six months looks like steadier store performance, managers who feel supported, and a few practical process changes that stick — with a clear positive impact on customer experience across the region.`,
    benefits: [
      "Hybrid working with a Manchester base",
      "Flexible patterns discussed at interview",
      "Training and leadership development budget",
      "Enhanced parental and carers leave",
      "Pension contribution",
      "Employee discount across Northbridge brands",
      "Employee wellbeing support",
    ],
    whyReturners: [
      "Career breaks are welcomed and never treated as a red flag",
      "Structured onboarding with a buddy in the first month",
      "Phased return options available if you need to ease back in",
      "Hybrid pattern with predictable office and travel days",
      "Leadership training and coaching support after you join",
    ],
    applicationProcess: [
      "Submit your application via Project Horizon",
      "Skills review against the essential abilities listed above",
      "Conversation with the hiring manager (video or in person)",
      "Decision within two weeks of interview",
    ],
    workingPatternDetail:
      "Hybrid — typically 2–3 days in the Manchester office or on regional visits, with the remainder remote. Flexible start/finish times within core hours (10:00–16:00) are available.",
    contractDetails: "Permanent · Full-time · 37.5 hours per week",
  },
  {
    slug: "finance-business-partner",
    title: "Finance Business Partner",
    companyName: "Cedar Health Ltd",
    location: "Leeds",
    remoteType: "hybrid",
    employmentType: "Full-time",
    industry: "Health & care",
    companySize: "250–500 employees",
    companyAbout:
      "Cedar Health supports clinical and operational teams with the finance insight they need to run safe, sustainable services. We value clear storytelling as much as accurate numbers.",
    salaryLabel: "£45,000 – £55,000",
    postedLabel: "Posted recently",
    blurb:
      "Skills-first FBP role: budgeting, forecasting, and clear insight for clinical leads — returners encouraged.",
    skills: [
      { name: "Management accounting", level: "essential" },
      { name: "Budgeting & forecasting", level: "essential" },
      { name: "Financial storytelling", level: "essential" },
      { name: "Stakeholder partnership", level: "essential" },
      { name: "Excel / financial modelling", level: "nice_to_have" },
      { name: "Healthcare or public-sector finance", level: "nice_to_have" },
    ],
    description: `You will partner with clinical and operational leads on budgets, forecasts, and decision-ready insight.

Typical responsibilities
• Build and challenge departmental budgets and rolling forecasts
• Present clear variance analysis to non-finance stakeholders
• Support business cases for new services and staffing models
• Help design finance onboarding for colleagues returning from leave
• Improve reporting so leaders get signal, not noise

You will work day to day with service leads, the finance controller, and HR partners. Success looks like trusted forecasts, clearer conversations about cost and value, and finance that helps clinical teams deliver — not paperwork that gets in the way.

We care that you can do the work. Qualification pathways (ACA / ACCA / CIMA or equivalent experience) are welcome; an unbroken post-qualification timeline is not required.`,
    benefits: [
      "Hybrid working — Leeds",
      "Part-time or phased return options",
      "Study / CPD support",
      "Enhanced parental leave",
      "Pension contribution",
      "Wellbeing allowance",
      "Flexible hours within core business hours",
    ],
    whyReturners: [
      "Parental leave and other career breaks are expected and respected",
      "Structured finance onboarding and shadowing",
      "Phased return and part-time pathways available",
      "Hybrid Leeds pattern with flexible core hours",
      "CPD and qualification support after you start",
    ],
    applicationProcess: [
      "Apply through Project Horizon with your profile",
      "Skills screen against essential abilities",
      "Hiring manager interview plus a short practical case discussion",
      "Offer decision typically within 10 working days",
    ],
    workingPatternDetail:
      "Hybrid — usually 2 days per week in the Leeds office, 3 days remote. Flexible hours within 08:00–18:00 are supported where the role allows.",
    contractDetails: "Permanent · Full-time · 37.5 hours per week (part-time considered)",
  },
  {
    slug: "customer-success-lead",
    title: "Customer Success Lead",
    companyName: "Brightpath Software",
    location: "Remote (UK)",
    remoteType: "remote",
    employmentType: "Full-time",
    industry: "Software / SaaS",
    companySize: "50–150 employees",
    companyAbout:
      "Brightpath builds B2B software that helps teams adopt tools without overwhelm. Customer Success sits at the centre of how we grow — through relationships, clarity, and follow-through.",
    salaryLabel: "£40,000 – £50,000",
    postedLabel: "Posted recently",
    blurb:
      "Skills-first CS lead: communication, onboarding, and account health — sector knowledge valued over continuous timelines.",
    skills: [
      { name: "Customer relationship management", level: "essential" },
      { name: "Written & verbal communication", level: "essential" },
      { name: "Account health monitoring", level: "essential" },
      { name: "Onboarding & adoption", level: "essential" },
      { name: "Cross-functional collaboration", level: "nice_to_have" },
      { name: "SaaS or B2B experience", level: "nice_to_have" },
    ],
    description: `You will guide a portfolio of mid-market B2B customers from onboarding through renewal, with a focus on clear communication and long-term outcomes.

Typical responsibilities
• Own onboarding and adoption for your account portfolio
• Run health checks and QBRs that surface risk early
• Close the loop with product and support on customer feedback
• Mentor junior CS colleagues and help document playbooks
• Protect renewal outcomes without losing the human relationship

You will collaborate with Product, Support, and Sales, and report into the Head of Customer Success. Success means healthy accounts, confident customers, and playbooks that help the wider team scale — with empathy and communication valued more than an unbroken CV timeline.`,
    benefits: [
      "Fully remote (UK)",
      "Flexible hours within UK working days",
      "Learning stipend",
      "Enhanced leave",
      "Pension contribution",
      "Home-office setup budget",
      "Employee wellbeing support",
    ],
    whyReturners: [
      "Career returners are welcome — gaps for caring, health, or parental leave are context, not filters",
      "Documented onboarding and CS playbooks",
      "Buddy support in your first 30 days",
      "Remote-first with flexible core hours",
      "Training budget for tools and facilitation skills",
    ],
    applicationProcess: [
      "Apply on Project Horizon",
      "Skills match review",
      "Hiring manager conversation",
      "Short written exercise reflecting a customer scenario",
      "Decision within two weeks",
    ],
    workingPatternDetail:
      "Fully remote across the UK. Flexible hours within the working day; team overlap expected between 10:00–15:00 UK time. Occasional optional meet-ups in London or Manchester.",
    contractDetails: "Permanent · Full-time · 37.5 hours per week",
  },
];

export function findHomepageDemoJob(slug: string): JobListingContent | undefined {
  return HOMEPAGE_DEMO_JOBS.find((job) => job.slug === slug);
}

export function similarHomepageDemoJobs(
  slug: string,
  limit = 3,
): JobListingContent[] {
  return HOMEPAGE_DEMO_JOBS.filter((job) => job.slug !== slug).slice(0, limit);
}
