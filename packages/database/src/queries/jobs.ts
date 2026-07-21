import {
  and,
  count,
  desc,
  eq,
  ilike,
  isNull,
  or,
  type SQL,
} from "drizzle-orm";
import type { JobStatus, RemoteType } from "@horizon/shared";
import type { Database } from "../client";
import { companies } from "../schema/companies";
import { jobSkills, skills } from "../schema/profile";
import { jobs } from "../schema/jobs";

export type AppJob = typeof jobs.$inferSelect;

export type PublicJob = {
  id: number;
  companyId: string;
  companyName: string;
  title: string;
  slug: string;
  description: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  location: string;
  remoteType: RemoteType;
  employmentType: string;
  industry: string;
  closingDate: string | null;
  companyAbout: string | null;
  companySize: string | null;
  benefits: string[];
  whyReturners: string[];
  applicationProcess: string[];
  workingPatternDetail: string | null;
  contractDetails: string | null;
  niceToHaveSkills: string[];
  status: JobStatus;
  skills: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt: string;
};

function toNumber(value: string | null): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export function slugifyTitle(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = crypto.randomUUID().slice(0, 8);
  return `${base || "job"}-${suffix}`;
}

async function loadJobSkills(db: Database, jobId: number) {
  return db
    .select({ id: skills.id, name: skills.name })
    .from(jobSkills)
    .innerJoin(skills, eq(skills.id, jobSkills.skillId))
    .where(eq(jobSkills.jobId, jobId));
}

export async function toPublicJob(
  db: Database,
  job: AppJob,
  companyName: string,
): Promise<PublicJob> {
  const skillRows = await loadJobSkills(db, job.id);
  return {
    id: job.id,
    companyId: job.companyId,
    companyName,
    title: job.title,
    slug: job.slug,
    description: job.description,
    salaryMin: toNumber(job.salaryMin),
    salaryMax: toNumber(job.salaryMax),
    salaryCurrency: job.salaryCurrency,
    location: job.location,
    remoteType: job.remoteType,
    employmentType: job.employmentType,
    industry: job.industry,
    closingDate: job.closingDate,
    companyAbout: job.companyAbout,
    companySize: job.companySize,
    benefits: asStringArray(job.benefits),
    whyReturners: asStringArray(job.whyReturners),
    applicationProcess: asStringArray(job.applicationProcess),
    workingPatternDetail: job.workingPatternDetail,
    contractDetails: job.contractDetails,
    niceToHaveSkills: asStringArray(job.niceToHaveSkills),
    status: job.status,
    skills: skillRows,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

async function resolveSkillIds(
  db: Database,
  skillIds: string[],
  skillNames: string[],
) {
  const ids = new Set(skillIds);
  for (const name of skillNames.map((n) => n.trim()).filter(Boolean)) {
    const [existing] = await db
      .select()
      .from(skills)
      .where(eq(skills.name, name))
      .limit(1);
    if (existing) {
      ids.add(existing.id);
      continue;
    }
    const [created] = await db.insert(skills).values({ name }).returning();
    if (created) ids.add(created.id);
  }
  return [...ids];
}

async function replaceJobSkills(db: Database, jobId: number, skillIds: string[]) {
  await db.delete(jobSkills).where(eq(jobSkills.jobId, jobId));
  if (skillIds.length === 0) return;
  await db.insert(jobSkills).values(skillIds.map((skillId) => ({ jobId, skillId })));
}

export async function listPublishedJobs(
  db: Database,
  filters: {
    keyword?: string;
    location?: string;
    employmentType?: string;
    remoteType?: RemoteType;
    industry?: string;
    page: number;
    pageSize: number;
  },
) {
  const conditions: SQL[] = [
    eq(jobs.status, "published"),
    isNull(jobs.deletedAt),
    eq(jobs.removedByAdmin, false),
  ];

  if (filters.keyword) {
    const q = `%${filters.keyword}%`;
    conditions.push(
      or(ilike(jobs.title, q), ilike(jobs.description, q), ilike(jobs.industry, q))!,
    );
  }
  if (filters.location) {
    conditions.push(ilike(jobs.location, `%${filters.location}%`));
  }
  if (filters.employmentType) {
    conditions.push(eq(jobs.employmentType, filters.employmentType));
  }
  if (filters.remoteType) {
    conditions.push(eq(jobs.remoteType, filters.remoteType));
  }
  if (filters.industry) {
    conditions.push(ilike(jobs.industry, `%${filters.industry}%`));
  }

  const where = and(...conditions);
  const offset = (filters.page - 1) * filters.pageSize;

  const [totalRow] = await db
    .select({ value: count() })
    .from(jobs)
    .where(where);

  const rows = await db
    .select({
      job: jobs,
      companyName: companies.companyName,
    })
    .from(jobs)
    .innerJoin(companies, eq(companies.id, jobs.companyId))
    .where(where)
    .orderBy(desc(jobs.createdAt))
    .limit(filters.pageSize)
    .offset(offset);

  const data = await Promise.all(
    rows.map((row) => toPublicJob(db, row.job, row.companyName)),
  );

  return {
    data,
    total: Number(totalRow?.value ?? 0),
  };
}

export async function findPublishedJobBySlug(db: Database, slug: string) {
  const [row] = await db
    .select({
      job: jobs,
      companyName: companies.companyName,
    })
    .from(jobs)
    .innerJoin(companies, eq(companies.id, jobs.companyId))
    .where(
      and(
        eq(jobs.slug, slug),
        eq(jobs.status, "published"),
        isNull(jobs.deletedAt),
        eq(jobs.removedByAdmin, false),
      ),
    )
    .limit(1);

  if (!row) return null;
  return toPublicJob(db, row.job, row.companyName);
}

export async function findJobById(db: Database, id: number) {
  const [row] = await db
    .select({
      job: jobs,
      companyName: companies.companyName,
      companyOwnerUserId: companies.ownerUserId,
      verificationStatus: companies.verificationStatus,
    })
    .from(jobs)
    .innerJoin(companies, eq(companies.id, jobs.companyId))
    .where(and(eq(jobs.id, id), isNull(jobs.deletedAt)))
    .limit(1);

  return row ?? null;
}

export async function listJobsForCompany(db: Database, companyId: string) {
  const rows = await db
    .select({
      job: jobs,
      companyName: companies.companyName,
    })
    .from(jobs)
    .innerJoin(companies, eq(companies.id, jobs.companyId))
    .where(and(eq(jobs.companyId, companyId), isNull(jobs.deletedAt)))
    .orderBy(desc(jobs.createdAt));

  return Promise.all(rows.map((row) => toPublicJob(db, row.job, row.companyName)));
}

export async function createJob(
  db: Database,
  input: {
    companyId: string;
    createdByUserId: string;
    title: string;
    description: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryCurrency: string;
    location: string;
    remoteType: RemoteType;
    employmentType: string;
    industry: string;
    closingDate?: string | null;
    skillIds?: string[];
    skillNames?: string[];
    niceToHaveSkillNames?: string[];
    companyAbout?: string | null;
    companySize?: string | null;
    benefits?: string[];
    whyReturners?: string[];
    applicationProcess?: string[];
    workingPatternDetail?: string | null;
    contractDetails?: string | null;
    publish?: boolean;
  },
) {
  const skillIds = await resolveSkillIds(
    db,
    input.skillIds ?? [],
    input.skillNames ?? [],
  );

  const [created] = await db
    .insert(jobs)
    .values({
      companyId: input.companyId,
      createdByUserId: input.createdByUserId,
      title: input.title,
      slug: slugifyTitle(input.title),
      description: input.description,
      salaryMin:
        input.salaryMin === null || input.salaryMin === undefined
          ? null
          : String(input.salaryMin),
      salaryMax:
        input.salaryMax === null || input.salaryMax === undefined
          ? null
          : String(input.salaryMax),
      salaryCurrency: input.salaryCurrency,
      location: input.location,
      remoteType: input.remoteType,
      employmentType: input.employmentType,
      industry: input.industry,
      closingDate: input.closingDate ?? null,
      companyAbout: input.companyAbout?.trim() || null,
      companySize: input.companySize?.trim() || null,
      benefits: input.benefits ?? [],
      whyReturners: input.whyReturners ?? [],
      applicationProcess: input.applicationProcess ?? [],
      workingPatternDetail: input.workingPatternDetail?.trim() || null,
      contractDetails: input.contractDetails?.trim() || null,
      niceToHaveSkills: input.niceToHaveSkillNames ?? [],
      status: input.publish ? "published" : "draft",
    })
    .returning();

  if (!created) throw new Error("Failed to create job");
  await replaceJobSkills(db, created.id, skillIds);

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, created.companyId))
    .limit(1);

  return toPublicJob(db, created, company?.companyName ?? "Company");
}

export async function updateJob(
  db: Database,
  job: AppJob,
  input: {
    title?: string;
    description?: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryCurrency?: string;
    location?: string;
    remoteType?: RemoteType;
    employmentType?: string;
    industry?: string;
    closingDate?: string | null;
    skillIds?: string[];
    skillNames?: string[];
    niceToHaveSkillNames?: string[];
    companyAbout?: string | null;
    companySize?: string | null;
    benefits?: string[];
    whyReturners?: string[];
    applicationProcess?: string[];
    workingPatternDetail?: string | null;
    contractDetails?: string | null;
  },
) {
  const [updated] = await db
    .update(jobs)
    .set({
      title: input.title ?? job.title,
      description: input.description ?? job.description,
      salaryMin:
        input.salaryMin === undefined
          ? job.salaryMin
          : input.salaryMin === null
            ? null
            : String(input.salaryMin),
      salaryMax:
        input.salaryMax === undefined
          ? job.salaryMax
          : input.salaryMax === null
            ? null
            : String(input.salaryMax),
      salaryCurrency: input.salaryCurrency ?? job.salaryCurrency,
      location: input.location ?? job.location,
      remoteType: input.remoteType ?? job.remoteType,
      employmentType: input.employmentType ?? job.employmentType,
      industry: input.industry ?? job.industry,
      closingDate:
        input.closingDate === undefined ? job.closingDate : input.closingDate,
      companyAbout:
        input.companyAbout === undefined
          ? job.companyAbout
          : input.companyAbout?.trim() || null,
      companySize:
        input.companySize === undefined
          ? job.companySize
          : input.companySize?.trim() || null,
      benefits: input.benefits ?? job.benefits,
      whyReturners: input.whyReturners ?? job.whyReturners,
      applicationProcess: input.applicationProcess ?? job.applicationProcess,
      workingPatternDetail:
        input.workingPatternDetail === undefined
          ? job.workingPatternDetail
          : input.workingPatternDetail?.trim() || null,
      contractDetails:
        input.contractDetails === undefined
          ? job.contractDetails
          : input.contractDetails?.trim() || null,
      niceToHaveSkills:
        input.niceToHaveSkillNames ?? job.niceToHaveSkills,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, job.id))
    .returning();

  if (!updated) throw new Error("Job not found");

  if (input.skillIds || input.skillNames) {
    const skillIds = await resolveSkillIds(
      db,
      input.skillIds ?? [],
      input.skillNames ?? [],
    );
    await replaceJobSkills(db, updated.id, skillIds);
  }

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, updated.companyId))
    .limit(1);

  return toPublicJob(db, updated, company?.companyName ?? "Company");
}

export async function setJobStatus(
  db: Database,
  jobId: number,
  status: JobStatus,
) {
  const [updated] = await db
    .update(jobs)
    .set({ status, updatedAt: new Date() })
    .where(eq(jobs.id, jobId))
    .returning();
  return updated ?? null;
}

export async function softDeleteDraftJob(db: Database, jobId: number) {
  const deletedAt = new Date();
  const [updated] = await db
    .update(jobs)
    .set({ deletedAt, updatedAt: deletedAt })
    .where(and(eq(jobs.id, jobId), eq(jobs.status, "draft"), isNull(jobs.deletedAt)))
    .returning();
  return updated ?? null;
}

export async function adminRemoveJob(db: Database, jobId: number) {
  const [updated] = await db
    .update(jobs)
    .set({
      removedByAdmin: true,
      status: "closed",
      updatedAt: new Date(),
    })
    .where(and(eq(jobs.id, jobId), isNull(jobs.deletedAt)))
    .returning();
  return updated ?? null;
}

export async function listJobsForAdmin(db: Database) {
  const rows = await db
    .select({
      job: jobs,
      companyName: companies.companyName,
    })
    .from(jobs)
    .innerJoin(companies, eq(companies.id, jobs.companyId))
    .where(isNull(jobs.deletedAt))
    .orderBy(desc(jobs.createdAt))
    .limit(100);

  return Promise.all(rows.map((row) => toPublicJob(db, row.job, row.companyName)));
}

export async function countPublishedJobs(db: Database) {
  const [row] = await db
    .select({ value: count() })
    .from(jobs)
    .where(
      and(
        eq(jobs.status, "published"),
        isNull(jobs.deletedAt),
        eq(jobs.removedByAdmin, false),
      ),
    );
  return Number(row?.value ?? 0);
}
