import {
  adminRemoveJob,
  countPublishedJobs,
  findCompanyById,
  findJobById,
  findUserById,
  listCompaniesForAdmin,
  listJobsForAdmin,
  toPublicCompany,
  toPublicJob,
  updateCompany,
  writeAdminLog,
} from "@horizon/database";
import { adminEmployerActionSchema, VERIFICATION_STATUSES } from "@horizon/shared";
import { Hono } from "hono";
import type { AppEnv } from "../env";
import { getDb } from "../lib/db";
import { employerApprovalEmailHtml, sendEmail } from "../lib/email";
import { fail, ok } from "../lib/response";
import {
  requireAppUser,
  requireClerkAuth,
  requireRoles,
} from "../middleware/auth";

export const adminRoutes = new Hono<AppEnv>();

adminRoutes.use("*", requireClerkAuth, requireAppUser, requireRoles("admin"));

adminRoutes.get("/dashboard", async (c) => {
  const db = getDb(c);
  const employers = await listCompaniesForAdmin(db);
  const pending = employers.filter((e) => e.verificationStatus === "pending_review");
  const activeJobs = await countPublishedJobs(db);

  return ok(c, {
    pendingEmployers: pending.length,
    totalEmployers: employers.length,
    approvedEmployers: employers.filter((e) => e.verificationStatus === "approved")
      .length,
    activeJobs,
  });
});

adminRoutes.get("/employers", async (c) => {
  const statusParam = c.req.query("status");
  const status =
    statusParam &&
    (VERIFICATION_STATUSES as readonly string[]).includes(statusParam)
      ? (statusParam as (typeof VERIFICATION_STATUSES)[number])
      : undefined;

  const db = getDb(c);
  const employers = await listCompaniesForAdmin(db, status);
  return ok(c, employers);
});

adminRoutes.patch("/employers/:id", async (c) => {
  const admin = c.get("appUser");
  if (!admin) {
    return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = adminEmployerActionSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid admin action.",
      400,
    );
  }

  if (parsed.data.action === "reject" && !parsed.data.rejectionReason) {
    return fail(
      c,
      "VALIDATION_ERROR",
      "A rejection reason is required.",
      400,
    );
  }

  const db = getDb(c);
  const company = await findCompanyById(db, c.req.param("id"));
  if (!company) {
    return fail(c, "COMPANY_NOT_FOUND", "Employer registration not found.", 404);
  }

  const action = parsed.data.action;
  let verificationStatus = company.verificationStatus;
  let rejectionReason = company.rejectionReason;

  switch (action) {
    case "approve":
      verificationStatus = "approved";
      rejectionReason = null;
      break;
    case "reject":
      verificationStatus = "rejected";
      rejectionReason = parsed.data.rejectionReason ?? null;
      break;
    case "suspend":
      verificationStatus = "suspended";
      break;
    case "reinstate":
      verificationStatus = "approved";
      rejectionReason = null;
      break;
  }

  const updated = await updateCompany(db, company, {
    verificationStatus,
    rejectionReason,
  });

  await writeAdminLog(db, {
    adminUserId: admin.id,
    action: `Employer ${action}`,
    entity: "company",
    entityId: updated.id,
    notes: parsed.data.rejectionReason,
  });

  if (action === "approve") {
    const owner = await findUserById(db, updated.ownerUserId);
    if (owner?.email) {
      await sendEmail({
        to: owner.email,
        subject: "Your Project Horizon employer account is approved",
        html: employerApprovalEmailHtml(updated.companyName),
        apiKey: c.env.EMAIL_API_KEY,
        from: c.env.EMAIL_FROM,
      });
    }
  }

  return ok(c, toPublicCompany(updated));
});

adminRoutes.get("/jobs", async (c) => {
  const jobs = await listJobsForAdmin(getDb(c));
  return ok(c, jobs);
});

adminRoutes.delete("/jobs/:id", async (c) => {
  const admin = c.get("appUser");
  if (!admin) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) {
    return fail(c, "VALIDATION_ERROR", "Invalid job id.", 400);
  }

  const db = getDb(c);
  const existing = await findJobById(db, id);
  if (!existing) return fail(c, "JOB_NOT_FOUND", "Job not found.", 404);

  const removed = await adminRemoveJob(db, id);
  if (!removed) return fail(c, "JOB_NOT_FOUND", "Job not found.", 404);

  await writeAdminLog(db, {
    adminUserId: admin.id,
    action: "Job Removed",
    entity: "job",
    entityId: String(id),
  });

  return ok(c, await toPublicJob(db, removed, existing.companyName));
});
