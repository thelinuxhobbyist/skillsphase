import { and, asc, eq } from "drizzle-orm";
import type { Database } from "../client";
import { projects, type ProjectMediaItem } from "../schema/marketplace";

export type ProjectInput = {
  title: string;
  description?: string | null;
  role?: string | null;
  projectUrl?: string | null;
  media?: ProjectMediaItem[];
  sortOrder?: number;
};

export async function listProjectsForUser(db: Database, userId: string) {
  return db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(asc(projects.sortOrder), asc(projects.createdAt));
}

export async function createProject(
  db: Database,
  userId: string,
  input: ProjectInput,
) {
  const [row] = await db
    .insert(projects)
    .values({
      userId,
      title: input.title,
      description: input.description ?? null,
      role: input.role ?? null,
      projectUrl: input.projectUrl ?? null,
      media: input.media ?? [],
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

  const [row] = await db
    .update(projects)
    .set({
      title: input.title ?? existing.title,
      description:
        input.description === undefined ? existing.description : input.description,
      role: input.role === undefined ? existing.role : input.role,
      projectUrl:
        input.projectUrl === undefined ? existing.projectUrl : input.projectUrl,
      media: input.media ?? existing.media,
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
