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
  updateAppUserProfile,
  updateEducation,
  updateEmploymentHistory,
  updateQualification,
} from "@horizon/database";
import {
  educationSchema,
  employmentHistorySchema,
  qualificationSchema,
  setSkillsByNameSchema,
  updateCandidateProfileSchema,
} from "@horizon/shared";
import { Hono } from "hono";
import type { AppEnv } from "../env";
import { getDb } from "../lib/db";
import { fail, ok } from "../lib/response";
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
    projects: bundle.projects,
    completion: {
      profileCompleted: bundle.user.profileCompleted,
      required: [
        "name",
        "email",
        "location",
        "professional title",
        "at least 3 skills",
      ],
    },
  });
});

/** Candidate Skill Profile fields (professional title, remote preference, availability, salary). */
profileRoutes.patch(
  "/me/candidate-profile",
  requireRoles("job_seeker"),
  async (c) => {
    const appUser = c.get("appUser");
    if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

    const body = await c.req.json().catch(() => null);
    const parsed = updateCandidateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return fail(
        c,
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid profile input.",
        400,
      );
    }

    const db = getDb(c);
    const updated = await updateAppUserProfile(db, appUser, parsed.data);
    c.set("appUser", updated);
    return ok(c, toPublicUser(updated));
  },
);

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
