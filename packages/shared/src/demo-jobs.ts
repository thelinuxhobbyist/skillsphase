export type HomepageDemoJob = {
  slug: string;
  title: string;
  companyName: string;
  location: string;
  remoteType: "on_site" | "hybrid" | "remote";
  employmentType: string;
  blurb: string;
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
    blurb:
      "Lead a regional ops team. Returners with people-leadership experience welcome — career breaks recognised as part of the journey.",
    description: `About the role

Northbridge is hiring an Operations Manager to lead a regional retail ops team across Greater Manchester. You will coach store leaders, improve fulfilment and stock accuracy, and keep customer experience consistent across sites.

This is an example listing so you can see how Project Horizon presents roles. It is not a live vacancy.

What you will do
• Lead and develop a team of area and store managers
• Own weekly ops rhythms: stock, labour planning, and service standards
• Partner with HR and finance on return-to-work friendly scheduling
• Identify process improvements that reduce friction for customers and staff

Who this is for
• Experience leading people in retail, hospitality, logistics, or similar
• Comfortable with hybrid working (office + store visits)
• Career breaks for caring, parental leave, or health are welcomed — tell us your story

Location & hours
Hybrid — Manchester base with travel across the region. Full-time; flexible patterns discussed at interview.`,
  },
  {
    slug: "finance-business-partner",
    title: "Finance Business Partner",
    companyName: "Cedar Health Ltd",
    location: "Leeds",
    remoteType: "hybrid",
    employmentType: "Full-time",
    blurb:
      "Partner with clinical leads on budgets and forecasting. Ideal for experienced accountants returning after parental leave.",
    description: `About the role

Cedar Health is looking for a Finance Business Partner to support clinical and operational leads with budgeting, forecasting, and decision-ready insight.

This is an example listing for Project Horizon — not a live vacancy.

What you will do
• Build and challenge departmental budgets and forecasts
• Present clear variance analysis to non-finance stakeholders
• Support business cases for new services and staffing models
• Help design finance onboarding for colleagues returning from leave

Who this is for
• Qualified accountant (ACA / ACCA / CIMA or equivalent)
• Experience as an FBP, management accountant, or similar
• Strong communication skills; career breaks for parental leave are expected and respected

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
    blurb:
      "Support B2B customers through onboarding and renewals. Communication skills and sector knowledge valued over continuous timelines.",
    description: `About the role

Brightpath Software needs a Customer Success Lead to guide B2B customers from onboarding through renewal, with a focus on clear communication and long-term outcomes.

This is an example listing for Project Horizon — not a live vacancy.

What you will do
• Own a portfolio of mid-market accounts through onboarding and adoption
• Run QBRs and health checks that surface risk early
• Work with product and support to close the loop on customer feedback
• Mentor junior CS colleagues and document playbooks

Who this is for
• Experience in customer success, account management, or client services
• Excellent written and spoken communication
• Sector knowledge and empathy matter more than an unbroken CV timeline

Location & hours
Remote (UK). Full-time; flexible hours within UK working days.`,
  },
];

export function findHomepageDemoJob(slug: string): HomepageDemoJob | undefined {
  return HOMEPAGE_DEMO_JOBS.find((job) => job.slug === slug);
}
