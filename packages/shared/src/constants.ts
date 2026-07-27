export const API_VERSION_PREFIX = "/api/v1" as const;

/**
 * Internal role identifiers stay `job_seeker` / `employer` for schema and API
 * stability. The product surfaces these to users as "Candidate" / "Business".
 */
export const USER_ROLES = ["job_seeker", "employer", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const VERIFICATION_STATUSES = [
  "pending_review",
  "approved",
  "rejected",
  "suspended",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const REMOTE_TYPES = ["on_site", "hybrid", "remote"] as const;
export type RemoteType = (typeof REMOTE_TYPES)[number];

export const AVAILABILITY_OPTIONS = [
  "immediate",
  "within_one_month",
  "freelance",
  "permanent",
] as const;
export type AvailabilityOption = (typeof AVAILABILITY_OPTIONS)[number];

export const AVAILABILITY_LABELS: Record<AvailabilityOption, string> = {
  immediate: "Available immediately",
  within_one_month: "Available within one month",
  freelance: "Freelance",
  permanent: "Permanent",
};

export const REMOTE_TYPE_LABELS: Record<RemoteType, string> = {
  on_site: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
};

export const CANDIDATE_REVIEW_ACTIONS = ["skip", "viewed"] as const;
export type CandidateReviewAction = (typeof CANDIDATE_REVIEW_ACTIONS)[number];

export const PROJECT_MEDIA_TYPES = ["image", "video", "document", "link"] as const;
export type ProjectMediaType = (typeof PROJECT_MEDIA_TYPES)[number];

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_PORTFOLIO_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;
export const ALLOWED_PORTFOLIO_DOCUMENT_MIME_TYPES = [
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
  "manage_businesses",
  "manage_users",
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
      "manage_businesses",
      "manage_users",
      "manage_homepage",
      "view_audit",
      "view_reports",
    ],
    editor: ["manage_homepage", "view_reports"],
    moderator: ["manage_businesses", "manage_users", "view_audit"],
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

/**
 * Free / consumer mail providers blocked for business company email.
 * Company-domain addresses are required for activation and trust.
 */
export const FREE_EMAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "hotmail.co.uk",
  "live.com",
  "live.co.uk",
  "msn.com",
  "yahoo.com",
  "yahoo.co.uk",
  "ymail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "mail.com",
  "gmx.com",
  "gmx.co.uk",
  "zoho.com",
  "yandex.com",
  "yandex.ru",
  "fastmail.com",
  "tutanota.com",
  "tutamail.com",
] as const;

const FREE_EMAIL_DOMAIN_SET = new Set<string>(FREE_EMAIL_DOMAINS);

export function emailDomain(email: string): string | null {
  const at = email.trim().toLowerCase().lastIndexOf("@");
  if (at < 0 || at === email.length - 1) return null;
  return email.trim().toLowerCase().slice(at + 1);
}

/** True when the address is usable as a SkillsPhase company email. */
export function isCompanyEmailAllowed(email: string): boolean {
  const domain = emailDomain(email);
  if (!domain) return false;
  if (FREE_EMAIL_DOMAIN_SET.has(domain)) return false;
  // Block subdomains of free providers (e.g. mail.googlemail.com) — rare but cheap.
  for (const free of FREE_EMAIL_DOMAINS) {
    if (domain.endsWith(`.${free}`)) return false;
  }
  return true;
}

export const COMPANY_EMAIL_HINT =
  "Use a company email (not Gmail, Outlook, Yahoo, etc.). Activation is sent here after approval.";
