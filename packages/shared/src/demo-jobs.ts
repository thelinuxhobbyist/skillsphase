/** Fields that match what an employer enters when posting a job (+ homepage blurb). */
export type JobListingContent = {
  slug: string;
  title: string;
  companyName: string;
  location: string;
  remoteType: "on_site" | "hybrid" | "remote";
  employmentType: string;
  industry: string;
  salaryLabel: string;
  postedLabel: string;
  /** Short card summary for the homepage featured list. */
  blurb: string;
  skills: string[];
  /** Full job description — same field as employer "description". */
  description: string;
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
    salaryLabel: "£42,000 – £48,000",
    postedLabel: "Posted recently",
    blurb:
      "Skills-first role: lead regional ops with people leadership and planning ability — career breaks welcome.",
    skills: [
      "People leadership",
      "Operational planning",
      "Stakeholder communication",
      "Process improvement",
      "Retail or multi-site ops",
      "Change management",
    ],
    description: `You will lead a regional retail operations team across Greater Manchester. The focus is coaching store and area managers, keeping service and stock standards consistent, and improving how work gets done day to day.

Typical responsibilities
• Guide and develop store and area managers through regular one-to-ones and on-the-floor coaching
• Own weekly ops rhythms for stock accuracy, labour planning, and customer service standards
• Partner with HR and finance on return-to-work friendly scheduling and seasonal peaks
• Identify process improvements that reduce friction for customers and frontline teams
• Report progress clearly to senior leadership without drowning people in jargon

Success in the first six months looks like steadier store performance, managers who feel supported, and a few practical process changes that stick.`,
  },
  {
    slug: "finance-business-partner",
    title: "Finance Business Partner",
    companyName: "Cedar Health Ltd",
    location: "Leeds",
    remoteType: "hybrid",
    employmentType: "Full-time",
    industry: "Health & care",
    salaryLabel: "£45,000 – £55,000",
    postedLabel: "Posted recently",
    blurb:
      "Skills-first FBP role: budgeting, forecasting, and clear insight for clinical leads — returners encouraged.",
    skills: [
      "Management accounting",
      "Budgeting & forecasting",
      "Financial storytelling",
      "Stakeholder partnership",
      "Excel / financial modelling",
      "Healthcare or public-sector finance",
    ],
    description: `You will partner with clinical and operational leads on budgets, forecasts, and decision-ready insight.

Typical responsibilities
• Build and challenge departmental budgets and rolling forecasts
• Present clear variance analysis to non-finance stakeholders
• Support business cases for new services and staffing models
• Help design finance onboarding for colleagues returning from leave
• Improve reporting so leaders get signal, not noise

We care that you can do the work. Qualification pathways (ACA / ACCA / CIMA or equivalent experience) are welcome; an unbroken post-qualification timeline is not required.`,
  },
  {
    slug: "customer-success-lead",
    title: "Customer Success Lead",
    companyName: "Brightpath Software",
    location: "Remote (UK)",
    remoteType: "remote",
    employmentType: "Full-time",
    industry: "Software / SaaS",
    salaryLabel: "£40,000 – £50,000",
    postedLabel: "Posted recently",
    blurb:
      "Skills-first CS lead: communication, onboarding, and account health — sector knowledge valued over continuous timelines.",
    skills: [
      "Customer relationship management",
      "Written & verbal communication",
      "Account health monitoring",
      "Onboarding & adoption",
      "Cross-functional collaboration",
      "SaaS or B2B experience",
    ],
    description: `You will guide a portfolio of mid-market B2B customers from onboarding through renewal, with a focus on clear communication and long-term outcomes.

Typical responsibilities
• Own onboarding and adoption for your account portfolio
• Run health checks and QBRs that surface risk early
• Close the loop with product and support on customer feedback
• Mentor junior CS colleagues and help document playbooks
• Protect renewal outcomes without losing the human relationship

Empathy and communication matter more here than an unbroken CV timeline.`,
  },
];

export function findHomepageDemoJob(slug: string): JobListingContent | undefined {
  return HOMEPAGE_DEMO_JOBS.find((job) => job.slug === slug);
}
