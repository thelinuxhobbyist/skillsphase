import {
  createHomepageSection,
  deleteHomepageSection,
  ensureHomepageSections,
  findHomepageSectionById,
  listEnabledHomepageSections,
  reorderHomepageSections,
  resetHomepageSectionsToDefault,
  updateHomepageSection,
  writeAdminLog,
} from "@horizon/database";
import {
  createHomepageSectionSchema,
  getDefaultHomepageSections,
  reorderHomepageSectionsSchema,
  updateHomepageSectionSchema,
} from "@horizon/shared";
import { Hono } from "hono";
import type { AppEnv } from "../env";
import { getDb } from "../lib/db";
import { requireAdminAuth } from "../lib/require-admin-auth";
import { fail, ok } from "../lib/response";

/** Public homepage template (enabled sections only). Falls back to defaults without DB. */
export const contentRoutes = new Hono<AppEnv>();

contentRoutes.get("/homepage", async (c) => {
  if (!c.env.DATABASE_URL) {
    return ok(c, {
      source: "defaults",
      sections: getDefaultHomepageSections().filter((s) => s.enabled),
    });
  }

  try {
    const sections = await listEnabledHomepageSections(getDb(c));
    return ok(c, { source: "database", sections });
  } catch {
    return ok(c, {
      source: "defaults",
      sections: getDefaultHomepageSections().filter((s) => s.enabled),
    });
  }
});

/** Admin homepage CMS */
export const adminHomepageRoutes = new Hono<AppEnv>();

adminHomepageRoutes.use("*", requireAdminAuth);

adminHomepageRoutes.get("/", async (c) => {
  if (!c.env.DATABASE_URL) {
    return fail(
      c,
      "DATABASE_NOT_CONFIGURED",
      "Connect Neon to edit the homepage template. Defaults are shown on the public site until then.",
      503,
    );
  }

  const sections = await ensureHomepageSections(getDb(c));
  return ok(c, { sections });
});

adminHomepageRoutes.post("/reset", async (c) => {
  const admin = c.get("appUser");
  if (!admin) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  if (!c.env.DATABASE_URL) {
    return fail(c, "DATABASE_NOT_CONFIGURED", "Database is not configured.", 503);
  }

  const db = getDb(c);
  const sections = await resetHomepageSectionsToDefault(db);
  await writeAdminLog(db, {
    adminUserId: admin.id,
    action: "Homepage Reset To Default",
    entity: "homepage",
    entityId: "home",
  });
  return ok(c, { sections });
});

adminHomepageRoutes.post("/", async (c) => {
  const admin = c.get("appUser");
  if (!admin) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  if (!c.env.DATABASE_URL) {
    return fail(c, "DATABASE_NOT_CONFIGURED", "Database is not configured.", 503);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = createHomepageSectionSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid section.",
      400,
    );
  }

  const db = getDb(c);
  await ensureHomepageSections(db);
  const created = await createHomepageSection(db, parsed.data);
  await writeAdminLog(db, {
    adminUserId: admin.id,
    action: "Homepage Section Created",
    entity: "homepage_section",
    entityId: created.id,
    notes: created.type,
  });
  return ok(c, created, 201);
});

adminHomepageRoutes.patch("/reorder", async (c) => {
  const admin = c.get("appUser");
  if (!admin) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  if (!c.env.DATABASE_URL) {
    return fail(c, "DATABASE_NOT_CONFIGURED", "Database is not configured.", 503);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = reorderHomepageSectionsSchema.safeParse(body);
  if (!parsed.success) {
    return fail(c, "VALIDATION_ERROR", "Invalid reorder payload.", 400);
  }

  const db = getDb(c);
  const sections = await reorderHomepageSections(db, parsed.data.orderedIds);
  await writeAdminLog(db, {
    adminUserId: admin.id,
    action: "Homepage Sections Reordered",
    entity: "homepage",
    entityId: "home",
  });
  return ok(c, { sections });
});

adminHomepageRoutes.patch("/:id", async (c) => {
  const admin = c.get("appUser");
  if (!admin) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  if (!c.env.DATABASE_URL) {
    return fail(c, "DATABASE_NOT_CONFIGURED", "Database is not configured.", 503);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = updateHomepageSectionSchema.safeParse(body);
  if (!parsed.success) {
    return fail(c, "VALIDATION_ERROR", "Invalid section update.", 400);
  }

  const db = getDb(c);
  const existing = await findHomepageSectionById(db, c.req.param("id"));
  if (!existing) {
    return fail(c, "SECTION_NOT_FOUND", "Homepage section not found.", 404);
  }

  const updated = await updateHomepageSection(db, existing.id, parsed.data);
  await writeAdminLog(db, {
    adminUserId: admin.id,
    action: "Homepage Section Updated",
    entity: "homepage_section",
    entityId: existing.id,
    notes: existing.type,
  });
  return ok(c, updated);
});

adminHomepageRoutes.delete("/:id", async (c) => {
  const admin = c.get("appUser");
  if (!admin) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  if (!c.env.DATABASE_URL) {
    return fail(c, "DATABASE_NOT_CONFIGURED", "Database is not configured.", 503);
  }

  const db = getDb(c);
  const existing = await findHomepageSectionById(db, c.req.param("id"));
  if (!existing) {
    return fail(c, "SECTION_NOT_FOUND", "Homepage section not found.", 404);
  }

  await deleteHomepageSection(db, existing.id);
  await writeAdminLog(db, {
    adminUserId: admin.id,
    action: "Homepage Section Deleted",
    entity: "homepage_section",
    entityId: existing.id,
    notes: existing.type,
  });
  return ok(c, { deleted: true, id: existing.id });
});
