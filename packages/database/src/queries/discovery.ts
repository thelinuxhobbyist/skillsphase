import { and, asc, desc, eq, gte, ilike, inArray, isNull, notInArray, sql } from "drizzle-orm";
import type { AvailabilityOption, RemoteType } from "@horizon/shared";
import type { Database } from "../client";
import {
  candidateLists,
  candidateReviews,
  savedCandidates,
} from "../schema/marketplace";
import { skills, userSkills } from "../schema/profile";
import { users } from "../schema/users";
import {
  listCapabilitiesForUser,
  pickCardCapabilities,
} from "./capabilities";
import { listProjectsForUser } from "./projects";
import {
  listEducation,
  listEmploymentHistory,
  listPublicRecommendations,
  listQualifications,
  listUserSkills,
} from "./profile";

export type DiscoveryFilters = {
  skillNames?: string[];
  availability?: AvailabilityOption;
  remotePreference?: RemoteType;
  minYearsExperience?: number;
  keyword?: string;
};

export type CandidateCard = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  professionalTitle: string | null;
  primaryCapability: string | null;
  /** First additional capability for lightweight browse cards. */
  additionalCapability: string | null;
  city: string | null;
  remotePreference: RemoteType | null;
  availability: AvailabilityOption | null;
  yearsExperience: number | null;
  profilePhotoUrl: string | null;
  skills: string[];
  topProject: string | null;
};

async function candidatesToCards(
  db: Database,
  rows: (typeof users.$inferSelect)[],
): Promise<CandidateCard[]> {
  const cards: CandidateCard[] = [];
  for (const row of rows) {
    const [skillRows, projectRows, capabilityRows] = await Promise.all([
      listUserSkills(db, row.id),
      listProjectsForUser(db, row.id),
      listCapabilitiesForUser(db, row.id),
    ]);
    const cardCapabilities = pickCardCapabilities(capabilityRows);
    cards.push({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      professionalTitle: row.professionalTitle,
      primaryCapability:
        cardCapabilities.primaryCapability ?? row.primaryCapability,
      additionalCapability: cardCapabilities.additionalCapability,
      city: row.city,
      remotePreference: row.remotePreference,
      availability: row.availability,
      yearsExperience: row.yearsExperience,
      profilePhotoUrl: row.profilePhotoUrl,
      skills: skillRows.map((s) => s.name),
      topProject:
        projectRows.find((p) => p.featured)?.title ??
        projectRows[0]?.title ??
        null,
    });
  }
  return cards;
}

/** Candidates not yet skipped/viewed by this business, newest-complete-profile first. */
export async function listDiscoveryFeed(
  db: Database,
  companyId: string,
  filters: DiscoveryFilters,
  limit = 20,
): Promise<CandidateCard[]> {
  const reviewed = await db
    .select({ candidateUserId: candidateReviews.candidateUserId })
    .from(candidateReviews)
    .where(eq(candidateReviews.companyId, companyId));
  const reviewedIds = reviewed.map((r) => r.candidateUserId);

  const conditions = [
    eq(users.role, "job_seeker"),
    isNull(users.deletedAt),
    eq(users.profileCompleted, true),
  ];
  if (reviewedIds.length > 0) {
    conditions.push(notInArray(users.id, reviewedIds));
  }
  if (filters.availability) {
    conditions.push(eq(users.availability, filters.availability));
  }
  if (filters.remotePreference) {
    conditions.push(eq(users.remotePreference, filters.remotePreference));
  }
  if (filters.minYearsExperience !== undefined) {
    conditions.push(gte(users.yearsExperience, filters.minYearsExperience));
  }
  if (filters.keyword?.trim()) {
    {
      const keyword = `%${filters.keyword.trim()}%`;
      conditions.push(
        sql`(${users.professionalTitle} ILIKE ${keyword} OR ${users.primaryCapability} ILIKE ${keyword})`,
      );
    }
  }

  let candidateIds: string[] | null = null;
  if (filters.skillNames && filters.skillNames.length > 0) {
    const matches = await db
      .select({ userId: userSkills.userId })
      .from(userSkills)
      .innerJoin(skills, eq(skills.id, userSkills.skillId))
      .where(inArray(skills.name, filters.skillNames));
    candidateIds = [...new Set(matches.map((m) => m.userId))];
    if (candidateIds.length === 0) return [];
    conditions.push(inArray(users.id, candidateIds));
  }

  const rows = await db
    .select()
    .from(users)
    .where(and(...conditions))
    .orderBy(desc(users.createdAt))
    .limit(limit);

  return candidatesToCards(db, rows);
}

function buildDiscoveryConditions(filters: DiscoveryFilters) {
  const conditions = [
    eq(users.role, "job_seeker"),
    isNull(users.deletedAt),
    eq(users.profileCompleted, true),
  ];
  if (filters.availability) {
    conditions.push(eq(users.availability, filters.availability));
  }
  if (filters.remotePreference) {
    conditions.push(eq(users.remotePreference, filters.remotePreference));
  }
  if (filters.minYearsExperience !== undefined) {
    conditions.push(gte(users.yearsExperience, filters.minYearsExperience));
  }
  if (filters.keyword?.trim()) {
    {
      const keyword = `%${filters.keyword.trim()}%`;
      conditions.push(
        sql`(${users.professionalTitle} ILIKE ${keyword} OR ${users.primaryCapability} ILIKE ${keyword})`,
      );
    }
  }
  return conditions;
}

/**
 * Public, unauthenticated preview of the candidate pool — full skill-profile
 * data (name, location, skills, experience) so anyone can browse like a
 * normal job board. Contacting or saving a candidate still requires a
 * verified business login.
 */
export async function listPublicDiscoveryFeed(
  db: Database,
  filters: DiscoveryFilters,
  limit = 12,
  offset = 0,
): Promise<CandidateCard[]> {
  const conditions = buildDiscoveryConditions(filters);

  let candidateIds: string[] | null = null;
  if (filters.skillNames && filters.skillNames.length > 0) {
    const matches = await db
      .select({ userId: userSkills.userId })
      .from(userSkills)
      .innerJoin(skills, eq(skills.id, userSkills.skillId))
      .where(inArray(skills.name, filters.skillNames));
    candidateIds = [...new Set(matches.map((m) => m.userId))];
    if (candidateIds.length === 0) return [];
    conditions.push(inArray(users.id, candidateIds));
  }

  const rows = await db
    .select()
    .from(users)
    .where(and(...conditions))
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  return candidatesToCards(db, rows);
}

/** Public candidate profile — same data a signed-in business sees, minus any
 * action to contact/save (that's gated separately). Only exposes candidates
 * with a completed, discoverable Skill Profile. */
export async function getPublicCandidateDetail(db: Database, candidateUserId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.id, candidateUserId),
        eq(users.role, "job_seeker"),
        eq(users.profileCompleted, true),
        isNull(users.deletedAt),
      ),
    )
    .limit(1);
  if (!user) return null;

  const [
    skillRows,
    projectRows,
    employment,
    education,
    qualifications,
    recommendationRows,
    capabilityRows,
  ] = await Promise.all([
    listUserSkills(db, candidateUserId),
    listProjectsForUser(db, candidateUserId),
    listEmploymentHistory(db, candidateUserId),
    listEducation(db, candidateUserId),
    listQualifications(db, candidateUserId),
    listPublicRecommendations(db, candidateUserId),
    listCapabilitiesForUser(db, candidateUserId),
  ]);

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    professionalTitle: user.professionalTitle,
    primaryCapability: user.primaryCapability,
    city: user.city,
    country: user.country,
    careerSummary: user.careerSummary,
    profilePhotoUrl: user.profilePhotoUrl,
    remotePreference: user.remotePreference,
    availability: user.availability,
    yearsExperience: user.yearsExperience,
    salaryMin: user.salaryMin,
    salaryMax: user.salaryMax,
    salaryCurrency: user.salaryCurrency,
    capabilities: capabilityRows,
    skills: skillRows,
    projects: projectRows,
    employmentHistory: employment,
    education,
    qualifications,
    recommendations: recommendationRows,
  };
}

export async function countPublicDiscoveryFeed(
  db: Database,
  filters: DiscoveryFilters,
): Promise<number> {
  const conditions = buildDiscoveryConditions(filters);

  if (filters.skillNames && filters.skillNames.length > 0) {
    const matches = await db
      .select({ userId: userSkills.userId })
      .from(userSkills)
      .innerJoin(skills, eq(skills.id, userSkills.skillId))
      .where(inArray(skills.name, filters.skillNames));
    const candidateIds = [...new Set(matches.map((m) => m.userId))];
    if (candidateIds.length === 0) return 0;
    conditions.push(inArray(users.id, candidateIds));
  }

  const [row] = await db
    .select({ value: sql<number>`count(*)` })
    .from(users)
    .where(and(...conditions));
  return Number(row?.value ?? 0);
}

export async function recordCandidateReview(
  db: Database,
  companyId: string,
  candidateUserId: string,
  action: "skip" | "viewed",
) {
  await db
    .insert(candidateReviews)
    .values({ companyId, candidateUserId, action })
    .onConflictDoUpdate({
      target: [candidateReviews.companyId, candidateReviews.candidateUserId],
      set: { action },
    });
}

export async function getCandidateDetail(db: Database, candidateUserId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, candidateUserId), eq(users.role, "job_seeker"), isNull(users.deletedAt)))
    .limit(1);
  if (!user) return null;

  const [
    skillRows,
    projectRows,
    employment,
    education,
    qualifications,
    recommendationRows,
    capabilityRows,
  ] = await Promise.all([
    listUserSkills(db, candidateUserId),
    listProjectsForUser(db, candidateUserId),
    listEmploymentHistory(db, candidateUserId),
    listEducation(db, candidateUserId),
    listQualifications(db, candidateUserId),
    listPublicRecommendations(db, candidateUserId),
    listCapabilitiesForUser(db, candidateUserId),
  ]);

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    professionalTitle: user.professionalTitle,
    primaryCapability: user.primaryCapability,
    city: user.city,
    country: user.country,
    careerSummary: user.careerSummary,
    profilePhotoUrl: user.profilePhotoUrl,
    remotePreference: user.remotePreference,
    availability: user.availability,
    yearsExperience: user.yearsExperience,
    salaryMin: user.salaryMin,
    salaryMax: user.salaryMax,
    salaryCurrency: user.salaryCurrency,
    capabilities: capabilityRows,
    skills: skillRows,
    projects: projectRows,
    employmentHistory: employment,
    education,
    qualifications,
    recommendations: recommendationRows,
  };
}

export async function listCandidateLists(db: Database, companyId: string) {
  return db
    .select()
    .from(candidateLists)
    .where(eq(candidateLists.companyId, companyId))
    .orderBy(asc(candidateLists.name));
}

export async function createCandidateList(
  db: Database,
  companyId: string,
  name: string,
) {
  const [row] = await db
    .insert(candidateLists)
    .values({ companyId, name })
    .returning();
  if (!row) throw new Error("Failed to create list");
  return row;
}

export async function saveCandidate(
  db: Database,
  companyId: string,
  candidateUserId: string,
  listId?: string | null,
) {
  const [row] = await db
    .insert(savedCandidates)
    .values({ companyId, candidateUserId, listId: listId ?? null })
    .onConflictDoUpdate({
      target: [savedCandidates.companyId, savedCandidates.candidateUserId],
      set: { listId: listId ?? null },
    })
    .returning();
  return row;
}

export async function unsaveCandidate(
  db: Database,
  companyId: string,
  candidateUserId: string,
) {
  await db
    .delete(savedCandidates)
    .where(
      and(
        eq(savedCandidates.companyId, companyId),
        eq(savedCandidates.candidateUserId, candidateUserId),
      ),
    );
}

export async function listSavedCandidates(db: Database, companyId: string) {
  const rows = await db
    .select({ saved: savedCandidates, candidate: users })
    .from(savedCandidates)
    .innerJoin(users, eq(users.id, savedCandidates.candidateUserId))
    .where(eq(savedCandidates.companyId, companyId))
    .orderBy(desc(savedCandidates.createdAt));

  const cards = await candidatesToCards(db, rows.map((r) => r.candidate));
  return rows.map((r, i) => ({
    savedAt: r.saved.createdAt.toISOString(),
    listId: r.saved.listId,
    candidate: cards[i],
  }));
}

export async function countCandidatesWithCompleteProfile(db: Database) {
  const [row] = await db
    .select({ value: sql<number>`count(*)` })
    .from(users)
    .where(
      and(
        eq(users.role, "job_seeker"),
        eq(users.profileCompleted, true),
        isNull(users.deletedAt),
      ),
    );
  return Number(row?.value ?? 0);
}
