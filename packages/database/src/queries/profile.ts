import { and, asc, eq, ilike } from "drizzle-orm";
import type { Database } from "../client";
import {
  education,
  employmentHistory,
  qualifications,
  recommendations,
  skills,
  userSkills,
} from "../schema/profile";
import { users } from "../schema/users";
import { listCapabilitiesForUser } from "./capabilities";
import { listProjectsForUser } from "./projects";
import { recomputeProfileCompleted } from "./users";

export async function listEmploymentHistory(db: Database, userId: string) {
  return db
    .select()
    .from(employmentHistory)
    .where(eq(employmentHistory.userId, userId))
    .orderBy(asc(employmentHistory.startDate));
}

export async function createEmploymentHistory(
  db: Database,
  userId: string,
  input: {
    employerName: string;
    jobTitle: string;
    startDate: string;
    endDate?: string | null;
    currentlyWorking?: boolean;
    description?: string | null;
  },
) {
  const [row] = await db
    .insert(employmentHistory)
    .values({
      userId,
      employerName: input.employerName,
      jobTitle: input.jobTitle,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      currentlyWorking: input.currentlyWorking ?? false,
      description: input.description ?? null,
    })
    .returning();
  if (!row) throw new Error("Failed to create employment history");
  return row;
}

export async function updateEmploymentHistory(
  db: Database,
  userId: string,
  id: string,
  input: {
    employerName: string;
    jobTitle: string;
    startDate: string;
    endDate?: string | null;
    currentlyWorking?: boolean;
    description?: string | null;
  },
) {
  const [row] = await db
    .update(employmentHistory)
    .set({
      employerName: input.employerName,
      jobTitle: input.jobTitle,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      currentlyWorking: input.currentlyWorking ?? false,
      description: input.description ?? null,
    })
    .where(and(eq(employmentHistory.id, id), eq(employmentHistory.userId, userId)))
    .returning();
  if (!row) throw new Error("Employment history not found");
  return row;
}

export async function deleteEmploymentHistory(
  db: Database,
  userId: string,
  id: string,
) {
  await db
    .delete(employmentHistory)
    .where(and(eq(employmentHistory.id, id), eq(employmentHistory.userId, userId)));
}

export async function listEducation(db: Database, userId: string) {
  return db
    .select()
    .from(education)
    .where(eq(education.userId, userId))
    .orderBy(asc(education.startDate));
}

export async function createEducation(
  db: Database,
  userId: string,
  input: {
    institution: string;
    qualification: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
  },
) {
  const [row] = await db
    .insert(education)
    .values({
      userId,
      institution: input.institution,
      qualification: input.qualification,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      description: input.description ?? null,
    })
    .returning();
  if (!row) throw new Error("Failed to create education");
  await syncProfileCompleted(db, userId);
  return row;
}

export async function updateEducation(
  db: Database,
  userId: string,
  id: string,
  input: {
    institution: string;
    qualification: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
  },
) {
  const [row] = await db
    .update(education)
    .set({
      institution: input.institution,
      qualification: input.qualification,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      description: input.description ?? null,
    })
    .where(and(eq(education.id, id), eq(education.userId, userId)))
    .returning();
  if (!row) throw new Error("Education not found");
  return row;
}

export async function deleteEducation(db: Database, userId: string, id: string) {
  await db
    .delete(education)
    .where(and(eq(education.id, id), eq(education.userId, userId)));
  await syncProfileCompleted(db, userId);
}

async function syncProfileCompleted(db: Database, userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return;
  const profileCompleted = await recomputeProfileCompleted(db, user);
  await db
    .update(users)
    .set({ profileCompleted, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function listQualifications(db: Database, userId: string) {
  return db
    .select()
    .from(qualifications)
    .where(eq(qualifications.userId, userId))
    .orderBy(asc(qualifications.name));
}

export async function createQualification(
  db: Database,
  userId: string,
  input: {
    name: string;
    issuingBody?: string | null;
    dateAwarded?: string | null;
    description?: string | null;
  },
) {
  const [row] = await db
    .insert(qualifications)
    .values({
      userId,
      name: input.name,
      issuingBody: input.issuingBody ?? null,
      dateAwarded: input.dateAwarded ?? null,
      description: input.description ?? null,
    })
    .returning();
  if (!row) throw new Error("Failed to create qualification");
  return row;
}

export async function updateQualification(
  db: Database,
  userId: string,
  id: string,
  input: {
    name: string;
    issuingBody?: string | null;
    dateAwarded?: string | null;
    description?: string | null;
  },
) {
  const [row] = await db
    .update(qualifications)
    .set({
      name: input.name,
      issuingBody: input.issuingBody ?? null,
      dateAwarded: input.dateAwarded ?? null,
      description: input.description ?? null,
    })
    .where(and(eq(qualifications.id, id), eq(qualifications.userId, userId)))
    .returning();
  if (!row) throw new Error("Qualification not found");
  return row;
}

export async function deleteQualification(
  db: Database,
  userId: string,
  id: string,
) {
  await db
    .delete(qualifications)
    .where(and(eq(qualifications.id, id), eq(qualifications.userId, userId)));
}

export type RecommendationInput = {
  authorName?: string | null;
  relationship: string;
  publicSummary: string;
  keyThemes?: string[];
  body?: string | null;
  verificationStatus?: "unverified" | "self_attested" | "verified" | null;
};

/** Owner-facing row (includes private referee name + full text + document meta). */
export type OwnerRecommendation = typeof recommendations.$inferSelect;

/** Public trust-signal shape — no referee identity or full document content. */
export type PublicRecommendation = {
  id: string;
  relationship: string;
  publicSummary: string;
  keyThemes: string[];
  verificationStatus: string | null;
  hasFullDocument: boolean;
  createdAt: Date;
};

function normaliseThemes(themes?: string[]) {
  if (!themes) return [];
  return [
    ...new Set(themes.map((theme) => theme.trim()).filter(Boolean)),
  ].slice(0, 8);
}

export function toPublicRecommendation(
  row: OwnerRecommendation,
): PublicRecommendation {
  return {
    id: row.id,
    relationship: row.relationship,
    publicSummary: row.publicSummary,
    keyThemes: row.keyThemes ?? [],
    verificationStatus: row.verificationStatus,
    hasFullDocument: Boolean(row.documentKey || row.body?.trim()),
    createdAt: row.createdAt,
  };
}

export async function listRecommendations(db: Database, userId: string) {
  return db
    .select()
    .from(recommendations)
    .where(eq(recommendations.userId, userId))
    .orderBy(asc(recommendations.createdAt));
}

export async function listPublicRecommendations(db: Database, userId: string) {
  const rows = await listRecommendations(db, userId);
  return rows.map(toPublicRecommendation);
}

export async function createRecommendation(
  db: Database,
  userId: string,
  input: RecommendationInput,
) {
  const [row] = await db
    .insert(recommendations)
    .values({
      userId,
      authorName: input.authorName?.trim() || null,
      relationship: input.relationship,
      publicSummary: input.publicSummary.trim(),
      keyThemes: normaliseThemes(input.keyThemes),
      body: input.body?.trim() || null,
      verificationStatus: input.verificationStatus ?? "self_attested",
    })
    .returning();
  if (!row) throw new Error("Failed to create recommendation");
  return row;
}

export async function updateRecommendation(
  db: Database,
  userId: string,
  id: string,
  input: RecommendationInput,
) {
  const [existing] = await db
    .select()
    .from(recommendations)
    .where(and(eq(recommendations.id, id), eq(recommendations.userId, userId)))
    .limit(1);
  if (!existing) throw new Error("Recommendation not found");

  const [row] = await db
    .update(recommendations)
    .set({
      authorName:
        input.authorName === undefined
          ? existing.authorName
          : input.authorName?.trim() || null,
      relationship: input.relationship,
      publicSummary: input.publicSummary.trim(),
      keyThemes:
        input.keyThemes === undefined
          ? existing.keyThemes
          : normaliseThemes(input.keyThemes),
      body:
        input.body === undefined ? existing.body : input.body?.trim() || null,
      verificationStatus:
        input.verificationStatus === undefined
          ? existing.verificationStatus
          : input.verificationStatus,
      updatedAt: new Date(),
    })
    .where(and(eq(recommendations.id, id), eq(recommendations.userId, userId)))
    .returning();
  if (!row) throw new Error("Recommendation not found");
  return row;
}

export async function deleteRecommendation(
  db: Database,
  userId: string,
  id: string,
) {
  await db
    .delete(recommendations)
    .where(and(eq(recommendations.id, id), eq(recommendations.userId, userId)));
}

export async function listSkills(db: Database, query?: string) {
  if (query?.trim()) {
    return db
      .select()
      .from(skills)
      .where(ilike(skills.name, `%${query.trim()}%`))
      .orderBy(asc(skills.name))
      .limit(50);
  }
  return db.select().from(skills).orderBy(asc(skills.name)).limit(100);
}

export async function listUserSkills(db: Database, userId: string) {
  return db
    .select({
      id: skills.id,
      name: skills.name,
      category: skills.category,
    })
    .from(userSkills)
    .innerJoin(skills, eq(skills.id, userSkills.skillId))
    .where(eq(userSkills.userId, userId))
    .orderBy(asc(skills.name));
}

export async function setUserSkillsByName(
  db: Database,
  userId: string,
  skillNames: string[],
) {
  const normalised = [
    ...new Set(skillNames.map((name) => name.trim()).filter(Boolean)),
  ];

  const skillIds: string[] = [];
  for (const name of normalised) {
    const [existing] = await db
      .select()
      .from(skills)
      .where(eq(skills.name, name))
      .limit(1);

    if (existing) {
      skillIds.push(existing.id);
      continue;
    }

    const [created] = await db
      .insert(skills)
      .values({ name })
      .returning();
    if (created) skillIds.push(created.id);
  }

  await db.delete(userSkills).where(eq(userSkills.userId, userId));
  if (skillIds.length > 0) {
    await db.insert(userSkills).values(
      skillIds.map((skillId) => ({ userId, skillId })),
    );
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user) {
    const profileCompleted = await recomputeProfileCompleted(db, user);
    await db
      .update(users)
      .set({ profileCompleted, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  return listUserSkills(db, userId);
}

export async function getProfileBundle(db: Database, userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;

  const [
    employment,
    educationRows,
    qualificationRows,
    recommendationRows,
    skillRows,
    projectRows,
    capabilityRows,
  ] = await Promise.all([
    listEmploymentHistory(db, userId),
    listEducation(db, userId),
    listQualifications(db, userId),
    listRecommendations(db, userId),
    listUserSkills(db, userId),
    listProjectsForUser(db, userId),
    listCapabilitiesForUser(db, userId),
  ]);

  return {
    user,
    employmentHistory: employment,
    education: educationRows,
    qualifications: qualificationRows,
    recommendations: recommendationRows,
    skills: skillRows,
    projects: projectRows,
    capabilities: capabilityRows,
  };
}
