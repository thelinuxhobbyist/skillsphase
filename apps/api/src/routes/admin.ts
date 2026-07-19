import { createClerkClient } from "@clerk/backend";
import {
  adminRemoveJob,
  countPendingApplications,
  countPublishedJobs,
  countUsersByRole,
  findCompanyById,
  findJobById,
  findUserById,
  listAdminLogs,
  listCompaniesForAdmin,
  listJobsForAdmin,
  listRecentAdminLogs,
  listRecentUsers,
  listUsersForAdmin,
  reactivateAppUser,
  softDeleteAppUser,
  suspendAppUser,
  toAdminUserView,
  toPublicCompany,
  toPublicJob,
  updateCompany,
  writeAdminLog,
} from "@horizon/database";
import {
  adminEmployerActionSchema,
  adminUserActionSchema,
  USER_ROLES,
  VERIFICATION_STATUSES,
} from "@horizon/shared";
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
  const [
    activeJobs,
    totalJobSeekers,
    pendingApplications,
    recentUsers,
    recentActions,
  ] = await Promise.all([
    countPublishedJobs(db),
    countUsersByRole(db, "job_seeker"),
    countPendingApplications(db),
    listRecentUsers(db, 8),
    listRecentAdminLogs(db, 8),
  ]);

  return ok(c, {
    pendingEmployers: pending.length,
    totalEmployers: employers.length,
    approvedEmployers: employers.filter((e) => e.verificationStatus === "approved")
      .length,
    activeJobs,
    totalJobSeekers,
    pendingApplications,
    recentUsers,
    recentActions,
  });
});

adminRoutes.get("/reports", async (c) => {
  const db = getDb(c);
  const employers = await listCompaniesForAdmin(db);
  return ok(c, {
    note: "MVP placeholder — advanced analytics are out of scope.",
    totalEmployers: employers.length,
    approvedEmployers: employers.filter((e) => e.verificationStatus === "approved")
      .length,
    pendingEmployers: employers.filter((e) => e.verificationStatus === "pending_review")
      .length,
    activeJobs: await countPublishedJobs(db),
    totalJobSeekers: await countUsersByRole(db, "job_seeker"),
    totalEmployerUsers: await countUsersByRole(db, "employer"),
    pendingApplications: await countPendingApplications(db),
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

adminRoutes.get("/users", async (c) => {
  const roleParam = c.req.query("role");
  const q = c.req.query("q") ?? undefined;
  const role =
    roleParam && (USER_ROLES as readonly string[]).includes(roleParam)
      ? (roleParam as (typeof USER_ROLES)[number])
      : undefined;

  return ok(c, await listUsersForAdmin(getDb(c), { role, q }));
});

adminRoutes.patch("/users/:id", async (c) => {
  const admin = c.get("appUser");
  if (!admin) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

  const body = await c.req.json().catch(() => null);
  const parsed = adminUserActionSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid user action.",
      400,
    );
  }

  const db = getDb(c);
  const target = await findUserById(db, c.req.param("id"));
  if (!target) {
    return fail(c, "USER_NOT_FOUND", "User not found.", 404);
  }

  if (target.id === admin.id) {
    return fail(
      c,
      "FORBIDDEN",
      "Administrators cannot modify their own account here.",
      403,
    );
  }

  if (parsed.data.action === "suspend") {
    const updated = await suspendAppUser(db, target.id);
    if (!updated) return fail(c, "USER_NOT_FOUND", "User not found.", 404);
    await writeAdminLog(db, {
      adminUserId: admin.id,
      action: "User Suspended",
      entity: "user",
      entityId: target.id,
    });
    return ok(c, toAdminUserView(updated));
  }

  if (parsed.data.action === "reactivate") {
    const updated = await reactivateAppUser(db, target.id);
    if (!updated) return fail(c, "USER_NOT_FOUND", "User not found.", 404);
    await writeAdminLog(db, {
      adminUserId: admin.id,
      action: "User Reactivated",
      entity: "user",
      entityId: target.id,
    });
    return ok(c, toAdminUserView(updated));
  }

  await softDeleteAppUser(db, target.id);
  try {
    const clerk = createClerkClient({
      secretKey: c.env.CLERK_SECRET_KEY,
      publishableKey: c.env.CLERK_PUBLISHABLE_KEY,
    });
    await clerk.users.deleteUser(target.clerkUserId);
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        requestId: c.get("requestId"),
        message:
          error instanceof Error
            ? error.message
            : "failed_to_delete_clerk_user",
      }),
    );
  }

  await writeAdminLog(db, {
    adminUserId: admin.id,
    action: "User Deleted",
    entity: "user",
    entityId: target.id,
  });

  return ok(c, { deleted: true, id: target.id });
});

adminRoutes.get("/audit", async (c) => {
  return ok(c, await listAdminLogs(getDb(c), 200));
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
