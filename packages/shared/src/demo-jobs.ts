export type JobListingSkill = {
  name: string;
  level: "essential" | "nice_to_have";
};

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
  blurb: string;
  skills: JobListingSkill[];
  goodFitIf: string[];
  aboutRole: string;
  benefits: string[];
  inclusiveHiring: string;
  applicationProcess: string[];
  whyReturners: string[];
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
    goodFitIf: [
      "You have led people before — in retail, hospitality, logistics, or a similar fast-moving environment",
      "You can plan a week of work, spot bottlenecks, and communicate calmly under pressure",
      "Experience from previous employment, freelancing, volunteering, or caring responsibilities has sharpened how you organise and support others",
      "You want hybrid work with a clear Manchester base and regional travel",
    ],
    aboutRole: `You will lead a regional retail operations team across Greater Manchester. The focus is coaching store and area managers, keeping service and stock standards consistent, and improving how work gets done day to day.

Typical responsibilities
• Guide and develop store and area managers through regular one-to-ones and on-the-floor coaching
• Own weekly ops rhythms for stock accuracy, labour planning, and customer service standards
• Partner with HR and finance on return-to-work friendly scheduling and seasonal peaks
• Identify process improvements that reduce friction for customers and frontline teams
• Report progress clearly to senior leadership without drowning people in jargon

Success in the first six months looks like steadier store performance, managers who feel supported, and a few practical process changes that stick.`,
    benefits: [
      "Hybrid working with a Manchester base",
      "Flexible patterns discussed at interview",
      "Training and leadership development budget",
      "Enhanced parental and carers leave",
      "Pension contribution",
      "Employee discount across Northbridge brands",
    ],
    inclusiveHiring:
      "Career breaks are welcomed. We assess applicants on the skills this role needs — not on unbroken employment history. Tell us what you can do; context about caring, parental leave, health, or relocation belongs in your story, not as a red flag.",
    applicationProcess: [
      "Submit your application via Project Horizon",
      "Skills review against the essential abilities listed above",
      "Conversation with the hiring manager (video or in person)",
      "Decision within two weeks of interview",
    ],
    whyReturners: [
      "Hybrid pattern with predictable office and travel days",
      "Structured onboarding with a buddy in the first month",
      "Phased return options available if you need to ease back in",
      "Leadership training and coaching support after you join",
    ],
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
    goodFitIf: [
      "You can build and challenge budgets, then explain the story behind the numbers",
      "You are comfortable partnering with non-finance leaders",
      "Skills gained through previous roles, contracting, volunteering, or managing a household budget under pressure transfer into this work",
      "You want hybrid Leeds-based work with space for a phased return",
    ],
    aboutRole: `You will partner with clinical and operational leads on budgets, forecasts, and decision-ready insight.

Typical responsibilities
• Build and challenge departmental budgets and rolling forecasts
• Present clear variance analysis to non-finance stakeholders
• Support business cases for new services and staffing models
• Help design finance onboarding for colleagues returning from leave
• Improve reporting so leaders get signal, not noise

We care that you can do the work. Qualification pathways (ACA / ACCA / CIMA or equivalent experience) are welcome; an unbroken post-qualification timeline is not required.`,
    benefits: [
      "Hybrid working — Leeds",
      "Part-time or phased return options",
      "Study / CPD support",
      "Enhanced parental leave",
      "Pension contribution",
      "Wellbeing allowance",
    ],
    inclusiveHiring:
      "Parental leave and other career breaks are expected and respected. We hire for the skills listed above, not for years-in-post or continuous employment.",
    applicationProcess: [
      "Apply through Project Horizon with your profile",
      "Skills screen against essential abilities",
      "Hiring manager interview plus a short practical case discussion",
      "Offer decision typically within 10 working days",
    ],
    whyReturners: [
      "Hybrid Leeds pattern with flexible core hours",
      "Structured finance onboarding and shadowing",
      "Phased return and part-time pathways available",
      "CPD and qualification support after you start",
    ],
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
    goodFitIf: [
      "You build trust quickly and write clearly",
      "You notice risk early and know how to bring people with you",
      "Experience from client work, volunteering, community organising, or caring has strengthened how you listen and follow through",
      "You want fully remote UK work with flexible hours within the working day",
    ],
    aboutRole: `You will guide a portfolio of mid-market B2B customers from onboarding through renewal, with a focus on clear communication and long-term outcomes.

Typical responsibilities
• Own onboarding and adoption for your account portfolio
• Run health checks and QBRs that surface risk early
• Close the loop with product and support on customer feedback
• Mentor junior CS colleagues and help document playbooks
• Protect renewal outcomes without losing the human relationship

Empathy and communication matter more here than an unbroken CV timeline.`,
    benefits: [
      "Fully remote (UK)",
      "Flexible hours within UK working days",
      "Learning stipend",
      "Enhanced leave",
      "Pension contribution",
      "Home-office setup budget",
    ],
    inclusiveHiring:
      "We welcome career returners. Applications are reviewed against the skills this role needs. Gaps for caring, health, parental leave, or relocation are context — not automatic filters.",
    applicationProcess: [
      "Apply on Project Horizon",
      "Skills match review",
      "Hiring manager conversation",
      "Short written exercise reflecting a customer scenario",
      "Decision within two weeks",
    ],
    whyReturners: [
      "Remote-first with flexible core hours",
      "Documented onboarding and CS playbooks",
      "Buddy support in your first 30 days",
      "Training budget for tools and facilitation skills",
    ],
  },
];

/** Flat skill names for homepage cards and legacy callers. */
export function demoJobSkillNames(job: JobListingContent): string[] {
  return job.skills.map((s) => s.name);
}

export function findHomepageDemoJob(slug: string): JobListingContent | undefined {
  return HOMEPAGE_DEMO_JOBS.find((job) => job.slug === slug);
}
