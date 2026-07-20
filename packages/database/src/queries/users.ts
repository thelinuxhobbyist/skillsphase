import {
  and,
  count,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  lt,
  ne,
  or,
} from "drizzle-orm";
import type { UserRole } from "@horizon/shared";
import type { Database } from "../client";
import { applications } from "../schema/applications";
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
  isRootAdmin: boolean;
  adminRole: string | null;
  adminPermissions: string[] | null;
  lastAdminLoginAt: string | null;
  suspendedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserView = PublicUser & {
  deletedAt: string | null;
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
    isRootAdmin: user.isRootAdmin,
    adminRole: user.adminRole,
    adminPermissions: user.adminPermissions ?? null,
    lastAdminLoginAt: user.lastAdminLoginAt?.toISOString() ?? null,
    suspendedAt: user.suspendedAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function toAdminUserView(user: AppUser): AdminUserView {
  return {
    ...toPublicUser(user),
    deletedAt: user.deletedAt?.toISOString() ?? null,
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

/** Provision an administrator row — never callable from public bootstrap. */
export async function createAdminAppUser(
  db: Database,
  input: {
    clerkUserId: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    isRootAdmin?: boolean;
    adminRole?: string | null;
    adminPermissions?: string[] | null;
    passwordHash: string;
  },
): Promise<AppUser> {
  const isRoot = input.isRootAdmin ?? false;
  const [created] = await db
    .insert(users)
    .values({
      clerkUserId: input.clerkUserId,
      role: "admin",
      email: input.email.toLowerCase(),
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
      profileCompleted: true,
      isRootAdmin: isRoot,
      adminRole: isRoot ? "root" : (input.adminRole ?? "admin"),
      adminPermissions: input.adminPermissions ?? null,
      passwordHash: input.passwordHash,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create admin user");
  }

  return created;
}

export async function updateAdminStaff(
  db: Database,
  userId: string,
  input: {
    email?: string;
    firstName?: string | null;
    lastName?: string | null;
    isRootAdmin?: boolean;
    adminRole?: string | null;
    adminPermissions?: string[] | null;
    passwordHash?: string;
  },
): Promise<AppUser | null> {
  const [updated] = await db
    .update(users)
    .set({
      ...(input.email !== undefined
        ? { email: input.email.toLowerCase() }
        : {}),
      ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
      ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
      ...(input.isRootAdmin !== undefined
        ? { isRootAdmin: input.isRootAdmin }
        : {}),
      ...(input.adminRole !== undefined ? { adminRole: input.adminRole } : {}),
      ...(input.adminPermissions !== undefined
        ? { adminPermissions: input.adminPermissions }
        : {}),
      ...(input.passwordHash !== undefined
        ? { passwordHash: input.passwordHash }
        : {}),
      updatedAt: new Date(),
    })
    .where(
      and(eq(users.id, userId), eq(users.role, "admin"), isNull(users.deletedAt)),
    )
    .returning();
  return updated ?? null;
}

export async function countRootAdmins(db: Database): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(users)
    .where(
      and(
        eq(users.role, "admin"),
        eq(users.isRootAdmin, true),
        isNull(users.deletedAt),
      ),
    );
  return Number(row?.value ?? 0);
}

export async function touchAdminLogin(db: Database, userId: string) {
  const [updated] = await db
    .update(users)
    .set({ lastAdminLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  return updated ?? null;
}

export async function findUserByEmail(
  db: Database,
  email: string,
): Promise<AppUser | null> {
  const [row] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email.toLowerCase()), isNull(users.deletedAt)))
    .limit(1);
  return row ?? null;
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

export async function listUsersForAdmin(
  db: Database,
  filters?: { role?: UserRole; q?: string },
): Promise<AdminUserView[]> {
  const conditions = [isNull(users.deletedAt)];
  if (filters?.role) {
    conditions.push(eq(users.role, filters.role));
  }
  if (filters?.q?.trim()) {
    const q = `%${filters.q.trim()}%`;
    conditions.push(
      or(
        ilike(users.email, q),
        ilike(users.firstName, q),
        ilike(users.lastName, q),
      )!,
    );
  }

  const rows = await db
    .select()
    .from(users)
    .where(and(...conditions))
    .orderBy(desc(users.createdAt))
    .limit(200);

  return rows.map(toAdminUserView);
}

export async function suspendAppUser(db: Database, userId: string) {
  const suspendedAt = new Date();
  const [updated] = await db
    .update(users)
    .set({ suspendedAt, updatedAt: suspendedAt })
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .returning();
  return updated ?? null;
}

export async function reactivateAppUser(db: Database, userId: string) {
  const [updated] = await db
    .update(users)
    .set({ suspendedAt: null, updatedAt: new Date() })
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .returning();
  return updated ?? null;
}

export async function countUsersByRole(db: Database, role: UserRole) {
  const [row] = await db
    .select({ value: count() })
    .from(users)
    .where(and(eq(users.role, role), isNull(users.deletedAt)));
  return Number(row?.value ?? 0);
}

export async function countPendingApplications(db: Database) {
  const [row] = await db
    .select({ value: count() })
    .from(applications)
    .where(
      and(
        eq(applications.status, "applied"),
        isNull(applications.deletedAt),
      ),
    );
  return Number(row?.value ?? 0);
}

export async function listRecentUsers(db: Database, limit = 8) {
  const rows = await db
    .select()
    .from(users)
    .where(isNull(users.deletedAt))
    .orderBy(desc(users.createdAt))
    .limit(limit);
  return rows.map(toAdminUserView);
}

/**
 * After retention: remove seeker rows (profile cascades); anonymise employers
 * so FK-restricted company/job history remains auditable without PII.
 */
export async function purgeExpiredSoftDeletedUsers(
  db: Database,
  retentionDays: number,
) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);

  const expired = await db
    .select()
    .from(users)
    .where(and(isNotNull(users.deletedAt), lt(users.deletedAt, cutoff)))
    .limit(100);

  let purged = 0;
  for (const user of expired) {
    if (user.role === "job_seeker") {
      await db.delete(applications).where(eq(applications.userId, user.id));
      await db.delete(users).where(eq(users.id, user.id));
      purged += 1;
      continue;
    }

    await db
      .update(companies)
      .set({ deletedAt: user.deletedAt ?? new Date(), updatedAt: new Date() })
      .where(eq(companies.ownerUserId, user.id));

    await db
      .update(users)
      .set({
        email: `deleted+${user.id}@horizon.invalid`,
        firstName: null,
        lastName: null,
        phoneNumber: null,
        city: null,
        careerSummary: null,
        careerGapNarrative: null,
        coverLetterTemplate: null,
        profilePhotoUrl: null,
        cvUrl: null,
        cvFileName: null,
        clerkUserId: `deleted_${user.id}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
    purged += 1;
  }

  return { scanned: expired.length, purged };
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
