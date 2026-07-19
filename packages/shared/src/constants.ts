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
