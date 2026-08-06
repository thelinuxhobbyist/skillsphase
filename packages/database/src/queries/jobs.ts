import {
  and,
  count,
  desc,
  eq,
  ilike,
  isNull,
  ne,
  or,
  sql,
} from "drizzle-orm";
import type {
  ApplicationStatus,
  EmploymentType,
  JobStatus,
  RemoteType,
} from "@horizon/shared";
import type { Database } from "../client";
import { companies } from "../schema/companies";
import { applications, jobSkills, jobs } from "../schema/jobs";
import { skills } from "../schema/profile";
import { users } from "../schema/users";
import {
  listCapabilitiesForUser,
  pickCardCapabilities,
} from "./capabilities";
import { listProjectsForUser } from "./projects";
import {
  listEducation,
  listPublicRecommendations,
  listQualifications,
  listUserSkills,
} from "./profile";

export type AppJob = typeof jobs.$inferSelect;
export type AppApplication = typeof applications.$inferSelect;

export type PublicJobListItem = {
  id: number;
  title: string;
  slug: string;
  location: string;
  remoteType: RemoteType;
  employmentType: string;
  industry: string;
  salaryMin: string | null;
  salaryMax: string | null;
  salaryCurrency: string;
  closingDate: string | null;
  companyName: string;
  createdAt: string;
};

export type PublicJobDetail = PublicJobListItem & {
  description: string;
  skills: string[];
  companyWebsite: string | null;
  status: JobStatus;
};

export type EmployerJobListItem = PublicJobListItem & {
  status: JobStatus;
  applicationCount: number;
};

export type ApplicationListItem = {
  id: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  createdAt: string;
  updatedAt: string;
  job: {
    id: number;
    title: string;
    slug: string;
    location: string;
    companyName: string;
    status: JobStatus;
  };
};

export type EmployerApplicationItem = {
  id: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  createdAt: string;
  updatedAt: string;
  candidate: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    professionalTitle: string | null;
    primaryCapability: string | null;
    city: string | null;
    profileCompleted: boolean;
  };
  profileSnapshot: Record<string, unknown> | null;
};

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "role";
}

async function uniqueJobSlug(db: Database, title: string): Promise<string> {
  const base = slugify(title);
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix =
      attempt === 0
        ? ""
        : `-${Math.random().toString(36).slice(2, 7)}`;
    const candidate = `${base}${suffix}`;
    const [existing] = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(eq(jobs.slug, candidate))
      .limit(1);
    if (!existing) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

async function resolveSkillIds(
  db: Database,
  skillNames: string[] | undefined,
): Promise<string[]> {
  if (!skillNames || skillNames.length === 0) return [];
  const ids: string[] = [];
  for (const raw of skillNames) {
    const name = raw.trim();
    if (!name) continue;
    const [existing] = await db
      .select()
      .from(skills)
      .where(ilike(skills.name, name))
      .limit(1);
    if (existing) {
      ids.push(existing.id);
      continue;
    }
    const [created] = await db
      .insert(skills)
      .values({ name })
      .returning();
    if (created) ids.push(created.id);
  }
  return ids;
}

async function setJobSkills(
  db: Database,
  jobId: number,
  skillNames: string[] | undefined,
) {
  await db.delete(jobSkills).where(eq(jobSkills.jobId, jobId));
  const skillIds = await resolveSkillIds(db, skillNames);
  if (skillIds.length === 0) return;
  await db.insert(jobSkills).values(
    skillIds.map((skillId) => ({ jobId, skillId })),
  );
}

async function listSkillNamesForJob(
  db: Database,
  jobId: number,
): Promise<string[]> {
  const rows = await db
    .select({ name: skills.name })
    .from(jobSkills)
    .innerJoin(skills, eq(jobSkills.skillId, skills.id))
    .where(eq(jobSkills.jobId, jobId));
  return rows.map((row) => row.name);
}

export async function buildApplicationProfileSnapshot(
  db: Database,
  userId: string,
): Promise<Record<string, unknown>> {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);
  if (!user) return {};

  const [skillRows, capabilityRows, projectRows, qualifications, recommendations, education] =
    await Promise.all([
      listUserSkills(db, userId),
      listCapabilitiesForUser(db, userId),
      listProjectsForUser(db, userId),
      listQualifications(db, userId),
      listPublicRecommendations(db, userId),
      listEducation(db, userId),
    ]);
  const cardCapabilities = pickCardCapabilities(capabilityRows);

  return {
    capturedAt: new Date().toISOString(),
    firstName: user.firstName,
    lastName: user.lastName,
    professionalTitle: user.professionalTitle,
    primaryCapability:
      cardCapabilities.primaryCapability ?? user.primaryCapability,
    careerSummary: user.careerSummary,
    city: user.city,
    country: user.country,
    availability: user.availability,
    remotePreference: user.remotePreference,
    skills: skillRows.map((s) => s.name),
    capabilities: capabilityRows.map((c) => ({
      label: c.label,
      isPrimary: c.isPrimary,
    })),
    evidence: projectRows.map((p) => ({
      title: p.title,
      outcome: p.outcome,
      projectUrl: p.projectUrl,
    })),
    qualifications: qualifications.map((q) => ({
      name: q.name,
      issuingBody: q.issuingBody,
      availableUponRequest: true,
    })),
    recommendations: recommendations.map((r) => ({
      relationship: r.relationship,
      publicSummary: r.publicSummary,
      verificationStatus: r.verificationStatus,
    })),
    education: education.map((e) => ({
      institution: e.institution,
      qualification: e.qualification,
    })),
  };
}

export type JobListFilters = {
  q?: string;
  location?: string;
  remoteType?: RemoteType;
  employmentType?: EmploymentType;
  industry?: string;
};

export async function listPublishedJobs(
  db: Database,
  filters: JobListFilters,
  page: number,
  pageSize: number,
): Promise<{ items: PublicJobListItem[]; total: number }> {
  const conditions = [
    eq(jobs.status, "published"),
    eq(jobs.removedByAdmin, false),
    isNull(jobs.deletedAt),
    isNull(companies.deletedAt),
  ];
  if (filters.q) {
    conditions.push(
      or(
        ilike(jobs.title, `%${filters.q}%`),
        ilike(jobs.description, `%${filters.q}%`),
        ilike(companies.companyName, `%${filters.q}%`),
      )!,
    );
  }
  if (filters.location) {
    conditions.push(ilike(jobs.location, `%${filters.location}%`));
  }
  if (filters.remoteType) {
    conditions.push(eq(jobs.remoteType, filters.remoteType));
  }
  if (filters.employmentType) {
    conditions.push(eq(jobs.employmentType, filters.employmentType));
  }
  if (filters.industry) {
    conditions.push(ilike(jobs.industry, `%${filters.industry}%`));
  }

  const where = and(...conditions);
  const [totalRow] = await db
    .select({ value: count() })
    .from(jobs)
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .where(where);

  const rows = await db
    .select({
      job: jobs,
      companyName: companies.companyName,
    })
    .from(jobs)
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .where(where)
    .orderBy(desc(jobs.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    total: Number(totalRow?.value ?? 0),
    items: rows.map(({ job, companyName }) => ({
      id: job.id,
      title: job.title,
      slug: job.slug,
      location: job.location,
      remoteType: job.remoteType,
      employmentType: job.employmentType,
      industry: job.industry,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryCurrency: job.salaryCurrency,
      closingDate: job.closingDate,
      companyName,
      createdAt: job.createdAt.toISOString(),
    })),
  };
}

export async function findPublishedJobBySlug(
  db: Database,
  slug: string,
): Promise<PublicJobDetail | null> {
  const [row] = await db
    .select({
      job: jobs,
      companyName: companies.companyName,
      companyWebsite: companies.website,
    })
    .from(jobs)
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .where(
      and(
        eq(jobs.slug, slug),
        eq(jobs.status, "published"),
        eq(jobs.removedByAdmin, false),
        isNull(jobs.deletedAt),
        isNull(companies.deletedAt),
      ),
    )
    .limit(1);
  if (!row) return null;
  const skillNames = await listSkillNamesForJob(db, row.job.id);
  return {
    id: row.job.id,
    title: row.job.title,
    slug: row.job.slug,
    description: row.job.description,
    location: row.job.location,
    remoteType: row.job.remoteType,
    employmentType: row.job.employmentType,
    industry: row.job.industry,
    salaryMin: row.job.salaryMin,
    salaryMax: row.job.salaryMax,
    salaryCurrency: row.job.salaryCurrency,
    closingDate: row.job.closingDate,
    companyName: row.companyName,
    companyWebsite: row.companyWebsite,
    status: row.job.status,
    skills: skillNames,
    createdAt: row.job.createdAt.toISOString(),
  };
}

export async function findJobById(
  db: Database,
  jobId: number,
): Promise<AppJob | null> {
  const [row] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, jobId), isNull(jobs.deletedAt)))
    .limit(1);
  return row ?? null;
}

export async function listJobsForCompany(
  db: Database,
  companyId: string,
): Promise<EmployerJobListItem[]> {
  const rows = await db
    .select({
      job: jobs,
      companyName: companies.companyName,
      applicationCount: sql<number>`(
        select count(*)::int from ${applications}
        where ${applications.jobId} = ${jobs.id}
          and ${applications.deletedAt} is null
      )`,
    })
    .from(jobs)
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .where(and(eq(jobs.companyId, companyId), isNull(jobs.deletedAt)))
    .orderBy(desc(jobs.updatedAt));

  return rows.map(({ job, companyName, applicationCount }) => ({
    id: job.id,
    title: job.title,
    slug: job.slug,
    location: job.location,
    remoteType: job.remoteType,
    employmentType: job.employmentType,
    industry: job.industry,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    closingDate: job.closingDate,
    companyName,
    status: job.status,
    applicationCount: Number(applicationCount ?? 0),
    createdAt: job.createdAt.toISOString(),
  }));
}

export async function createJob(
  db: Database,
  input: {
    companyId: string;
    createdByUserId: string;
    title: string;
    description: string;
    location: string;
    remoteType: RemoteType;
    employmentType: string;
    industry: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryCurrency?: string;
    closingDate?: string | null;
    skillNames?: string[];
    status: JobStatus;
  },
): Promise<AppJob> {
  const slug = await uniqueJobSlug(db, input.title);
  const [created] = await db
    .insert(jobs)
    .values({
      companyId: input.companyId,
      createdByUserId: input.createdByUserId,
      title: input.title,
      slug,
      description: input.description,
      location: input.location,
      remoteType: input.remoteType,
      employmentType: input.employmentType,
      industry: input.industry,
      salaryMin:
        input.salaryMin === undefined || input.salaryMin === null
          ? null
          : String(input.salaryMin),
      salaryMax:
        input.salaryMax === undefined || input.salaryMax === null
          ? null
          : String(input.salaryMax),
      salaryCurrency: input.salaryCurrency ?? "GBP",
      closingDate: input.closingDate ?? null,
      status: input.status,
    })
    .returning();
  if (!created) throw new Error("Failed to create job");
  await setJobSkills(db, created.id, input.skillNames);
  return created;
}

export async function updateJob(
  db: Database,
  job: AppJob,
  input: {
    title?: string;
    description?: string;
    location?: string;
    remoteType?: RemoteType;
    employmentType?: string;
    industry?: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryCurrency?: string;
    closingDate?: string | null;
    skillNames?: string[];
    status?: JobStatus;
  },
): Promise<AppJob> {
  const [updated] = await db
    .update(jobs)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.location !== undefined ? { location: input.location } : {}),
      ...(input.remoteType !== undefined
        ? { remoteType: input.remoteType }
        : {}),
      ...(input.employmentType !== undefined
        ? { employmentType: input.employmentType }
        : {}),
      ...(input.industry !== undefined ? { industry: input.industry } : {}),
      ...(input.salaryMin !== undefined
        ? {
            salaryMin:
              input.salaryMin === null ? null : String(input.salaryMin),
          }
        : {}),
      ...(input.salaryMax !== undefined
        ? {
            salaryMax:
              input.salaryMax === null ? null : String(input.salaryMax),
          }
        : {}),
      ...(input.salaryCurrency !== undefined
        ? { salaryCurrency: input.salaryCurrency }
        : {}),
      ...(input.closingDate !== undefined
        ? { closingDate: input.closingDate }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, job.id))
    .returning();
  if (!updated) throw new Error("Failed to update job");
  if (input.skillNames !== undefined) {
    await setJobSkills(db, job.id, input.skillNames);
  }
  return updated;
}

export async function softDeleteJob(db: Database, jobId: number) {
  await db
    .update(jobs)
    .set({ deletedAt: new Date(), updatedAt: new Date(), status: "closed" })
    .where(eq(jobs.id, jobId));
}

export async function findApplicationByJobAndUser(
  db: Database,
  jobId: number,
  userId: string,
): Promise<AppApplication | null> {
  const [row] = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.jobId, jobId),
        eq(applications.userId, userId),
        isNull(applications.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function createApplication(
  db: Database,
  input: {
    jobId: number;
    userId: string;
    coverLetter?: string | null;
    profileSnapshot: Record<string, unknown>;
  },
): Promise<AppApplication> {
  const [created] = await db
    .insert(applications)
    .values({
      jobId: input.jobId,
      userId: input.userId,
      coverLetter: input.coverLetter ?? null,
      profileSnapshot: input.profileSnapshot,
      status: "applied",
    })
    .returning();
  if (!created) throw new Error("Failed to create application");
  return created;
}

export async function listApplicationsForUser(
  db: Database,
  userId: string,
): Promise<ApplicationListItem[]> {
  const rows = await db
    .select({
      application: applications,
      job: jobs,
      companyName: companies.companyName,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .where(and(eq(applications.userId, userId), isNull(applications.deletedAt)))
    .orderBy(desc(applications.createdAt));

  return rows.map(({ application, job, companyName }) => ({
    id: application.id,
    status: application.status,
    coverLetter: application.coverLetter,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
    job: {
      id: job.id,
      title: job.title,
      slug: job.slug,
      location: job.location,
      companyName,
      status: job.status,
    },
  }));
}

export async function withdrawApplication(
  db: Database,
  applicationId: string,
  userId: string,
): Promise<AppApplication | null> {
  const [updated] = await db
    .update(applications)
    .set({ status: "withdrawn", updatedAt: new Date() })
    .where(
      and(
        eq(applications.id, applicationId),
        eq(applications.userId, userId),
        isNull(applications.deletedAt),
        ne(applications.status, "withdrawn"),
        ne(applications.status, "hired"),
      ),
    )
    .returning();
  return updated ?? null;
}

export async function listApplicationsForJob(
  db: Database,
  jobId: number,
  companyId: string,
): Promise<EmployerApplicationItem[]> {
  const [owned] = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(
      and(
        eq(jobs.id, jobId),
        eq(jobs.companyId, companyId),
        isNull(jobs.deletedAt),
      ),
    )
    .limit(1);
  if (!owned) return [];

  const rows = await db
    .select({
      application: applications,
      user: users,
    })
    .from(applications)
    .innerJoin(users, eq(applications.userId, users.id))
    .where(
      and(eq(applications.jobId, jobId), isNull(applications.deletedAt)),
    )
    .orderBy(desc(applications.createdAt));

  return rows.map(({ application, user }) => ({
    id: application.id,
    status: application.status,
    coverLetter: application.coverLetter,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
    candidate: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      professionalTitle: user.professionalTitle,
      primaryCapability: user.primaryCapability,
      city: user.city,
      profileCompleted: user.profileCompleted,
    },
    profileSnapshot:
      (application.profileSnapshot as Record<string, unknown> | null) ?? null,
  }));
}

export async function updateApplicationStatus(
  db: Database,
  applicationId: string,
  companyId: string,
  status: ApplicationStatus,
): Promise<AppApplication | null> {
  const [owned] = await db
    .select({ id: applications.id })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(
      and(
        eq(applications.id, applicationId),
        eq(jobs.companyId, companyId),
        isNull(applications.deletedAt),
        isNull(jobs.deletedAt),
      ),
    )
    .limit(1);
  if (!owned) return null;

  const [updated] = await db
    .update(applications)
    .set({ status, updatedAt: new Date() })
    .where(eq(applications.id, applicationId))
    .returning();
  return updated ?? null;
}

export function toEmployerJobDetail(job: AppJob, skillNames: string[]) {
  return {
    id: job.id,
    title: job.title,
    slug: job.slug,
    description: job.description,
    location: job.location,
    remoteType: job.remoteType,
    employmentType: job.employmentType,
    industry: job.industry,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    closingDate: job.closingDate,
    status: job.status,
    skills: skillNames,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

export async function getEmployerJobDetail(
  db: Database,
  jobId: number,
  companyId: string,
) {
  const [job] = await db
    .select()
    .from(jobs)
    .where(
      and(
        eq(jobs.id, jobId),
        eq(jobs.companyId, companyId),
        isNull(jobs.deletedAt),
      ),
    )
    .limit(1);
  if (!job) return null;
  const skillNames = await listSkillNamesForJob(db, job.id);
  return toEmployerJobDetail(job, skillNames);
}
