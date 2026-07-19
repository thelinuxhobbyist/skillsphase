import { and, count, eq, isNull, ne } from "drizzle-orm";
import type { UserRole } from "@horizon/shared";
import type { Database } from "../client";
import { companies } from "../schema/companies";
import { jobs } from "../schema/jobs";
import { userSkills } from "../schema/profile";
import { users } from "../schema/users";

export type AppUser = typeof users.$inferSelect;

export type PublicUser = {
  id: string;
  clerkUserId: string;
  role: UserRole;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  city: string | null;
  country: string | null;
  careerSummary: string | null;
  careerGapNarrative: string | null;
  coverLetterTemplate: string | null;
  profilePhotoUrl: string | null;
  cvUrl: string | null;
  cvFileName: string | null;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export function toPublicUser(user: AppUser): PublicUser {
  return {
    id: user.id,
    clerkUserId: user.clerkUserId,
    role: user.role,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    city: user.city,
    country: user.country,
    careerSummary: user.careerSummary,
    careerGapNarrative: user.careerGapNarrative,
    coverLetterTemplate: user.coverLetterTemplate,
    profilePhotoUrl: user.profilePhotoUrl,
    cvUrl: user.cvUrl,
    cvFileName: user.cvFileName,
    profileCompleted: user.profileCompleted,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function findActiveUserByClerkId(
  db: Database,
  clerkUserId: string,
): Promise<AppUser | null> {
  const [row] = await db
    .select()
    .from(users)
    .where(and(eq(users.clerkUserId, clerkUserId), isNull(users.deletedAt)))
    .limit(1);

  return row ?? null;
}

export async function findUserById(
  db: Database,
  userId: string,
): Promise<AppUser | null> {
  const [row] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  return row ?? null;
}

export async function createAppUser(
  db: Database,
  input: {
    clerkUserId: string;
    role: Exclude<UserRole, "admin">;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  },
): Promise<AppUser> {
  const [created] = await db
    .insert(users)
    .values({
      clerkUserId: input.clerkUserId,
      role: input.role,
      email: input.email,
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
      country: input.role === "job_seeker" ? "GB" : null,
      profileCompleted: false,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create application user");
  }

  return created;
}

export function isProfileComplete(input: {
  firstName: string | null;
  lastName: string | null;
  email: string;
  city: string | null;
  country: string | null;
  careerSummary: string | null;
  skillCount: number;
  hasCv: boolean;
}): boolean {
  return Boolean(
    input.firstName?.trim() &&
      input.lastName?.trim() &&
      input.email.trim() &&
      input.city?.trim() &&
      input.country?.trim() &&
      input.careerSummary?.trim() &&
      input.skillCount >= 1 &&
      input.hasCv,
  );
}

export async function recomputeProfileCompleted(
  db: Database,
  user: AppUser,
): Promise<boolean> {
  if (user.role !== "job_seeker") {
    return false;
  }

  const [skillRow] = await db
    .select({ value: count() })
    .from(userSkills)
    .where(eq(userSkills.userId, user.id));

  return isProfileComplete({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    city: user.city,
    country: user.country,
    careerSummary: user.careerSummary,
    skillCount: Number(skillRow?.value ?? 0),
    hasCv: Boolean(user.cvUrl),
  });
}

export async function updateAppUserProfile(
  db: Database,
  user: AppUser,
  data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string | null;
    city?: string | null;
    country?: string | null;
    careerSummary?: string | null;
    careerGapNarrative?: string | null;
    coverLetterTemplate?: string | null;
  },
): Promise<AppUser> {
  const [updated] = await db
    .update(users)
    .set({
      firstName: data.firstName ?? user.firstName,
      lastName: data.lastName ?? user.lastName,
      phoneNumber:
        data.phoneNumber === undefined ? user.phoneNumber : data.phoneNumber,
      city: data.city === undefined ? user.city : data.city,
      country: data.country === undefined ? user.country : data.country,
      careerSummary:
        data.careerSummary === undefined
          ? user.careerSummary
          : data.careerSummary,
      careerGapNarrative:
        data.careerGapNarrative === undefined
          ? user.careerGapNarrative
          : data.careerGapNarrative,
      coverLetterTemplate:
        data.coverLetterTemplate === undefined
          ? user.coverLetterTemplate
          : data.coverLetterTemplate,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id))
    .returning();

  if (!updated) {
    throw new Error("User not found");
  }

  const profileCompleted = await recomputeProfileCompleted(db, updated);
  const [finalUser] = await db
    .update(users)
    .set({ profileCompleted, updatedAt: new Date() })
    .where(eq(users.id, updated.id))
    .returning();

  return finalUser ?? { ...updated, profileCompleted };
}

export async function softDeleteAppUser(db: Database, userId: string) {
  const deletedAt = new Date();
  await db
    .update(users)
    .set({ deletedAt, updatedAt: deletedAt })
    .where(eq(users.id, userId));
  return deletedAt;
}

export async function employerHasBlockingDependencies(
  db: Database,
  userId: string,
): Promise<boolean> {
  const [company] = await db
    .select()
    .from(companies)
    .where(and(eq(companies.ownerUserId, userId), isNull(companies.deletedAt)))
    .limit(1);

  if (!company) {
    return false;
  }

  const [openJobs] = await db
    .select({ value: count() })
    .from(jobs)
    .where(
      and(
        eq(jobs.companyId, company.id),
        isNull(jobs.deletedAt),
        ne(jobs.status, "closed"),
      ),
    );

  return Number(openJobs?.value ?? 0) > 0;
}

export function extractBootstrapRole(
  metadata: Record<string, unknown> | null | undefined,
): "job_seeker" | "employer" | null {
  if (!metadata) return null;
  const value = metadata.horizonRole;
  if (value === "job_seeker" || value === "employer") {
    return value;
  }
  return null;
}
