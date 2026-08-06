import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Internal role identifiers kept as `job_seeker` / `employer` for schema and
 * API stability. The product surfaces these as "Candidate" / "Business".
 */
export const userRoleEnum = pgEnum("user_role", [
  "job_seeker",
  "employer",
  "admin",
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "pending_review",
  "approved",
  "rejected",
  "suspended",
]);

export const remoteTypeEnum = pgEnum("remote_type", [
  "on_site",
  "hybrid",
  "remote",
]);

export const availabilityEnum = pgEnum("availability", [
  "immediate",
  "within_one_month",
  "freelance",
  "permanent",
]);

export const candidateReviewActionEnum = pgEnum("candidate_review_action", [
  "skip",
  "viewed",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "draft",
  "published",
  "closed",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "applied",
  "under_review",
  "interview",
  "offer",
  "hired",
  "rejected",
  "withdrawn",
]);
