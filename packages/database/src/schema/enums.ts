import { pgEnum } from "drizzle-orm/pg-core";

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

export const jobStatusEnum = pgEnum("job_status", [
  "draft",
  "published",
  "closed",
]);

export const remoteTypeEnum = pgEnum("remote_type", [
  "on_site",
  "hybrid",
  "remote",
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
