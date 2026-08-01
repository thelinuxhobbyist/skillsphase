import {
  and,
  count,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  lt,
  or,
} from "drizzle-orm";
import type { AvailabilityOption, RemoteType, UserRole } from "@horizon/shared";
import type { Database } from "../client";
import { companies } from "../schema/companies";
import { education, userSkills } from "../schema/profile";
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
  profilePhotoUrl: string | null;
  professionalTitle: string | null;
  primaryCapability: string | null;
  remotePreference: RemoteType | null;
  availability: AvailabilityOption | null;
  yearsExperience: number | null;
  salaryMin: string | null;
  salaryMax: string | null;
  salaryCurrency: string;
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
    profilePhotoUrl: user.profilePhotoUrl,
    professionalTitle: user.professionalTitle,
    primaryCapability: user.primaryCapability,
    remotePreference: user.remotePreference,
    availability: user.availability,
    yearsExperience: user.yearsExperience,
    salaryMin: user.salaryMin,
    salaryMax: user.salaryMax,
    salaryCurrency: user.salaryCurrency,
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

/**
 * Idempotent by clerk_user_id: concurrent bootstrap calls (the register page and
 * the onboarding sync can both fire) must not fail on the unique constraint.
 */
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
  // Neon HTTP from Workers can flake on cold starts — retry briefly before failing.
  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
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
        .onConflictDoNothing({ target: users.clerkUserId })
        .returning();

      if (created) {
        return created;
      }

      const existing = await findUserByClerkId(db, input.clerkUserId);
      if (!existing) {
        throw new Error("Failed to create application user");
      }

      return existing;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
        continue;
      }
    }
  }

  const cause =
    lastError && typeof lastError === "object" && "cause" in lastError
      ? (lastError as { cause?: unknown }).cause
      : undefined;
  console.error(
    JSON.stringify({
      level: "error",
      message: "create_app_user_failed",
      clerkUserId: input.clerkUserId,
      detail: lastError instanceof Error ? lastError.message : String(lastError),
      cause: cause instanceof Error ? cause.message : cause,
    }),
  );

  throw new Error("Unable to create your account. Please try again.");
}

/** Lookup by Clerk id regardless of soft-delete state. */
export async function findUserByClerkId(
  db: Database,
  clerkUserId: string,
): Promise<AppUser | null> {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  return row ?? null;
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

/** Admin login must not pick up a Clerk candidate/business row with the same email. */
export async function findAdminUserByEmail(
  db: Database,
  email: string,
): Promise<AppUser | null> {
  const [row] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.email, email.toLowerCase()),
        eq(users.role, "admin"),
        isNull(users.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

/** Minimum skills required before a candidate's Skill Profile counts as complete. */
export const MIN_PROFILE_SKILLS = 3;

export function isProfileComplete(input: {
  firstName: string | null;
  lastName: string | null;
  email: string;
  city: string | null;
  professionalTitle: string | null;
  skillCount: number;
  educationCount: number;
}): boolean {
  return Boolean(
    input.firstName?.trim() &&
      input.lastName?.trim() &&
      input.email.trim() &&
      input.city?.trim() &&
      input.professionalTitle?.trim() &&
      input.skillCount >= MIN_PROFILE_SKILLS &&
      input.educationCount >= 1,
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
  const [educationRow] = await db
    .select({ value: count() })
    .from(education)
    .where(eq(education.userId, user.id));

  return isProfileComplete({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    city: user.city,
    professionalTitle: user.professionalTitle,
    skillCount: Number(skillRow?.value ?? 0),
    educationCount: Number(educationRow?.value ?? 0),
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
    professionalTitle?: string | null;
    primaryCapability?: string | null;
    remotePreference?: RemoteType | null;
    availability?: AvailabilityOption | null;
    yearsExperience?: number | null;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryCurrency?: string;
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
      professionalTitle:
        data.professionalTitle === undefined
          ? user.professionalTitle
          : data.professionalTitle,
      primaryCapability:
        data.primaryCapability === undefined
          ? user.primaryCapability
          : data.primaryCapability,
      remotePreference:
        data.remotePreference === undefined
          ? user.remotePreference
          : data.remotePreference,
      availability:
        data.availability === undefined ? user.availability : data.availability,
      yearsExperience:
        data.yearsExperience === undefined
          ? user.yearsExperience
          : data.yearsExperience,
      salaryMin:
        data.salaryMin === undefined
          ? user.salaryMin
          : data.salaryMin === null
            ? null
            : String(data.salaryMin),
      salaryMax:
        data.salaryMax === undefined
          ? user.salaryMax
          : data.salaryMax === null
            ? null
            : String(data.salaryMax),
      salaryCurrency: data.salaryCurrency ?? user.salaryCurrency,
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
 * After retention: remove candidate rows (profile cascades via FKs); anonymise
 * businesses so FK-restricted company history remains auditable without PII.
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
        profilePhotoUrl: null,
        clerkUserId: `deleted_${user.id}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
    purged += 1;
  }

  return { scanned: expired.length, purged };
}

/** Businesses can always delete their account; contacts/saves cascade with the company. */
export async function employerHasBlockingDependencies(
  _db: Database,
  _userId: string,
): Promise<boolean> {
  return false;
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
