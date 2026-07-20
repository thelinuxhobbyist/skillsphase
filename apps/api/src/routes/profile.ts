import {
  createEducation,
  createEmploymentHistory,
  createQualification,
  deleteEducation,
  deleteEmploymentHistory,
  deleteQualification,
  getProfileBundle,
  listSkills,
  setUserSkillsByName,
  toPublicUser,
  updateEducation,
  updateEmploymentHistory,
  updateQualification,
  updateUserCv,
} from "@horizon/database";
import {
  educationSchema,
  employmentHistorySchema,
  qualificationSchema,
  setSkillsByNameSchema,
} from "@horizon/shared";
import { Hono } from "hono";
import type { AppEnv } from "../env";
import { getDb } from "../lib/db";
import { fail, ok } from "../lib/response";
import { storeCvObject } from "../lib/storage";
import {
  requireAppUser,
  requireClerkAuth,
  requireRoles,
} from "../middleware/auth";

export const profileRoutes = new Hono<AppEnv>();

profileRoutes.use("*", requireClerkAuth, requireAppUser);

profileRoutes.get("/me/profile", requireRoles("job_seeker"), async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

  const db = getDb(c);
  const bundle = await getProfileBundle(db, appUser.id);
  if (!bundle) return fail(c, "NOT_FOUND", "User not found.", 404);

  return ok(c, {
    user: toPublicUser(bundle.user),
    employmentHistory: bundle.employmentHistory,
    education: bundle.education,
    qualifications: bundle.qualifications,
    skills: bundle.skills,
    completion: {
      profileCompleted: bundle.user.profileCompleted,
      required: [
        "name",
        "email",
        "location",
        "careerSummary",
        "at least one skill",
        "CV",
      ],
    },
  });
});

profileRoutes.get("/skills", async (c) => {
  const db = getDb(c);
  const q = c.req.query("q");
  const rows = await listSkills(db, q);
  return ok(c, rows);
});

profileRoutes.put("/me/skills", requireRoles("job_seeker"), async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

  const body = await c.req.json().catch(() => null);
  const parsed = setSkillsByNameSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid skills.",
      400,
    );
  }

  const db = getDb(c);
  const skills = await setUserSkillsByName(db, appUser.id, parsed.data.skills);
  return ok(c, skills);
});

profileRoutes.post("/me/employment-history", requireRoles("job_seeker"), async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  const body = await c.req.json().catch(() => null);
  const parsed = employmentHistorySchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid employment history.",
      400,
    );
  }
  const row = await createEmploymentHistory(getDb(c), appUser.id, parsed.data);
  return ok(c, row, 201);
});

profileRoutes.patch(
  "/me/employment-history/:id",
  requireRoles("job_seeker"),
  async (c) => {
    const appUser = c.get("appUser");
    if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
    const body = await c.req.json().catch(() => null);
    const parsed = employmentHistorySchema.safeParse(body);
    if (!parsed.success) {
      return fail(
        c,
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid employment history.",
        400,
      );
    }
    try {
      const row = await updateEmploymentHistory(
        getDb(c),
        appUser.id,
        c.req.param("id"),
        parsed.data,
      );
      return ok(c, row);
    } catch {
      return fail(c, "NOT_FOUND", "Employment history not found.", 404);
    }
  },
);

profileRoutes.delete(
  "/me/employment-history/:id",
  requireRoles("job_seeker"),
  async (c) => {
    const appUser = c.get("appUser");
    if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
    await deleteEmploymentHistory(getDb(c), appUser.id, c.req.param("id"));
    return ok(c, { deleted: true });
  },
);

profileRoutes.post("/me/education", requireRoles("job_seeker"), async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  const body = await c.req.json().catch(() => null);
  const parsed = educationSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid education.",
      400,
    );
  }
  const row = await createEducation(getDb(c), appUser.id, parsed.data);
  return ok(c, row, 201);
});

profileRoutes.patch("/me/education/:id", requireRoles("job_seeker"), async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  const body = await c.req.json().catch(() => null);
  const parsed = educationSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid education.",
      400,
    );
  }
  try {
    const row = await updateEducation(
      getDb(c),
      appUser.id,
      c.req.param("id"),
      parsed.data,
    );
    return ok(c, row);
  } catch {
    return fail(c, "NOT_FOUND", "Education not found.", 404);
  }
});

profileRoutes.delete("/me/education/:id", requireRoles("job_seeker"), async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  await deleteEducation(getDb(c), appUser.id, c.req.param("id"));
  return ok(c, { deleted: true });
});

profileRoutes.post("/me/qualifications", requireRoles("job_seeker"), async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  const body = await c.req.json().catch(() => null);
  const parsed = qualificationSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid qualification.",
      400,
    );
  }
  const row = await createQualification(getDb(c), appUser.id, parsed.data);
  return ok(c, row, 201);
});

profileRoutes.patch(
  "/me/qualifications/:id",
  requireRoles("job_seeker"),
  async (c) => {
    const appUser = c.get("appUser");
    if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
    const body = await c.req.json().catch(() => null);
    const parsed = qualificationSchema.safeParse(body);
    if (!parsed.success) {
      return fail(
        c,
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid qualification.",
        400,
      );
    }
    try {
      const row = await updateQualification(
        getDb(c),
        appUser.id,
        c.req.param("id"),
        parsed.data,
      );
      return ok(c, row);
    } catch {
      return fail(c, "NOT_FOUND", "Qualification not found.", 404);
    }
  },
);

profileRoutes.delete(
  "/me/qualifications/:id",
  requireRoles("job_seeker"),
  async (c) => {
    const appUser = c.get("appUser");
    if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
    await deleteQualification(getDb(c), appUser.id, c.req.param("id"));
    return ok(c, { deleted: true });
  },
);

profileRoutes.post("/me/cv", requireRoles("job_seeker"), async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

  const form = await c.req.parseBody();
  const file = form.file;
  if (!(file instanceof File)) {
    return fail(c, "VALIDATION_ERROR", "Upload a CV file using the `file` field.", 400);
  }

  try {
    const stored = await storeCvObject({
      userId: appUser.id,
      file,
      bucket: c.env.UPLOADS,
      environment: c.env.ENVIRONMENT ?? "development",
    });

    const db = getDb(c);
    const updated = await updateUserCv(db, appUser.id, {
      cvUrl: stored.url,
      cvFileName: stored.fileName,
    });
    c.set("appUser", updated);

    return ok(c, {
      user: toPublicUser(updated),
      upload: {
        fileName: stored.fileName,
        storage: stored.storage,
      },
    });
  } catch (error) {
    return fail(
      c,
      "UPLOAD_FAILED",
      error instanceof Error ? error.message : "CV upload failed.",
      400,
    );
  }
});

profileRoutes.delete("/me/cv", requireRoles("job_seeker"), async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

  const updated = await updateUserCv(getDb(c), appUser.id, {
    cvUrl: null,
    cvFileName: null,
  });
  c.set("appUser", updated);
  return ok(c, { user: toPublicUser(updated) });
});
