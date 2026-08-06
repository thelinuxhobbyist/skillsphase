import {
  applyToJobSchema,
  createJobSchema,
  listJobsQuerySchema,
  updateApplicationStatusSchema,
  updateJobSchema,
} from "@horizon/shared";
import {
  buildApplicationProfileSnapshot,
  createApplication,
  createJob,
  findApplicationByJobAndUser,
  findCompanyByOwner,
  findJobById,
  findPublishedJobBySlug,
  getEmployerJobDetail,
  listApplicationsForJob,
  listApplicationsForUser,
  listJobsForCompany,
  listPublishedJobs,
  softDeleteJob,
  type AppCompany,
  updateApplicationStatus,
  updateJob,
  withdrawApplication,
} from "@horizon/database";
import type { Context } from "hono";
import { Hono } from "hono";
import type { AppEnv } from "../env";
import { getDb } from "../lib/db";
import { fail, ok } from "../lib/response";
import {
  requireAppUser,
  requireClerkAuth,
  requireRoles,
} from "../middleware/auth";

type CompanyGuardError =
  | "UNAUTHORIZED"
  | "COMPANY_NOT_FOUND"
  | "COMPANY_NOT_APPROVED"
  | "COMPANY_NOT_ACTIVATED";
type CompanyGuardResult =
  | { ok: false; error: CompanyGuardError }
  | { ok: true; company: AppCompany };

async function requireVerifiedCompany(
  c: Context<AppEnv>,
): Promise<CompanyGuardResult> {
  const appUser = c.get("appUser");
  if (!appUser) return { ok: false, error: "UNAUTHORIZED" };
  const db = getDb(c);
  const company = await findCompanyByOwner(db, appUser.id);
  if (!company) return { ok: false, error: "COMPANY_NOT_FOUND" };
  if (company.verificationStatus !== "approved") {
    return { ok: false, error: "COMPANY_NOT_APPROVED" };
  }
  if (!company.businessEmailVerified) {
    return { ok: false, error: "COMPANY_NOT_ACTIVATED" };
  }
  return { ok: true, company };
}

function companyGuardMessage(error: CompanyGuardError): string {
  switch (error) {
    case "UNAUTHORIZED":
      return "Authentication required.";
    case "COMPANY_NOT_FOUND":
      return "Complete business registration first.";
    case "COMPANY_NOT_APPROVED":
      return "Your registration is still awaiting administrator review.";
    case "COMPANY_NOT_ACTIVATED":
      return "Activate your business account using the link sent to your company email.";
  }
}

export const jobRoutes = new Hono<AppEnv>();

/** Public published job list. */
jobRoutes.get("/", async (c) => {
  if (!c.env.DATABASE_URL) {
    return ok(c, { jobs: [] }, 200, { page: 1, pageSize: 20, total: 0 });
  }

  const parsed = listJobsQuerySchema.safeParse({
    page: c.req.query("page"),
    pageSize: c.req.query("pageSize"),
    q: c.req.query("q"),
    location: c.req.query("location"),
    remoteType: c.req.query("remoteType"),
    employmentType: c.req.query("employmentType"),
    industry: c.req.query("industry"),
  });
  if (!parsed.success) {
    return fail(c, "VALIDATION_ERROR", "Invalid job search filters.", 400);
  }

  const db = getDb(c);
  const { items, total } = await listPublishedJobs(
    db,
    {
      q: parsed.data.q,
      location: parsed.data.location,
      remoteType: parsed.data.remoteType,
      employmentType: parsed.data.employmentType,
      industry: parsed.data.industry,
    },
    parsed.data.page,
    parsed.data.pageSize,
  );

  return ok(
    c,
    { jobs: items },
    200,
    {
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
      total,
    },
  );
});

jobRoutes.get("/by-slug/:slug", async (c) => {
  if (!c.env.DATABASE_URL) {
    return fail(c, "NOT_FOUND", "Job not found.", 404);
  }
  const job = await findPublishedJobBySlug(getDb(c), c.req.param("slug"));
  if (!job) return fail(c, "NOT_FOUND", "Job not found.", 404);
  return ok(c, job);
});

/** Candidate applications list. */
export const applicationRoutes = new Hono<AppEnv>();

applicationRoutes.use(
  "*",
  requireClerkAuth,
  requireAppUser,
  requireRoles("job_seeker"),
);

applicationRoutes.get("/me", async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  const items = await listApplicationsForUser(getDb(c), appUser.id);
  return ok(c, { applications: items });
});

applicationRoutes.post("/:applicationId/withdraw", async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  const updated = await withdrawApplication(
    getDb(c),
    c.req.param("applicationId"),
    appUser.id,
  );
  if (!updated) {
    return fail(c, "NOT_FOUND", "Application not found or cannot be withdrawn.", 404);
  }
  return ok(c, {
    id: updated.id,
    status: updated.status,
  });
});

/** Apply to a published job with SkillsPhase profile (no CV required). */
jobRoutes.post(
  "/:jobId/apply",
  requireClerkAuth,
  requireAppUser,
  requireRoles("job_seeker"),
  async (c) => {
    const appUser = c.get("appUser");
    if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

    const jobId = Number(c.req.param("jobId"));
    if (!Number.isFinite(jobId)) {
      return fail(c, "VALIDATION_ERROR", "Invalid job id.", 400);
    }

    const body = await c.req.json().catch(() => ({}));
    const parsed = applyToJobSchema.safeParse(body);
    if (!parsed.success) {
      return fail(
        c,
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid application.",
        400,
      );
    }

    const db = getDb(c);
    if (!appUser.profileCompleted) {
      return fail(
        c,
        "PROFILE_INCOMPLETE",
        "Complete your SkillsPhase profile before applying. You apply with your profile — not a CV.",
        400,
      );
    }

    const job = await findJobById(db, jobId);
    if (
      !job ||
      job.status !== "published" ||
      job.removedByAdmin ||
      job.deletedAt
    ) {
      return fail(c, "NOT_FOUND", "Job not found or not open for applications.", 404);
    }

    const existing = await findApplicationByJobAndUser(db, jobId, appUser.id);
    if (existing) {
      return fail(c, "ALREADY_APPLIED", "You have already applied to this job.", 409);
    }

    const profileSnapshot = await buildApplicationProfileSnapshot(db, appUser.id);
    const created = await createApplication(db, {
      jobId,
      userId: appUser.id,
      coverLetter: parsed.data.coverLetter,
      profileSnapshot,
    });

    return ok(
      c,
      {
        id: created.id,
        status: created.status,
        jobId: created.jobId,
        message:
          "Application submitted with your SkillsPhase profile. Supporting documents can be shared later if requested.",
      },
      201,
    );
  },
);

/** Employer job management. */
export const employerJobRoutes = new Hono<AppEnv>();

employerJobRoutes.use(
  "*",
  requireClerkAuth,
  requireAppUser,
  requireRoles("employer"),
);

employerJobRoutes.get("/", async (c) => {
  const guard = await requireVerifiedCompany(c);
  if (!guard.ok) {
    return fail(c, guard.error, companyGuardMessage(guard.error), 403);
  }
  const items = await listJobsForCompany(getDb(c), guard.company.id);
  return ok(c, { jobs: items });
});

employerJobRoutes.post("/", async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  const guard = await requireVerifiedCompany(c);
  if (!guard.ok) {
    return fail(c, guard.error, companyGuardMessage(guard.error), 403);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = createJobSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid job.",
      400,
    );
  }

  const created = await createJob(getDb(c), {
    companyId: guard.company.id,
    createdByUserId: appUser.id,
    title: parsed.data.title,
    description: parsed.data.description,
    location: parsed.data.location,
    remoteType: parsed.data.remoteType,
    employmentType: parsed.data.employmentType,
    industry: parsed.data.industry,
    salaryMin: parsed.data.salaryMin,
    salaryMax: parsed.data.salaryMax,
    salaryCurrency: parsed.data.salaryCurrency,
    closingDate: parsed.data.closingDate,
    skillNames: parsed.data.skillNames,
    status: parsed.data.publish ? "published" : "draft",
  });

  const detail = await getEmployerJobDetail(
    getDb(c),
    created.id,
    guard.company.id,
  );
  return ok(c, detail, 201);
});

/** Register before /:jobId so "applications" is not captured as a job id. */
employerJobRoutes.patch("/applications/:applicationId", async (c) => {
  const guard = await requireVerifiedCompany(c);
  if (!guard.ok) {
    return fail(c, guard.error, companyGuardMessage(guard.error), 403);
  }
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
  const updated = await updateApplicationStatus(
    getDb(c),
    c.req.param("applicationId"),
    guard.company.id,
    parsed.data.status,
  );
  if (!updated) return fail(c, "NOT_FOUND", "Application not found.", 404);
  return ok(c, { id: updated.id, status: updated.status });
});

employerJobRoutes.get("/:jobId", async (c) => {
  const guard = await requireVerifiedCompany(c);
  if (!guard.ok) {
    return fail(c, guard.error, companyGuardMessage(guard.error), 403);
  }
  const jobId = Number(c.req.param("jobId"));
  if (!Number.isFinite(jobId)) {
    return fail(c, "VALIDATION_ERROR", "Invalid job id.", 400);
  }
  const detail = await getEmployerJobDetail(getDb(c), jobId, guard.company.id);
  if (!detail) return fail(c, "NOT_FOUND", "Job not found.", 404);
  return ok(c, detail);
});

employerJobRoutes.patch("/:jobId", async (c) => {
  const guard = await requireVerifiedCompany(c);
  if (!guard.ok) {
    return fail(c, guard.error, companyGuardMessage(guard.error), 403);
  }
  const jobId = Number(c.req.param("jobId"));
  if (!Number.isFinite(jobId)) {
    return fail(c, "VALIDATION_ERROR", "Invalid job id.", 400);
  }

  const job = await findJobById(getDb(c), jobId);
  if (!job || job.companyId !== guard.company.id || job.deletedAt) {
    return fail(c, "NOT_FOUND", "Job not found.", 404);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = updateJobSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid job update.",
      400,
    );
  }

  await updateJob(getDb(c), job, parsed.data);
  const detail = await getEmployerJobDetail(getDb(c), jobId, guard.company.id);
  return ok(c, detail);
});

employerJobRoutes.delete("/:jobId", async (c) => {
  const guard = await requireVerifiedCompany(c);
  if (!guard.ok) {
    return fail(c, guard.error, companyGuardMessage(guard.error), 403);
  }
  const jobId = Number(c.req.param("jobId"));
  if (!Number.isFinite(jobId)) {
    return fail(c, "VALIDATION_ERROR", "Invalid job id.", 400);
  }
  const job = await findJobById(getDb(c), jobId);
  if (!job || job.companyId !== guard.company.id || job.deletedAt) {
    return fail(c, "NOT_FOUND", "Job not found.", 404);
  }
  await softDeleteJob(getDb(c), jobId);
  return ok(c, { deleted: true });
});

employerJobRoutes.get("/:jobId/applications", async (c) => {
  const guard = await requireVerifiedCompany(c);
  if (!guard.ok) {
    return fail(c, guard.error, companyGuardMessage(guard.error), 403);
  }
  const jobId = Number(c.req.param("jobId"));
  if (!Number.isFinite(jobId)) {
    return fail(c, "VALIDATION_ERROR", "Invalid job id.", 400);
  }
  const items = await listApplicationsForJob(getDb(c), jobId, guard.company.id);
  return ok(c, {
    applications: items,
    note: "Candidates applied with a SkillsPhase profile. Request CVs, certificates, or references only after mutual interest.",
  });
});
