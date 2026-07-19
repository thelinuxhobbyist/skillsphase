import {
  findApplicationById,
  listApplicationsForUser,
  toPublicApplication,
  updateApplicationStatus,
  withdrawApplication,
} from "@horizon/database";
import {
  EMPLOYER_ASSIGNABLE_STATUSES,
  updateApplicationStatusSchema,
} from "@horizon/shared";
import { Hono } from "hono";
import type { AppEnv } from "../env";
import { getDb } from "../lib/db";
import { fail, ok } from "../lib/response";
import { readStoredObject } from "../lib/storage";
import {
  requireAppUser,
  requireClerkAuth,
  requireRoles,
} from "../middleware/auth";

export const applicationRoutes = new Hono<AppEnv>();

applicationRoutes.get(
  "/me",
  requireClerkAuth,
  requireAppUser,
  requireRoles("job_seeker"),
  async (c) => {
    const appUser = c.get("appUser");
    if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
    const rows = await listApplicationsForUser(getDb(c), appUser.id);
    return ok(c, rows);
  },
);

applicationRoutes.delete(
  "/:id",
  requireClerkAuth,
  requireAppUser,
  requireRoles("job_seeker"),
  async (c) => {
    const appUser = c.get("appUser");
    if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

    const db = getDb(c);
    const row = await findApplicationById(db, c.req.param("id"));
    if (!row || row.application.userId !== appUser.id) {
      return fail(c, "APPLICATION_NOT_FOUND", "Application not found.", 404);
    }

    if (
      row.application.status === "hired" ||
      row.application.status === "rejected"
    ) {
      return fail(
        c,
        "WITHDRAW_NOT_ALLOWED",
        "This application can no longer be withdrawn.",
        409,
      );
    }

    if (row.application.status === "withdrawn") {
      return ok(
        c,
        toPublicApplication({
          application: row.application,
          jobTitle: row.job.title,
          jobSlug: row.job.slug,
          companyName: row.company.companyName,
          user: row.user,
        }),
      );
    }

    const updated = await withdrawApplication(db, row.application.id);
    if (!updated) {
      return fail(c, "APPLICATION_NOT_FOUND", "Application not found.", 404);
    }

    return ok(
      c,
      toPublicApplication({
        application: updated,
        jobTitle: row.job.title,
        jobSlug: row.job.slug,
        companyName: row.company.companyName,
        user: row.user,
      }),
    );
  },
);

applicationRoutes.patch(
  "/:id",
  requireClerkAuth,
  requireAppUser,
  requireRoles("employer", "admin"),
  async (c) => {
    const appUser = c.get("appUser");
    if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

    const body = await c.req.json().catch(() => null);
    const parsed = updateApplicationStatusSchema.safeParse(body);
    if (!parsed.success) {
      return fail(
        c,
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid status.",
        400,
      );
    }

    if (
      !(EMPLOYER_ASSIGNABLE_STATUSES as readonly string[]).includes(
        parsed.data.status,
      )
    ) {
      return fail(c, "VALIDATION_ERROR", "Invalid status transition.", 400);
    }

    const db = getDb(c);
    const row = await findApplicationById(db, c.req.param("id"));
    if (!row) {
      return fail(c, "APPLICATION_NOT_FOUND", "Application not found.", 404);
    }

    if (appUser.role === "employer" && row.company.ownerUserId !== appUser.id) {
      return fail(c, "FORBIDDEN", "You can only update your own applicants.", 403);
    }

    if (row.application.status === "withdrawn") {
      return fail(
        c,
        "STATUS_NOT_ALLOWED",
        "Withdrawn applications cannot be updated.",
        409,
      );
    }

    const updated = await updateApplicationStatus(
      db,
      row.application.id,
      parsed.data.status,
    );
    if (!updated) {
      return fail(c, "APPLICATION_NOT_FOUND", "Application not found.", 404);
    }

    return ok(
      c,
      toPublicApplication({
        application: updated,
        jobTitle: row.job.title,
        jobSlug: row.job.slug,
        companyName: row.company.companyName,
        user: row.user,
      }),
    );
  },
);

applicationRoutes.get(
  "/:id/cv",
  requireClerkAuth,
  requireAppUser,
  requireRoles("employer", "admin"),
  async (c) => {
    const appUser = c.get("appUser");
    if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

    const db = getDb(c);
    const row = await findApplicationById(db, c.req.param("id"));
    if (!row) {
      return fail(c, "APPLICATION_NOT_FOUND", "Application not found.", 404);
    }

    if (appUser.role === "employer" && row.company.ownerUserId !== appUser.id) {
      return fail(
        c,
        "FORBIDDEN",
        "You can only download CVs for your applicants.",
        403,
      );
    }

    const file = await readStoredObject({
      cvUrl: row.application.cvUrl,
      bucket: c.env.UPLOADS,
    });

    if (!file) {
      return fail(c, "CV_NOT_FOUND", "CV snapshot is not available.", 404);
    }

    return new Response(file.body, {
      status: 200,
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `attachment; filename="${file.fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  },
);
