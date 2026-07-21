import type { JobListingContent, JobListingSkill } from "@horizon/shared";
import type { HorizonJob } from "@/lib/api";

export type SimilarJobCard = {
  slug: string;
  title: string;
  companyName: string;
  location: string;
  remoteType: string;
  href: string;
  isExample: boolean;
};

export type JobListingViewModel = {
  slug: string;
  title: string;
  companyName: string;
  location: string;
  remoteType: JobListingContent["remoteType"];
  employmentType: string;
  industry: string | null;
  companySize: string | null;
  companyAbout: string | null;
  salaryLabel: string;
  postedLabel: string;
  skills: JobListingSkill[];
  description: string;
  benefits: string[];
  whyReturners: string[];
  applicationProcess: string[];
  workingPatternDetail: string | null;
  contractDetails: string | null;
  jobId: number | null;
  isExample: boolean;
  backHref: string;
  backLabel: string;
  similarJobs: SimilarJobCard[];
};

function formatEmploymentType(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatRemote(
  value: HorizonJob["remoteType"] | JobListingContent["remoteType"] | string,
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

export function listingFromDemo(
  job: JobListingContent,
  similarJobs: SimilarJobCard[] = [],
): JobListingViewModel {
  return {
    slug: job.slug,
    title: job.title,
    companyName: job.companyName,
    location: job.location,
    remoteType: job.remoteType,
    employmentType: formatEmploymentType(job.employmentType),
    industry: job.industry.trim() ? job.industry.trim() : null,
    companySize: job.companySize || null,
    companyAbout: job.companyAbout || null,
    salaryLabel: job.salaryLabel,
    postedLabel: job.postedLabel,
    skills: job.skills,
    description: job.description,
    benefits: job.benefits,
    whyReturners: job.whyReturners,
    applicationProcess: job.applicationProcess,
    workingPatternDetail: job.workingPatternDetail || null,
    contractDetails: job.contractDetails || null,
    jobId: null,
    isExample: true,
    backHref: "/#jobs",
    backLabel: "Back to featured jobs",
    similarJobs,
  };
}

/** Live jobs: only employer-provided fields; optional sections stay empty until set. */
export function listingFromHorizonJob(
  job: HorizonJob,
  similarJobs: SimilarJobCard[] = [],
): JobListingViewModel {
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
    description: job.description,
    benefits: [],
    whyReturners: [],
    applicationProcess: [],
    workingPatternDetail: null,
    contractDetails: null,
    jobId: job.id,
    isExample: false,
    backHref: "/jobs",
    backLabel: "Back to jobs",
    similarJobs,
  };
}

export function remoteLabel(
  value: JobListingViewModel["remoteType"] | string,
): string {
  return formatRemote(value);
}

export function similarCardsFromDemos(
  jobs: JobListingContent[],
): SimilarJobCard[] {
  return jobs.map((job) => ({
    slug: job.slug,
    title: job.title,
    companyName: job.companyName,
    location: job.location,
    remoteType: job.remoteType,
    href: `/jobs/examples/${job.slug}`,
    isExample: true,
  }));
}

export function similarCardsFromLive(jobs: HorizonJob[]): SimilarJobCard[] {
  return jobs.map((job) => ({
    slug: job.slug,
    title: job.title,
    companyName: job.companyName,
    location: job.location,
    remoteType: job.remoteType,
    href: `/jobs/${job.slug}`,
    isExample: false,
  }));
}
