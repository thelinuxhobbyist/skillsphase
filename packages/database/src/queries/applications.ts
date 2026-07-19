import { and, desc, eq, isNull } from "drizzle-orm";
import type { ApplicationStatus } from "@horizon/shared";
import type { Database } from "../client";
import { applications } from "../schema/applications";
import { companies } from "../schema/companies";
import { jobs } from "../schema/jobs";
import { users } from "../schema/users";

export type AppApplication = typeof applications.$inferSelect;

export type PublicApplication = {
  id: string;
  jobId: number;
  jobTitle: string;
  jobSlug: string;
  companyName: string;
  userId: string;
  candidateName: string;
  candidateEmail: string;
  coverLetter: string | null;
  cvUrl: string;
  cvFileName: string | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type EmployerApplicationView = PublicApplication & {
  careerSummary: string | null;
  location: string | null;
};

function displayName(user: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name || user.email;
}

export function toPublicApplication(input: {
  application: AppApplication;
  jobTitle: string;
  jobSlug: string;
  companyName: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}): PublicApplication {
  return {
    id: input.application.id,
    jobId: input.application.jobId,
    jobTitle: input.jobTitle,
    jobSlug: input.jobSlug,
    companyName: input.companyName,
    userId: input.application.userId,
    candidateName: displayName(input.user),
    candidateEmail: input.user.email,
    coverLetter: input.application.coverLetter,
    cvUrl: input.application.cvUrl,
    cvFileName: input.application.cvFileName,
    status: input.application.status,
    createdAt: input.application.createdAt.toISOString(),
    updatedAt: input.application.updatedAt.toISOString(),
  };
}

export async function findApplicationById(db: Database, id: string) {
  const [row] = await db
    .select({
      application: applications,
      job: jobs,
      company: companies,
      user: users,
    })
    .from(applications)
    .innerJoin(jobs, eq(jobs.id, applications.jobId))
    .innerJoin(companies, eq(companies.id, jobs.companyId))
    .innerJoin(users, eq(users.id, applications.userId))
    .where(and(eq(applications.id, id), isNull(applications.deletedAt)))
    .limit(1);

  return row ?? null;
}

export async function findApplicationByJobAndUser(
  db: Database,
  jobId: number,
  userId: string,
) {
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
    id?: string;
    jobId: number;
    userId: string;
    coverLetter?: string | null;
    cvUrl: string;
    cvFileName?: string | null;
  },
) {
  const [created] = await db
    .insert(applications)
    .values({
      id: input.id,
      jobId: input.jobId,
      userId: input.userId,
      coverLetter: input.coverLetter ?? null,
      cvUrl: input.cvUrl,
      cvFileName: input.cvFileName ?? null,
      status: "applied",
    })
    .returning();

  if (!created) throw new Error("Failed to create application");
  return created;
}

export async function listApplicationsForUser(db: Database, userId: string) {
  const rows = await db
    .select({
      application: applications,
      job: jobs,
      company: companies,
      user: users,
    })
    .from(applications)
    .innerJoin(jobs, eq(jobs.id, applications.jobId))
    .innerJoin(companies, eq(companies.id, jobs.companyId))
    .innerJoin(users, eq(users.id, applications.userId))
    .where(and(eq(applications.userId, userId), isNull(applications.deletedAt)))
    .orderBy(desc(applications.createdAt));

  return rows.map((row) =>
    toPublicApplication({
      application: row.application,
      jobTitle: row.job.title,
      jobSlug: row.job.slug,
      companyName: row.company.companyName,
      user: row.user,
    }),
  );
}

export async function listApplicationsForJobDetailed(
  db: Database,
  jobId: number,
): Promise<EmployerApplicationView[]> {
  const rows = await db
    .select({
      application: applications,
      job: jobs,
      company: companies,
      user: users,
    })
    .from(applications)
    .innerJoin(jobs, eq(jobs.id, applications.jobId))
    .innerJoin(companies, eq(companies.id, jobs.companyId))
    .innerJoin(users, eq(users.id, applications.userId))
    .where(and(eq(applications.jobId, jobId), isNull(applications.deletedAt)))
    .orderBy(desc(applications.createdAt));

  return rows.map((row) => ({
    ...toPublicApplication({
      application: row.application,
      jobTitle: row.job.title,
      jobSlug: row.job.slug,
      companyName: row.company.companyName,
      user: row.user,
    }),
    careerSummary: row.user.careerSummary,
    location: [row.user.city, row.user.country].filter(Boolean).join(", ") || null,
  }));
}

export async function updateApplicationStatus(
  db: Database,
  applicationId: string,
  status: ApplicationStatus,
) {
  const [updated] = await db
    .update(applications)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(applications.id, applicationId), isNull(applications.deletedAt)))
    .returning();
  return updated ?? null;
}

export async function withdrawApplication(db: Database, applicationId: string) {
  return updateApplicationStatus(db, applicationId, "withdrawn");
}
