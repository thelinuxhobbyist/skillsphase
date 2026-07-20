export const API_VERSION_PREFIX = "/api/v1" as const;

export const USER_ROLES = ["job_seeker", "employer", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const VERIFICATION_STATUSES = [
  "pending_review",
  "approved",
  "rejected",
  "suspended",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const JOB_STATUSES = ["draft", "published", "closed"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const REMOTE_TYPES = ["on_site", "hybrid", "remote"] as const;
export type RemoteType = (typeof REMOTE_TYPES)[number];

/** Canonical application lifecycle (ADR 001). */
export const APPLICATION_STATUSES = [
  "applied",
  "under_review",
  "interview",
  "offer",
  "hired",
  "rejected",
  "withdrawn",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

/** Statuses an employer/admin may assign (not including initial `applied` or seeker `withdrawn`). */
export const EMPLOYER_ASSIGNABLE_STATUSES = [
  "under_review",
  "interview",
  "offer",
  "hired",
  "rejected",
] as const;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_CV_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const DEFAULT_DATA_RETENTION_DAYS = 30;

/** Staff tiers for users with role=admin. Root is also flagged via isRootAdmin. */
export const ADMIN_STAFF_ROLES = [
  "root",
  "admin",
  "editor",
  "moderator",
] as const;
export type AdminStaffRole = (typeof ADMIN_STAFF_ROLES)[number];

export const ADMIN_PERMISSIONS = [
  "manage_employers",
  "manage_users",
  "manage_jobs",
  "manage_homepage",
  "manage_admins",
  "view_audit",
  "view_reports",
] as const;
export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

const ADMIN_ROLE_PERMISSIONS: Record<AdminStaffRole, readonly AdminPermission[]> =
  {
    root: ADMIN_PERMISSIONS,
    admin: [
      "manage_employers",
      "manage_users",
      "manage_jobs",
      "manage_homepage",
      "view_audit",
      "view_reports",
    ],
    editor: ["manage_jobs", "manage_homepage", "view_reports"],
    moderator: ["manage_employers", "manage_users", "view_audit"],
  };

export function permissionsForAdminStaff(input: {
  isRootAdmin: boolean;
  adminRole: string | null;
  adminPermissions: string[] | null;
}): AdminPermission[] {
  if (input.isRootAdmin || input.adminRole === "root") {
    return [...ADMIN_PERMISSIONS];
  }
  if (input.adminPermissions && input.adminPermissions.length > 0) {
    return ADMIN_PERMISSIONS.filter((p) => input.adminPermissions!.includes(p));
  }
  const role = (ADMIN_STAFF_ROLES as readonly string[]).includes(
    input.adminRole ?? "",
  )
    ? (input.adminRole as AdminStaffRole)
    : "admin";
  return [...ADMIN_ROLE_PERMISSIONS[role]];
}

export function adminHasPermission(
  input: {
    isRootAdmin: boolean;
    adminRole: string | null;
    adminPermissions: string[] | null;
  },
  permission: AdminPermission,
): boolean {
  return permissionsForAdminStaff(input).includes(permission);
}
