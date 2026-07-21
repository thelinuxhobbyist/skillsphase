import {
  createApplication,
  createJob,
  findApplicationByJobAndUser,
  findCompanyById,
  writeAdminLog,
  findCompanyByOwner,
  findJobById,
  findPublishedJobBySlug,
  listApplicationsForJobDetailed,
  listJobsForCompany,
  listPublishedJobs,
  recomputeProfileCompleted,
  setJobStatus,
  softDeleteDraftJob,
  toPublicApplication,
  toPublicJob,
  updateJob,
} from "@horizon/database";
import {
  applyToJobSchema,
  createJobSchema,
  jobListQuerySchema,
  updateJobSchema,
} from "@horizon/shared";
import { Hono } from "hono";
import type { AppEnv } from "../env";
import { getDb } from "../lib/db";
import {
  applicationConfirmationEmailHtml,
  sendEmail,
} from "../lib/email";
import { fail, ok } from "../lib/response";
import { snapshotCvForApplication } from "../lib/storage";
import {
  requireAppUser,
  requireClerkAuth,
  requireRoles,
} from "../middleware/auth";

export const jobRoutes = new Hono<AppEnv>();

jobRoutes.get("/", async (c) => {
  const parsed = jobListQuerySchema.safeParse({
    page: c.req.query("page"),
    pageSize: c.req.query("pageSize"),
    keyword: c.req.query("keyword") || undefined,
    location: c.req.query("location") || undefined,
    employmentType: c.req.query("employmentType") || undefined,
    remoteType: c.req.query("remoteType") || undefined,
    industry: c.req.query("industry") || undefined,
  });

  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid query.",
      400,
    );
  }

  if (!c.env.DATABASE_URL) {
    return fail(
      c,
      "DATABASE_NOT_CONFIGURED",
      "Database is not configured on this environment.",
      503,
    );
  }

  const result = await listPublishedJobs(getDb(c), parsed.data);
  return ok(c, result.data, 200, {
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
    total: result.total,
  });
});

jobRoutes.get("/by-slug/:slug", async (c) => {
  if (!c.env.DATABASE_URL) {
    return fail(
      c,
      "DATABASE_NOT_CONFIGURED",
      "Database is not configured on this environment.",
      503,
    );
  }

  const job = await findPublishedJobBySlug(getDb(c), c.req.param("slug"));
  if (!job) {
    return fail(c, "JOB_NOT_FOUND", "Job not found.", 404);
  }
  return ok(c, job);
});

jobRoutes.get(
  "/mine",
  requireClerkAuth,
  requireAppUser,
  requireRoles("employer", "admin"),
  async (c) => {
    const appUser = c.get("appUser");
    if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

    const db = getDb(c);

    if (appUser.role === "admin") {
      const companyId = c.req.query("companyId");
      if (!companyId) {
        return fail(
          c,
          "VALIDATION_ERROR",
          "Admins must pass companyId to list jobs.",
          400,
        );
      }
      return ok(c, await listJobsForCompany(db, companyId));
    }

    const company = await findCompanyByOwner(db, appUser.id);
    if (!company) {
      return fail(c, "COMPANY_NOT_FOUND", "Register your company first.", 404);
    }

    return ok(c, await listJobsForCompany(db, company.id));
  },
);

jobRoutes.get(
  "/:id",
  requireClerkAuth,
  requireAppUser,
  requireRoles("employer", "admin"),
  async (c) => {
    const appUser = c.get("appUser");
    if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) {
      return fail(c, "VALIDATION_ERROR", "Invalid job id.", 400);
    }

    const db = getDb(c);
    const row = await findJobById(db, id);
    if (!row) return fail(c, "JOB_NOT_FOUND", "Job not found.", 404);

    if (appUser.role === "employer" && row.companyOwnerUserId !== appUser.id) {
      return fail(c, "FORBIDDEN", "You can only view your own jobs.", 403);
    }

    return ok(c, await toPublicJob(db, row.job, row.companyName));
  },
);

jobRoutes.post(
  "/",
  requireClerkAuth,
  requireAppUser,
  requireRoles("employer", "admin"),
  async (c) => {
    const appUser = c.get("appUser");
    if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

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

    const db = getDb(c);
    let companyId = parsed.data.companyId;

    if (appUser.role === "admin") {
      if (!companyId) {
        return fail(
          c,
          "VALIDATION_ERROR",
          "Admins must supply companyId when creating a job.",
          400,
        );
      }
      const company = await findCompanyById(db, companyId);
      if (!company || company.verificationStatus !== "approved") {
        return fail(
          c,
          "COMPANY_NOT_APPROVED",
          "Jobs can only be created for approved companies.",
          400,
        );
      }
    } else {
      const company = await findCompanyByOwner(db, appUser.id);
      if (!company) {
        return fail(c, "COMPANY_NOT_FOUND", "Register your company first.", 404);
      }
      if (company.verificationStatus !== "approved") {
        return fail(
          c,
          "COMPANY_NOT_APPROVED",
          "Your company must be approved before posting jobs.",
          403,
        );
      }
      companyId = company.id;
    }

    const created = await createJob(db, {
      companyId: companyId!,
      createdByUserId: appUser.id,
      title: parsed.data.title,
      description: parsed.data.description,
      salaryMin: parsed.data.salaryMin,
      salaryMax: parsed.data.salaryMax,
      salaryCurrency: parsed.data.salaryCurrency,
      location: parsed.data.location,
      remoteType: parsed.data.remoteType,
      employmentType: parsed.data.employmentType,
      industry: parsed.data.industry,
      closingDate: parsed.data.closingDate,
      skillIds: parsed.data.skillIds,
      skillNames: parsed.data.skillNames,
      publish: parsed.data.publish,
    });

    if (appUser.role === "admin") {
      await writeAdminLog(db, {
        adminUserId: appUser.id,
        action: "Job Created By Admin",
        entity: "job",
        entityId: String(created.id),
        notes: `company ${companyId}`,
      });
    }

    return ok(c, created, 201);
  },
);

jobRoutes.patch(
  "/:id",
  requireClerkAuth,
  requireAppUser,
  requireRoles("employer", "admin"),
  async (c) => {
    const appUser = c.get("appUser");
    if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) {
      return fail(c, "VALIDATION_ERROR", "Invalid job id.", 400);
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

    const db = getDb(c);
    const row = await findJobById(db, id);
    if (!row) return fail(c, "JOB_NOT_FOUND", "Job not found.", 404);

    if (appUser.role === "employer" && row.companyOwnerUserId !== appUser.id) {
      return fail(c, "FORBIDDEN", "You can only edit your own jobs.", 403);
    }

    if (appUser.role === "employer" && row.verificationStatus !== "approved") {
      return fail(
        c,
        "COMPANY_NOT_APPROVED",
        "Your company must be approved to manage jobs.",
        403,
      );
    }

    return ok(c, await updateJob(db, row.job, parsed.data));
  },
);

jobRoutes.delete(
  "/:id",
  requireClerkAuth,
  requireAppUser,
  requireRoles("employer", "admin"),
  async (c) => {
    const appUser = c.get("appUser");
    if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) {
      return fail(c, "VALIDATION_ERROR", "Invalid job id.", 400);
    }

    const db = getDb(c);
    const row = await findJobById(db, id);
    if (!row) return fail(c, "JOB_NOT_FOUND", "Job not found.", 404);

    if (appUser.role === "employer" && row.companyOwnerUserId !== appUser.id) {
      return fail(c, "FORBIDDEN", "You can only delete your own draft jobs.", 403);
    }

    if (row.job.status !== "draft") {
      return fail(
        c,
        "DELETE_NOT_ALLOWED",
        "Only draft jobs can be deleted. Close published jobs instead.",
        409,
      );
    }

    const deleted = await softDeleteDraftJob(db, id);
    if (!deleted) {
      return fail(c, "DELETE_FAILED", "Unable to delete job.", 409);
    }
    return ok(c, { deleted: true });
  },
);

jobRoutes.post(
  "/:id/apply",
  requireClerkAuth,
  requireAppUser,
  requireRoles("job_seeker"),
  async (c) => {
    const appUser = c.get("appUser");
    if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

    const jobId = Number(c.req.param("id"));
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
    const jobRow = await findJobById(db, jobId);
    if (!jobRow || jobRow.job.status !== "published" || jobRow.job.removedByAdmin) {
      return fail(
        c,
        "JOB_NOT_AVAILABLE",
        "This job is not open for applications.",
        404,
      );
    }

    const profileCompleted = await recomputeProfileCompleted(db, appUser);
    if (!profileCompleted || !appUser.cvUrl) {
      return fail(
        c,
        "PROFILE_INCOMPLETE",
        "Complete your profile (name, email, location, career summary, skills, and CV) before applying.",
        409,
      );
    }

    const existing = await findApplicationByJobAndUser(db, jobId, appUser.id);
    if (existing) {
      return fail(c, "ALREADY_APPLIED", "You have already applied for this job.", 409);
    }

    const applicationId = crypto.randomUUID();
    let snapshot;
    try {
      snapshot = await snapshotCvForApplication({
        userId: appUser.id,
        applicationId,
        sourceCvUrl: appUser.cvUrl,
        sourceFileName: appUser.cvFileName,
        bucket: c.env.UPLOADS,
        environment: c.env.ENVIRONMENT ?? "development",
      });
    } catch (error) {
      return fail(
        c,
        "CV_SNAPSHOT_FAILED",
        error instanceof Error ? error.message : "Unable to snapshot CV.",
        400,
      );
    }

    const created = await createApplication(db, {
      id: applicationId,
      jobId,
      userId: appUser.id,
      coverLetter: parsed.data.coverLetter ?? appUser.coverLetterTemplate ?? null,
      cvUrl: snapshot.cvUrl,
      cvFileName: snapshot.cvFileName,
    });

    await sendEmail({
      to: appUser.email,
      subject: `Application received: ${jobRow.job.title}`,
      html: applicationConfirmationEmailHtml({
        jobTitle: jobRow.job.title,
        companyName: jobRow.companyName,
      }),
      apiKey: c.env.EMAIL_API_KEY,
      from: c.env.EMAIL_FROM,
    });

    return ok(
      c,
      toPublicApplication({
        application: created,
        jobTitle: jobRow.job.title,
        jobSlug: jobRow.job.slug,
        companyName: jobRow.companyName,
        user: appUser,
      }),
      201,
    );
  },
);

jobRoutes.get(
  "/:id/applications",
  requireClerkAuth,
  requireAppUser,
  requireRoles("employer", "admin"),
  async (c) => {
    const appUser = c.get("appUser");
    if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

    const jobId = Number(c.req.param("id"));
    if (!Number.isFinite(jobId)) {
      return fail(c, "VALIDATION_ERROR", "Invalid job id.", 400);
    }

    const db = getDb(c);
    const jobRow = await findJobById(db, jobId);
    if (!jobRow) return fail(c, "JOB_NOT_FOUND", "Job not found.", 404);

    if (appUser.role === "employer" && jobRow.companyOwnerUserId !== appUser.id) {
      return fail(c, "FORBIDDEN", "You can only view applicants for your jobs.", 403);
    }
    if (
      appUser.role === "employer" &&
      jobRow.verificationStatus !== "approved"
    ) {
      return fail(
        c,
        "COMPANY_NOT_APPROVED",
        "Your company must be approved to view applicants.",
        403,
      );
    }

    return ok(c, await listApplicationsForJobDetailed(db, jobId));
  },
);

jobRoutes.post(
  "/:id/publish",
  requireClerkAuth,
  requireAppUser,
  requireRoles("employer", "admin"),
  async (c) => {
    const appUser = c.get("appUser");
    if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) {
      return fail(c, "VALIDATION_ERROR", "Invalid job id.", 400);
    }

    const db = getDb(c);
    const row = await findJobById(db, id);
    if (!row) return fail(c, "JOB_NOT_FOUND", "Job not found.", 404);

    if (appUser.role === "employer" && row.companyOwnerUserId !== appUser.id) {
      return fail(c, "FORBIDDEN", "You can only manage your own jobs.", 403);
    }
    if (appUser.role === "employer" && row.verificationStatus !== "approved") {
      return fail(
        c,
        "COMPANY_NOT_APPROVED",
        "Your company must be approved to manage jobs.",
        403,
      );
    }
    if (row.job.status !== "draft" && row.job.status !== "closed") {
      return fail(
        c,
        "INVALID_TRANSITION",
        "Only draft or closed jobs can be published.",
        409,
      );
    }

    const publicJob = await toPublicJob(db, row.job, row.companyName);
    if (publicJob.skills.length < 3) {
      return fail(
        c,
        "SKILLS_REQUIRED",
        "Add at least 3 required skills before publishing. Project Horizon is skills-first.",
        400,
      );
    }

    const updated = await setJobStatus(db, id, "published");
    if (!updated) return fail(c, "JOB_NOT_FOUND", "Job not found.", 404);
    return ok(c, await toPublicJob(db, updated, row.companyName));
  },
);

jobRoutes.post(
  "/:id/close",
  requireClerkAuth,
  requireAppUser,
  requireRoles("employer", "admin"),
  async (c) => {
    const appUser = c.get("appUser");
    if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) {
      return fail(c, "VALIDATION_ERROR", "Invalid job id.", 400);
    }

    const db = getDb(c);
    const row = await findJobById(db, id);
    if (!row) return fail(c, "JOB_NOT_FOUND", "Job not found.", 404);

    if (appUser.role === "employer" && row.companyOwnerUserId !== appUser.id) {
      return fail(c, "FORBIDDEN", "You can only manage your own jobs.", 403);
    }
    if (row.job.status !== "published") {
      return fail(
        c,
        "INVALID_TRANSITION",
        "Only published jobs can be closed.",
        409,
      );
    }

    const updated = await setJobStatus(db, id, "closed");
    if (!updated) return fail(c, "JOB_NOT_FOUND", "Job not found.", 404);
    return ok(c, await toPublicJob(db, updated, row.companyName));
  },
);

jobRoutes.post(
  "/:id/reopen",
  requireClerkAuth,
  requireAppUser,
  requireRoles("employer", "admin"),
  async (c) => {
    const appUser = c.get("appUser");
    if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) {
      return fail(c, "VALIDATION_ERROR", "Invalid job id.", 400);
    }

    const db = getDb(c);
    const row = await findJobById(db, id);
    if (!row) return fail(c, "JOB_NOT_FOUND", "Job not found.", 404);

    if (appUser.role === "employer" && row.companyOwnerUserId !== appUser.id) {
      return fail(c, "FORBIDDEN", "You can only manage your own jobs.", 403);
    }
    if (row.job.status !== "closed") {
      return fail(
        c,
        "INVALID_TRANSITION",
        "Only closed jobs can be reopened.",
        409,
      );
    }

    const publicJob = await toPublicJob(db, row.job, row.companyName);
    if (publicJob.skills.length < 3) {
      return fail(
        c,
        "SKILLS_REQUIRED",
        "Add at least 3 required skills before reopening. Project Horizon is skills-first.",
        400,
      );
    }

    const updated = await setJobStatus(db, id, "published");
    if (!updated) return fail(c, "JOB_NOT_FOUND", "Job not found.", 404);
    return ok(c, await toPublicJob(db, updated, row.companyName));
  },
);
