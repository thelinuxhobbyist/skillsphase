import {
  adminRemoveJob,
  countPendingApplications,
  countPublishedJobs,
  countUsersByRole,
  createAdminAppUser,
  createJob,
  deleteAdminSessionsForUser,
  findCompanyById,
  findJobById,
  findUserByEmail,
  findUserById,
  listAdminLogs,
  listCompaniesForAdmin,
  listJobsForAdmin,
  listRecentAdminLogs,
  listUsersForAdmin,
  reactivateAppUser,
  setAdminPasswordHash,
  softDeleteAppUser,
  suspendAppUser,
  toAdminUserView,
  toPublicCompany,
  toPublicJob,
  touchAdminLogin,
  updateAdminStaff,
  updateCompany,
  writeAdminLog,
} from "@horizon/database";
import {
  adminEmployerActionSchema,
  adminUserActionSchema,
  createAdminStaffSchema,
  createJobSchema,
  resetAdminPasswordSchema,
  updateAdminStaffSchema,
  USER_ROLES,
  VERIFICATION_STATUSES,
} from "@horizon/shared";
import { Hono } from "hono";
import type { AppEnv } from "../env";
import { staffCan, wouldRemoveLastRootAdmin } from "../lib/admin-guard";
import { hashPassword } from "../lib/admin-crypto";
import { getDb } from "../lib/db";
import { employerApprovalEmailHtml, sendEmail } from "../lib/email";
import { requireAdminAuth } from "../lib/require-admin-auth";
import { fail, ok } from "../lib/response";
import { adminAuthRoutes } from "./admin-auth";

export const adminRoutes = new Hono<AppEnv>();

adminRoutes.route("/auth", adminAuthRoutes);

const secured = new Hono<AppEnv>();
secured.use("*", requireAdminAuth);

secured.post("/session", async (c) => {
  const admin = c.get("appUser");
  if (!admin) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  const db = getDb(c);
  const updated = await touchAdminLogin(db, admin.id);

  const last = admin.lastAdminLoginAt?.getTime() ?? 0;
  const twelveHours = 12 * 60 * 60 * 1000;
  if (Date.now() - last > twelveHours) {
    await writeAdminLog(db, {
      adminUserId: admin.id,
      action: "Admin Login",
      entity: "user",
      entityId: admin.id,
    });
  }

  return ok(c, toAdminUserView(updated ?? admin));
});

secured.get("/dashboard", async (c) => {
  const db = getDb(c);
  const employers = await listCompaniesForAdmin(db);
  const pending = employers.filter((e) => e.verificationStatus === "pending_review");
  const [
    activeJobs,
    totalJobSeekers,
    pendingApplications,
    recentActions,
  ] = await Promise.all([
    countPublishedJobs(db),
    countUsersByRole(db, "job_seeker"),
    countPendingApplications(db),
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
    recentActions,
  });
});

secured.get("/reports", async (c) => {
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

secured.get("/employers", async (c) => {
  const statusParam = c.req.query("status");
  const status =
    statusParam &&
    (VERIFICATION_STATUSES as readonly string[]).includes(statusParam)
      ? (statusParam as (typeof VERIFICATION_STATUSES)[number])
      : undefined;

  return ok(c, await listCompaniesForAdmin(getDb(c), status));
});

secured.patch("/employers/:id", async (c) => {
  const admin = c.get("appUser");
  if (!admin) {
    return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  }
  if (!staffCan(admin, "manage_employers")) {
    return fail(
      c,
      "FORBIDDEN",
      "You do not have permission to manage employers.",
      403,
    );
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

secured.get("/users", async (c) => {
  const roleParam = c.req.query("role");
  const q = c.req.query("q") ?? undefined;
  const role =
    roleParam && (USER_ROLES as readonly string[]).includes(roleParam)
      ? (roleParam as (typeof USER_ROLES)[number])
      : undefined;

  return ok(c, await listUsersForAdmin(getDb(c), { role, q }));
});

secured.patch("/users/:id", async (c) => {
  const admin = c.get("appUser");
  if (!admin) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  if (!staffCan(admin, "manage_users")) {
    return fail(c, "FORBIDDEN", "You do not have permission to manage users.", 403);
  }

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

  if (
    target.role === "admin" &&
    (parsed.data.action === "suspend" || parsed.data.action === "delete")
  ) {
    if (!staffCan(admin, "manage_admins")) {
      return fail(
        c,
        "FORBIDDEN",
        "You do not have permission to manage administrators.",
        403,
      );
    }
    if (
      await wouldRemoveLastRootAdmin(db, target, { deleteOrSuspend: true })
    ) {
      return fail(
        c,
        "LAST_ROOT_ADMIN",
        "Cannot suspend or delete the last Root Administrator.",
        403,
      );
    }
  }

  if (parsed.data.action === "suspend") {
    const updated = await suspendAppUser(db, target.id);
    if (!updated) return fail(c, "USER_NOT_FOUND", "User not found.", 404);
    if (target.role === "admin") {
      await deleteAdminSessionsForUser(db, target.id);
    }
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
  if (target.role === "admin") {
    await deleteAdminSessionsForUser(db, target.id);
  } else if (!target.clerkUserId.startsWith("local-admin:")) {
    try {
      const { createClerkClient } = await import("@clerk/backend");
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
  }

  await writeAdminLog(db, {
    adminUserId: admin.id,
    action: "User Deleted",
    entity: "user",
    entityId: target.id,
  });

  return ok(c, { deleted: true, id: target.id });
});

secured.get("/staff", async (c) => {
  const admin = c.get("appUser");
  if (!admin) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  if (!staffCan(admin, "manage_admins") && !staffCan(admin, "view_audit")) {
    return fail(
      c,
      "FORBIDDEN",
      "You do not have permission to view administrators.",
      403,
    );
  }

  const q = c.req.query("q") ?? undefined;
  const staff = await listUsersForAdmin(getDb(c), { role: "admin", q });
  return ok(c, staff);
});

secured.post("/staff", async (c) => {
  const admin = c.get("appUser");
  if (!admin) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  if (!staffCan(admin, "manage_admins")) {
    return fail(
      c,
      "FORBIDDEN",
      "Only Root Administrators can create administrator accounts.",
      403,
    );
  }

  const body = await c.req.json().catch(() => null);
  const parsed = createAdminStaffSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid administrator payload.",
      400,
    );
  }

  if (parsed.data.isRootAdmin && !admin.isRootAdmin) {
    return fail(
      c,
      "FORBIDDEN",
      "Only a Root Administrator can create another Root Administrator.",
      403,
    );
  }

  const db = getDb(c);
  const email = parsed.data.email.toLowerCase();
  const existing = await findUserByEmail(db, email);
  if (existing) {
    return fail(
      c,
      "EMAIL_IN_USE",
      "An account with this email already exists.",
      409,
    );
  }

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    const created = await createAdminAppUser(db, {
      clerkUserId: `local-admin:${crypto.randomUUID()}`,
      email,
      firstName: parsed.data.firstName ?? null,
      lastName: parsed.data.lastName ?? null,
      isRootAdmin: parsed.data.isRootAdmin ?? false,
      adminRole: parsed.data.isRootAdmin ? "root" : parsed.data.adminRole,
      adminPermissions: parsed.data.permissions ?? null,
      passwordHash,
    });

    await writeAdminLog(db, {
      adminUserId: admin.id,
      action: "Admin Created",
      entity: "user",
      entityId: created.id,
      notes: `${email} (${created.adminRole ?? "admin"})`,
    });

    return ok(c, toAdminUserView(created), 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create admin row.";
    return fail(c, "ADMIN_CREATE_FAILED", message, 500);
  }
});

secured.patch("/staff/:id", async (c) => {
  const admin = c.get("appUser");
  if (!admin) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  if (!staffCan(admin, "manage_admins")) {
    return fail(
      c,
      "FORBIDDEN",
      "You do not have permission to manage administrators.",
      403,
    );
  }

  const body = await c.req.json().catch(() => null);
  const parsed = updateAdminStaffSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid update.",
      400,
    );
  }

  const db = getDb(c);
  const target = await findUserById(db, c.req.param("id"));
  if (!target || target.role !== "admin") {
    return fail(c, "USER_NOT_FOUND", "Administrator not found.", 404);
  }

  const nextIsRoot =
    parsed.data.isRootAdmin ??
    (parsed.data.adminRole === "root" ? true : undefined);

  if (
    nextIsRoot === false ||
    (parsed.data.adminRole &&
      parsed.data.adminRole !== "root" &&
      target.isRootAdmin)
  ) {
    if (
      await wouldRemoveLastRootAdmin(db, target, {
        isRootAdmin: false,
      })
    ) {
      return fail(
        c,
        "LAST_ROOT_ADMIN",
        "Cannot demote the last Root Administrator.",
        403,
      );
    }
  }

  if (
    (parsed.data.isRootAdmin === true || parsed.data.adminRole === "root") &&
    !admin.isRootAdmin
  ) {
    return fail(
      c,
      "FORBIDDEN",
      "Only a Root Administrator can grant Root Administrator.",
      403,
    );
  }

  if (parsed.data.email && parsed.data.email.toLowerCase() !== target.email) {
    const clash = await findUserByEmail(db, parsed.data.email);
    if (clash && clash.id !== target.id) {
      return fail(c, "EMAIL_IN_USE", "That email is already in use.", 409);
    }
  }

  const isRootAdmin =
    nextIsRoot ??
    (parsed.data.adminRole === "root" ? true : target.isRootAdmin);
  const adminRole = isRootAdmin
    ? "root"
    : (parsed.data.adminRole ?? target.adminRole ?? "admin");

  const updated = await updateAdminStaff(db, target.id, {
    email: parsed.data.email?.toLowerCase(),
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    isRootAdmin,
    adminRole: adminRole === "root" ? "root" : adminRole,
    adminPermissions: parsed.data.permissions,
  });

  if (!updated) {
    return fail(c, "USER_NOT_FOUND", "Administrator not found.", 404);
  }

  await writeAdminLog(db, {
    adminUserId: admin.id,
    action: "Admin Updated",
    entity: "user",
    entityId: target.id,
    notes: JSON.stringify(parsed.data),
  });

  return ok(c, toAdminUserView(updated));
});

secured.post("/staff/:id/reset-password", async (c) => {
  const admin = c.get("appUser");
  if (!admin) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  if (!staffCan(admin, "manage_admins")) {
    return fail(
      c,
      "FORBIDDEN",
      "You do not have permission to reset administrator passwords.",
      403,
    );
  }

  const body = await c.req.json().catch(() => null);
  const parsed = resetAdminPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid password.",
      400,
    );
  }

  const db = getDb(c);
  const target = await findUserById(db, c.req.param("id"));
  if (!target || target.role !== "admin") {
    return fail(c, "USER_NOT_FOUND", "Administrator not found.", 404);
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const updated = await setAdminPasswordHash(db, target.id, passwordHash);
  if (!updated) {
    return fail(c, "USER_NOT_FOUND", "Administrator not found.", 404);
  }
  await deleteAdminSessionsForUser(db, target.id);

  await writeAdminLog(db, {
    adminUserId: admin.id,
    action: "Admin Password Reset",
    entity: "user",
    entityId: target.id,
  });

  return ok(c, { reset: true, id: target.id });
});

secured.get("/audit", async (c) => {
  return ok(c, await listAdminLogs(getDb(c), 200));
});

secured.get("/jobs", async (c) => {
  const jobs = await listJobsForAdmin(getDb(c));
  return ok(c, jobs);
});

secured.post("/jobs", async (c) => {
  const admin = c.get("appUser");
  if (!admin) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  if (!staffCan(admin, "manage_jobs")) {
    return fail(c, "FORBIDDEN", "You do not have permission to manage jobs.", 403);
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

  if (!parsed.data.companyId) {
    return fail(
      c,
      "VALIDATION_ERROR",
      "Admins must supply companyId when creating a job.",
      400,
    );
  }

  const db = getDb(c);
  const company = await findCompanyById(db, parsed.data.companyId);
  if (!company || company.verificationStatus !== "approved") {
    return fail(
      c,
      "COMPANY_NOT_APPROVED",
      "Jobs can only be created for approved companies.",
      400,
    );
  }

  const created = await createJob(db, {
    companyId: parsed.data.companyId,
    createdByUserId: admin.id,
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
    niceToHaveSkillNames: parsed.data.niceToHaveSkillNames,
    companyAbout: parsed.data.companyAbout,
    companySize: parsed.data.companySize,
    benefits: parsed.data.benefits,
    whyReturners: parsed.data.whyReturners,
    applicationProcess: parsed.data.applicationProcess,
    workingPatternDetail: parsed.data.workingPatternDetail,
    contractDetails: parsed.data.contractDetails,
    publish: parsed.data.publish ?? true,
  });

  await writeAdminLog(db, {
    adminUserId: admin.id,
    action: "Job Created By Admin",
    entity: "job",
    entityId: String(created.id),
    notes: `company ${parsed.data.companyId}`,
  });

  return ok(c, created, 201);
});

secured.delete("/jobs/:id", async (c) => {
  const admin = c.get("appUser");
  if (!admin) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  if (!staffCan(admin, "manage_jobs")) {
    return fail(c, "FORBIDDEN", "You do not have permission to manage jobs.", 403);
  }

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

adminRoutes.route("/", secured);
