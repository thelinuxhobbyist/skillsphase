import { and, asc, desc, eq, inArray } from "drizzle-orm";
import type { Database } from "../client";
import {
  candidateCapabilities,
  capabilityProjects,
  capabilitySkills,
} from "../schema/capabilities";
import { projects } from "../schema/marketplace";
import { skills } from "../schema/profile";
import { users } from "../schema/users";

export type CapabilityInput = {
  label: string;
  isPrimary?: boolean;
  sortOrder?: number;
  skillNames?: string[];
  projectIds?: string[];
};

export type CapabilityView = {
  id: string;
  label: string;
  isPrimary: boolean;
  sortOrder: number;
  skillNames: string[];
  projectIds: string[];
  projects: Array<{ id: string; title: string; outcome: string | null }>;
  outcomes: string[];
  /** Reserved for Phase 2C trust signals. */
  confidence: string | null;
  lastDemonstratedAt: Date | null;
  verificationStatus: string | null;
};

const MAX_CAPABILITIES = 8;

async function resolveSkillIds(db: Database, skillNames: string[]) {
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
    const [created] = await db.insert(skills).values({ name }).returning();
    if (created) skillIds.push(created.id);
  }
  return skillIds;
}

async function ownedProjectIds(
  db: Database,
  userId: string,
  projectIds: string[],
) {
  if (projectIds.length === 0) return [];
  const rows = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.userId, userId), inArray(projects.id, projectIds)));
  return rows.map((row) => row.id);
}

export async function listCapabilitiesForUser(
  db: Database,
  userId: string,
): Promise<CapabilityView[]> {
  const rows = await db
    .select()
    .from(candidateCapabilities)
    .where(eq(candidateCapabilities.userId, userId))
    .orderBy(
      desc(candidateCapabilities.isPrimary),
      asc(candidateCapabilities.sortOrder),
      asc(candidateCapabilities.createdAt),
    );

  if (rows.length === 0) return [];

  const capabilityIds = rows.map((row) => row.id);
  const [skillLinks, projectLinks] = await Promise.all([
    db
      .select({
        capabilityId: capabilitySkills.capabilityId,
        skillId: skills.id,
        skillName: skills.name,
      })
      .from(capabilitySkills)
      .innerJoin(skills, eq(skills.id, capabilitySkills.skillId))
      .where(inArray(capabilitySkills.capabilityId, capabilityIds)),
    db
      .select({
        capabilityId: capabilityProjects.capabilityId,
        projectId: projects.id,
        title: projects.title,
        outcome: projects.outcome,
      })
      .from(capabilityProjects)
      .innerJoin(projects, eq(projects.id, capabilityProjects.projectId))
      .where(inArray(capabilityProjects.capabilityId, capabilityIds)),
  ]);

  return rows.map((row) => {
    const linkedSkills = skillLinks.filter((link) => link.capabilityId === row.id);
    const linkedProjects = projectLinks.filter(
      (link) => link.capabilityId === row.id,
    );
    const outcomes = linkedProjects
      .map((link) => link.outcome?.trim())
      .filter((value): value is string => Boolean(value));

    return {
      id: row.id,
      label: row.label,
      isPrimary: row.isPrimary,
      sortOrder: row.sortOrder,
      skillNames: linkedSkills.map((link) => link.skillName),
      projectIds: linkedProjects.map((link) => link.projectId),
      projects: linkedProjects.map((link) => ({
        id: link.projectId,
        title: link.title,
        outcome: link.outcome,
      })),
      outcomes,
      confidence: row.confidence,
      lastDemonstratedAt: row.lastDemonstratedAt,
      verificationStatus: row.verificationStatus,
    };
  });
}

/** Replace all capabilities for a user and sync users.primary_capability. */
export async function setCapabilitiesForUser(
  db: Database,
  userId: string,
  inputs: CapabilityInput[],
): Promise<CapabilityView[]> {
  const cleaned = inputs
    .map((input, index) => ({
      label: input.label.trim(),
      isPrimary: input.isPrimary === true,
      sortOrder: input.sortOrder ?? index,
      skillNames: input.skillNames ?? [],
      projectIds: input.projectIds ?? [],
    }))
    .filter((input) => input.label.length > 0)
    .slice(0, MAX_CAPABILITIES);

  if (cleaned.length > 0 && !cleaned.some((input) => input.isPrimary)) {
    cleaned[0]!.isPrimary = true;
  }

  let primarySeen = false;
  for (const input of cleaned) {
    if (input.isPrimary) {
      if (primarySeen) input.isPrimary = false;
      else primarySeen = true;
    }
  }

  await db
    .delete(candidateCapabilities)
    .where(eq(candidateCapabilities.userId, userId));

  const primaryLabel =
    cleaned.find((input) => input.isPrimary)?.label ??
    cleaned[0]?.label ??
    null;

  await db
    .update(users)
    .set({
      primaryCapability: primaryLabel,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  for (const input of cleaned) {
    const [row] = await db
      .insert(candidateCapabilities)
      .values({
        userId,
        label: input.label,
        isPrimary: input.isPrimary,
        sortOrder: input.sortOrder,
      })
      .returning();
    if (!row) continue;

    const skillIds = await resolveSkillIds(db, input.skillNames);
    if (skillIds.length > 0) {
      await db.insert(capabilitySkills).values(
        skillIds.map((skillId) => ({
          capabilityId: row.id,
          skillId,
        })),
      );
    }

    const projectIds = await ownedProjectIds(db, userId, input.projectIds);
    if (projectIds.length > 0) {
      await db.insert(capabilityProjects).values(
        projectIds.map((projectId) => ({
          capabilityId: row.id,
          projectId,
        })),
      );
    }
  }

  return listCapabilitiesForUser(db, userId);
}

export function pickCardCapabilities(capabilities: CapabilityView[]) {
  const primary =
    capabilities.find((cap) => cap.isPrimary)?.label ??
    capabilities[0]?.label ??
    null;
  const additional =
    capabilities.find((cap) => !cap.isPrimary && cap.label !== primary)?.label ??
    null;
  return { primaryCapability: primary, additionalCapability: additional };
}
