export type HomepageDemoJob = {
  slug: string;
  title: string;
  companyName: string;
  location: string;
  remoteType: "on_site" | "hybrid" | "remote";
  employmentType: string;
  blurb: string;
  /** Required abilities shown first on the listing. */
  skills: string[];
  description: string;
};

/** Example listings shown on the homepage until real jobs are published. */
export const HOMEPAGE_DEMO_JOBS: HomepageDemoJob[] = [
  {
    slug: "operations-manager-hybrid",
    title: "Operations Manager — hybrid",
    companyName: "Northbridge Retail Group",
    location: "Manchester",
    remoteType: "hybrid",
    employmentType: "Full-time",
    skills: [
      "People leadership",
      "Operational planning",
      "Stakeholder communication",
      "Process improvement",
      "Retail or multi-site ops",
    ],
    blurb:
      "Skills-first role: lead regional ops with people leadership and planning ability — career breaks welcome.",
    description: `About the role

Lead a regional retail operations team across Greater Manchester. Coach store leaders, keep service standards consistent, and improve how work gets done day to day.

This is an example listing so you can see how Project Horizon presents roles. It is not a live vacancy.

We hire for skills first. Tell us what you can do — a career break for caring, parental leave, or health is context, not a disqualification.

Day-to-day
• Guide and develop store and area managers
• Run weekly ops rhythms for stock, labour, and service
• Improve processes that reduce friction for customers and teams

Location & hours
Hybrid — Manchester base with regional travel. Full-time; flexible patterns discussed at interview.`,
  },
  {
    slug: "finance-business-partner",
    title: "Finance Business Partner",
    companyName: "Cedar Health Ltd",
    location: "Leeds",
    remoteType: "hybrid",
    employmentType: "Full-time",
    skills: [
      "Management accounting",
      "Budgeting & forecasting",
      "Financial storytelling",
      "Stakeholder partnership",
      "Excel / financial modelling",
    ],
    blurb:
      "Skills-first FBP role: budgeting, forecasting, and clear insight for clinical leads — returners encouraged.",
    description: `About the role

Partner with clinical and operational leads on budgets, forecasts, and decision-ready insight.

This is an example listing for Project Horizon — not a live vacancy.

We lead with required skills, not years in post or unbroken timelines. Parental leave and other career breaks are expected and respected.

Day-to-day
• Build and challenge departmental budgets and forecasts
• Explain variance clearly to non-finance stakeholders
• Support business cases for services and staffing

Location & hours
Hybrid — Leeds. Full-time with part-time or phased return options available.`,
  },
  {
    slug: "customer-success-lead",
    title: "Customer Success Lead",
    companyName: "Brightpath Software",
    location: "Remote (UK)",
    remoteType: "remote",
    employmentType: "Full-time",
    skills: [
      "Customer relationship management",
      "Written & verbal communication",
      "Account health monitoring",
      "Onboarding & adoption",
      "Cross-functional collaboration",
    ],
    blurb:
      "Skills-first CS lead: communication, onboarding, and account health — sector knowledge valued over continuous timelines.",
    description: `About the role

Guide B2B customers from onboarding through renewal, with a focus on clear communication and long-term outcomes.

This is an example listing for Project Horizon — not a live vacancy.

Required skills come first. Empathy and sector knowledge matter more than an unbroken CV.

Day-to-day
• Own a portfolio of mid-market accounts through onboarding and adoption
• Run health checks that surface risk early
• Feed customer insight back to product and support

Location & hours
Remote (UK). Full-time; flexible hours within UK working days.`,
  },
];

export function findHomepageDemoJob(slug: string): HomepageDemoJob | undefined {
  return HOMEPAGE_DEMO_JOBS.find((job) => job.slug === slug);
}
