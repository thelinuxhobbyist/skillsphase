import { and, asc, desc, eq } from "drizzle-orm";
import type { Database } from "../client";
import { projects, type ProjectMediaItem } from "../schema/marketplace";

export type ProjectInput = {
  title: string;
  description?: string | null;
  outcome?: string | null;
  role?: string | null;
  projectUrl?: string | null;
  technologies?: string[];
  media?: ProjectMediaItem[];
  featured?: boolean;
  sortOrder?: number;
};

function normaliseTechnologies(values?: string[]) {
  if (!values) return [];
  return [
    ...new Set(values.map((value) => value.trim()).filter(Boolean)),
  ].slice(0, 20);
}

export async function listProjectsForUser(db: Database, userId: string) {
  return db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.featured), asc(projects.sortOrder), asc(projects.createdAt));
}

async function clearFeaturedProjects(db: Database, userId: string) {
  await db
    .update(projects)
    .set({ featured: false, updatedAt: new Date() })
    .where(eq(projects.userId, userId));
}

export async function createProject(
  db: Database,
  userId: string,
  input: ProjectInput,
) {
  const featured = input.featured === true;
  if (featured) {
    await clearFeaturedProjects(db, userId);
  }

  const [row] = await db
    .insert(projects)
    .values({
      userId,
      title: input.title,
      description: input.description ?? null,
      outcome: input.outcome ?? null,
      role: input.role ?? null,
      projectUrl: input.projectUrl ?? null,
      technologies: normaliseTechnologies(input.technologies),
      media: input.media ?? [],
      featured,
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();
  if (!row) throw new Error("Failed to create project");
  return row;
}

export async function updateProject(
  db: Database,
  userId: string,
  id: string,
  input: Partial<ProjectInput>,
) {
  const [existing] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .limit(1);
  if (!existing) throw new Error("Project not found");

  const featured =
    input.featured === undefined ? existing.featured : input.featured === true;
  if (featured && !existing.featured) {
    await clearFeaturedProjects(db, userId);
  }

  const [row] = await db
    .update(projects)
    .set({
      title: input.title ?? existing.title,
      description:
        input.description === undefined ? existing.description : input.description,
      outcome: input.outcome === undefined ? existing.outcome : input.outcome,
      role: input.role === undefined ? existing.role : input.role,
      projectUrl:
        input.projectUrl === undefined ? existing.projectUrl : input.projectUrl,
      technologies:
        input.technologies === undefined
          ? existing.technologies
          : normaliseTechnologies(input.technologies),
      media: input.media ?? existing.media,
      featured,
      sortOrder: input.sortOrder ?? existing.sortOrder,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .returning();
  if (!row) throw new Error("Project not found");
  return row;
}

export async function deleteProject(db: Database, userId: string, id: string) {
  await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)));
}

export async function findProjectById(
  db: Database,
  userId: string,
  id: string,
) {
  const [row] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .limit(1);
  return row ?? null;
}
