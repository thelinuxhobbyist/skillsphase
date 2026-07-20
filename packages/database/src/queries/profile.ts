import { and, asc, eq, ilike } from "drizzle-orm";
import type { Database } from "../client";
import {
  education,
  employmentHistory,
  qualifications,
  skills,
  userSkills,
} from "../schema/profile";
import { users } from "../schema/users";
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

export async function updateUserCv(
  db: Database,
  userId: string,
  input: { cvUrl: string | null; cvFileName: string | null },
) {
  const [updated] = await db
    .update(users)
    .set({
      cvUrl: input.cvUrl,
      cvFileName: input.cvFileName,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  if (!updated) throw new Error("User not found");

  const profileCompleted = await recomputeProfileCompleted(db, updated);
  const [finalUser] = await db
    .update(users)
    .set({ profileCompleted, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  return finalUser ?? { ...updated, profileCompleted };
}

export async function getProfileBundle(db: Database, userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;

  const [employment, educationRows, qualificationRows, skillRows] =
    await Promise.all([
      listEmploymentHistory(db, userId),
      listEducation(db, userId),
      listQualifications(db, userId),
      listUserSkills(db, userId),
    ]);

  return {
    user,
    employmentHistory: employment,
    education: educationRows,
    qualifications: qualificationRows,
    skills: skillRows,
  };
}
