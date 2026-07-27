import {
  createProject,
  deleteProject,
  listProjectsForUser,
  updateProject,
} from "@horizon/database";
import { projectSchema } from "@horizon/shared";
import { Hono } from "hono";
import type { AppEnv } from "../env";
import { getDb } from "../lib/db";
import { fail, ok } from "../lib/response";
import { storePortfolioFile } from "../lib/storage";
import { requireAppUser, requireClerkAuth, requireRoles } from "../middleware/auth";

export const projectRoutes = new Hono<AppEnv>();

projectRoutes.use("*", requireClerkAuth, requireAppUser, requireRoles("job_seeker"));

projectRoutes.get("/", async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  const rows = await listProjectsForUser(getDb(c), appUser.id);
  return ok(c, rows);
});

projectRoutes.post("/", async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

  const body = await c.req.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid project.",
      400,
    );
  }

  const row = await createProject(getDb(c), appUser.id, parsed.data);
  return ok(c, row, 201);
});

projectRoutes.patch("/:id", async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

  const body = await c.req.json().catch(() => null);
  const parsed = projectSchema.partial().safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid project update.",
      400,
    );
  }

  try {
    const row = await updateProject(getDb(c), appUser.id, c.req.param("id"), parsed.data);
    return ok(c, row);
  } catch {
    return fail(c, "NOT_FOUND", "Project not found.", 404);
  }
});

projectRoutes.delete("/:id", async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  await deleteProject(getDb(c), appUser.id, c.req.param("id"));
  return ok(c, { deleted: true });
});

/** Upload a portfolio image or document; returns a media item ready to attach to a project. */
projectRoutes.post("/media", async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

  const form = await c.req.parseBody();
  const file = form.file;
  if (!(file instanceof File)) {
    return fail(c, "VALIDATION_ERROR", "Upload a file using the `file` field.", 400);
  }

  try {
    const stored = await storePortfolioFile({
      userId: appUser.id,
      file,
      bucket: c.env.UPLOADS,
      environment: c.env.ENVIRONMENT ?? "development",
    });

    const type = file.type.startsWith("image/") ? "image" : "document";
    return ok(c, {
      type,
      url: `/api/v1/media/${stored.key}`,
      label: stored.fileName,
    });
  } catch (error) {
    return fail(
      c,
      "UPLOAD_FAILED",
      error instanceof Error ? error.message : "Upload failed.",
      400,
    );
  }
});
