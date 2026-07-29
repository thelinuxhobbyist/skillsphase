import { asc, eq, inArray, sql } from "drizzle-orm";
import {
  defaultContentForType,
  filterHomepageBodySections,
  getDefaultHomepageSections,
  getDefaultFooterSection,
  HOMEPAGE_SECTION_LABELS,
  type HomepageSection,
  type HomepageSectionType,
} from "@horizon/shared";
import type { Database } from "../client";
import { homepageSections } from "../schema/homepage";

function toPublic(row: typeof homepageSections.$inferSelect): HomepageSection {
  return {
    id: row.id,
    type: row.type as HomepageSectionType,
    enabled: row.enabled,
    sortOrder: row.sortOrder,
    label: row.label,
    content: (row.content ?? {}) as Record<string, unknown>,
  };
}

export async function listHomepageSections(db: Database): Promise<HomepageSection[]> {
  const rows = await db
    .select()
    .from(homepageSections)
    .orderBy(asc(homepageSections.sortOrder), asc(homepageSections.createdAt));
  return rows.map(toPublic);
}

/** Seed defaults on first use so admin and public share one template. */
export async function ensureHomepageSections(
  db: Database,
): Promise<HomepageSection[]> {
  const existing = await listHomepageSections(db);
  if (existing.length === 0) {
    const defaults = getDefaultHomepageSections();
    await db.insert(homepageSections).values(
      defaults.map((section) => ({
        type: section.type,
        enabled: section.enabled,
        sortOrder: section.sortOrder,
        label: section.label,
        content: section.content,
      })),
    );
    return listHomepageSections(db);
  }

  const existingTypes = new Set(existing.map((section) => section.type));
  const missing = getDefaultHomepageSections().filter(
    (section) => !existingTypes.has(section.type),
  );
  if (missing.length > 0) {
    await db.insert(homepageSections).values(
      missing.map((section) => ({
        type: section.type,
        enabled: section.enabled,
        sortOrder: section.sortOrder,
        label: section.label,
        content: section.content,
      })),
    );
  }

  return listHomepageSections(db);
}

export async function listEnabledHomepageSections(
  db: Database,
): Promise<HomepageSection[]> {
  const all = await ensureHomepageSections(db);
  return filterHomepageBodySections(all);
}

export async function getFooterSection(
  db: Database,
): Promise<HomepageSection> {
  const all = await ensureHomepageSections(db);
  const footer = all.find((section) => section.type === "footer");
  return footer ?? getDefaultFooterSection();
}

export async function findHomepageSectionById(db: Database, id: string) {
  const [row] = await db
    .select()
    .from(homepageSections)
    .where(eq(homepageSections.id, id))
    .limit(1);
  return row ? toPublic(row) : null;
}

export async function updateHomepageSection(
  db: Database,
  id: string,
  data: {
    enabled?: boolean;
    label?: string;
    content?: Record<string, unknown>;
  },
) {
  const [updated] = await db
    .update(homepageSections)
    .set({
      ...(data.enabled === undefined ? {} : { enabled: data.enabled }),
      ...(data.label === undefined ? {} : { label: data.label }),
      ...(data.content === undefined ? {} : { content: data.content }),
      updatedAt: new Date(),
    })
    .where(eq(homepageSections.id, id))
    .returning();
  return updated ? toPublic(updated) : null;
}

export async function reorderHomepageSections(db: Database, orderedIds: string[]) {
  for (let index = 0; index < orderedIds.length; index += 1) {
    const id = orderedIds[index]!;
    await db
      .update(homepageSections)
      .set({ sortOrder: (index + 1) * 10, updatedAt: new Date() })
      .where(eq(homepageSections.id, id));
  }
  return listHomepageSections(db);
}

export async function createHomepageSection(
  db: Database,
  input: {
    type: HomepageSectionType;
    label?: string;
    enabled?: boolean;
  },
) {
  const [maxRow] = await db
    .select({ value: sql<number>`coalesce(max(${homepageSections.sortOrder}), 0)` })
    .from(homepageSections);
  const nextOrder = Number(maxRow?.value ?? 0) + 10;

  const [created] = await db
    .insert(homepageSections)
    .values({
      type: input.type,
      enabled: input.enabled ?? true,
      sortOrder: nextOrder,
      label: input.label ?? HOMEPAGE_SECTION_LABELS[input.type],
      content: defaultContentForType(input.type),
    })
    .returning();

  if (!created) throw new Error("Failed to create homepage section");
  return toPublic(created);
}

export async function deleteHomepageSection(db: Database, id: string) {
  const deleted = await db
    .delete(homepageSections)
    .where(eq(homepageSections.id, id))
    .returning({ id: homepageSections.id });
  return deleted.length > 0;
}

export async function replaceHomepageSections(
  db: Database,
  sections: HomepageSection[],
) {
  await db.delete(homepageSections);
  if (sections.length > 0) {
    await db.insert(homepageSections).values(
      sections.map((section) => ({
        id: section.id.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        )
          ? section.id
          : undefined,
        type: section.type,
        enabled: section.enabled,
        sortOrder: section.sortOrder,
        label: section.label,
        content: section.content,
      })),
    );
  }
  return listHomepageSections(db);
}

export async function resetHomepageSectionsToDefault(db: Database) {
  const defaults = getDefaultHomepageSections();
  await db.delete(homepageSections);
  await db.insert(homepageSections).values(
    defaults.map((section) => ({
      type: section.type,
      enabled: section.enabled,
      sortOrder: section.sortOrder,
      label: section.label,
      content: section.content,
    })),
  );
  return listHomepageSections(db);
}

/** Keep TypeScript happy if we later batch-fetch by ids. */
export async function listHomepageSectionsByIds(db: Database, ids: string[]) {
  if (ids.length === 0) return [];
  const rows = await db
    .select()
    .from(homepageSections)
    .where(inArray(homepageSections.id, ids));
  return rows.map(toPublic);
}
