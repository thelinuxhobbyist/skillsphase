import { z } from "zod";

export const employmentHistorySchema = z.object({
  employerName: z.string().trim().min(1).max(200),
  jobTitle: z.string().trim().min(1).max(200),
  startDate: z.string().date(),
  endDate: z.string().date().optional().nullable(),
  currentlyWorking: z.boolean().default(false),
  description: z.string().trim().max(5000).optional().nullable(),
});

export const educationSchema = z.object({
  institution: z.string().trim().min(1).max(200),
  qualification: z.string().trim().min(1).max(200),
  startDate: z.string().date(),
  endDate: z.string().date().optional().nullable(),
  description: z.string().trim().max(5000).optional().nullable(),
});

export const qualificationSchema = z.object({
  name: z.string().trim().min(1).max(200),
  issuingBody: z.string().trim().max(200).optional().nullable(),
  dateAwarded: z.string().date().optional().nullable(),
  description: z.string().trim().max(5000).optional().nullable(),
});

export const RECOMMENDATION_VERIFICATION_STATUSES = [
  "unverified",
  "self_attested",
  "verified",
] as const;

export const recommendationSchema = z.object({
  /** Private — never shown on public profiles. */
  authorName: z.string().trim().max(200).optional().nullable(),
  relationship: z.string().trim().min(1).max(200),
  /** Short extract shown publicly (not a full reference letter). */
  publicSummary: z.string().trim().min(1).max(400),
  keyThemes: z.array(z.string().trim().min(1).max(60)).max(8).optional(),
  /** Private full text; optional when a document will be attached later. */
  body: z.string().trim().max(20000).optional().nullable(),
  verificationStatus: z
    .enum(RECOMMENDATION_VERIFICATION_STATUSES)
    .optional()
    .nullable(),
});

/** Convenient for MVP UI — upsert skills by name, then attach to the user. */
export const setSkillsByNameSchema = z.object({
  skills: z.array(z.string().trim().min(1).max(80)).max(40),
});
