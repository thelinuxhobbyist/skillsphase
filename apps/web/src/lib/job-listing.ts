import type { JobListingContent, JobListingSkill } from "@horizon/shared";
import type { HorizonJob } from "@/lib/api";

export type JobListingViewModel = {
  slug: string;
  title: string;
  companyName: string;
  location: string;
  remoteType: JobListingContent["remoteType"];
  employmentType: string;
  /** Employer-provided industry; omit when empty. */
  industry: string | null;
  companySize: string | null;
  companyAbout: string | null;
  salaryLabel: string;
  postedLabel: string;
  skills: JobListingSkill[];
  goodFitIf: string[];
  aboutRole: string;
  benefits: string[];
  inclusiveHiring: string | null;
  applicationProcess: string[];
  whyReturners: string[];
  jobId: number | null;
  isExample: boolean;
  backHref: string;
  backLabel: string;
};

function formatEmploymentType(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatRemote(
  value: HorizonJob["remoteType"] | JobListingContent["remoteType"],
) {
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
  const min =
    job.salaryMin != null
      ? `${currency} ${job.salaryMin.toLocaleString("en-GB")}`
      : null;
  const max =
    job.salaryMax != null
      ? `${currency} ${job.salaryMax.toLocaleString("en-GB")}`
      : null;
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

export function listingFromDemo(job: JobListingContent): JobListingViewModel {
  return {
    slug: job.slug,
    title: job.title,
    companyName: job.companyName,
    location: job.location,
    remoteType: job.remoteType,
    employmentType: formatEmploymentType(job.employmentType),
    industry: job.industry || null,
    companySize: job.companySize || null,
    companyAbout: job.companyAbout || null,
    salaryLabel: job.salaryLabel,
    postedLabel: job.postedLabel,
    skills: job.skills,
    goodFitIf: job.goodFitIf,
    aboutRole: job.aboutRole,
    benefits: job.benefits,
    inclusiveHiring: job.inclusiveHiring || null,
    applicationProcess: job.applicationProcess,
    whyReturners: job.whyReturners,
    jobId: null,
    isExample: true,
    backHref: "/#jobs",
    backLabel: "Back to featured jobs",
  };
}

/** Live jobs: only fields the employer (or company record) actually provides. */
export function listingFromHorizonJob(job: HorizonJob): JobListingViewModel {
  return {
    slug: job.slug,
    title: job.title,
    companyName: job.companyName,
    location: job.location,
    remoteType: job.remoteType,
    employmentType: formatEmploymentType(job.employmentType),
    industry: job.industry?.trim() ? job.industry.trim() : null,
    companySize: null,
    companyAbout: null,
    salaryLabel: formatSalary(job),
    postedLabel: formatPosted(job.createdAt),
    skills: job.skills.map((s) => ({
      name: s.name,
      level: "essential" as const,
    })),
    goodFitIf: [],
    aboutRole: job.description,
    benefits: [],
    inclusiveHiring: null,
    applicationProcess: [],
    whyReturners: [],
    jobId: job.id,
    isExample: false,
    backHref: "/jobs",
    backLabel: "Back to jobs",
  };
}

export function remoteLabel(value: JobListingViewModel["remoteType"]): string {
  return formatRemote(value);
}
