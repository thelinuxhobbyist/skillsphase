import type { JobListingContent, JobListingSkill } from "@horizon/shared";
import type { HorizonJob } from "@/lib/api";

export type JobListingViewModel = JobListingContent & {
  /** Live job id when applicable; null for examples. */
  jobId: number | null;
  isExample: boolean;
  backHref: string;
  backLabel: string;
};

function formatEmploymentType(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatRemote(value: HorizonJob["remoteType"] | JobListingContent["remoteType"]) {
  switch (value) {
    case "on_site":
      return "On-site";
    case "hybrid":
      return "Hybrid";
    case "remote":
      return "Remote";
    default:
      return value;
  }
}

function formatSalary(job: HorizonJob) {
  if (job.salaryMin == null && job.salaryMax == null) {
    return "Salary on application";
  }
  const currency = job.salaryCurrency || "GBP";
  const min = job.salaryMin != null ? `${currency} ${job.salaryMin.toLocaleString("en-GB")}` : null;
  const max = job.salaryMax != null ? `${currency} ${job.salaryMax.toLocaleString("en-GB")}` : null;
  if (min && max) return `${min} – ${max}`;
  return min ?? max ?? "Salary on application";
}

function formatPosted(iso: string) {
  try {
    return `Posted ${new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  } catch {
    return "Posted recently";
  }
}

const DEFAULT_INCLUSIVE =
  "Career breaks are welcomed. Project Horizon employers assess applicants on the skills a role needs — not on unbroken employment history. Experience from previous jobs, freelancing, volunteering, or caring responsibilities all count.";

const DEFAULT_PROCESS = [
  "Submit your application via Project Horizon",
  "Skills review against the abilities listed for this role",
  "Conversation with the hiring team",
  "Decision shared with a clear timeline",
];

const DEFAULT_WHY_RETURNERS = [
  "Flexible or hybrid patterns where the role allows",
  "Clear onboarding so you are not left guessing",
  "Space to discuss phased return if you need it",
  "Assessment focused on skills, not gaps on a CV",
];

const DEFAULT_GOOD_FIT = [
  "You recognise yourself in the essential skills listed for this role",
  "You can show how you have used those skills in paid work, freelancing, volunteering, or caring",
  "You want an employer that treats a career break as context, not a flaw",
];

const DEFAULT_BENEFITS = [
  "Flexible working discussed at interview",
  "Training and development opportunities",
  "Pension contribution",
  "Supportive return-to-work culture",
];

/** Split flat skill names into essential / nice-to-have for live jobs. */
function skillsFromNames(names: string[]): JobListingSkill[] {
  if (names.length === 0) return [];
  const essentialCount = Math.max(3, Math.ceil(names.length * 0.7));
  return names.map((name, index) => ({
    name,
    level: index < essentialCount ? "essential" : "nice_to_have",
  }));
}

export function listingFromDemo(job: JobListingContent): JobListingViewModel {
  return {
    ...job,
    employmentType: formatEmploymentType(job.employmentType),
    jobId: null,
    isExample: true,
    backHref: "/#jobs",
    backLabel: "Back to featured jobs",
  };
}

export function listingFromHorizonJob(job: HorizonJob): JobListingViewModel {
  return {
    slug: job.slug,
    title: job.title,
    companyName: job.companyName,
    location: job.location,
    remoteType: job.remoteType,
    employmentType: formatEmploymentType(job.employmentType),
    industry: job.industry || "Not specified",
    companySize: "See company profile",
    companyAbout: `${job.companyName} is hiring through Project Horizon — a skills-first platform for career returners. Ask about their culture and support for returners at interview.`,
    salaryLabel: formatSalary(job),
    postedLabel: formatPosted(job.createdAt),
    blurb: job.description.slice(0, 160),
    skills: skillsFromNames(job.skills.map((s) => s.name)),
    goodFitIf: DEFAULT_GOOD_FIT,
    aboutRole: job.description,
    benefits: DEFAULT_BENEFITS,
    inclusiveHiring: DEFAULT_INCLUSIVE,
    applicationProcess: DEFAULT_PROCESS,
    whyReturners: DEFAULT_WHY_RETURNERS,
    jobId: job.id,
    isExample: false,
    backHref: "/jobs",
    backLabel: "Back to jobs",
  };
}

export function remoteLabel(
  value: JobListingViewModel["remoteType"],
): string {
  return formatRemote(value);
}
