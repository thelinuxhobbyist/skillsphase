import { z } from "zod";
import {
  EMPLOYMENT_TYPES,
  JOB_STATUSES,
  REMOTE_TYPES,
} from "../constants";
import { paginationQuerySchema } from "./api";

export const createJobSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(20000),
  location: z.string().trim().min(1).max(200),
  remoteType: z.enum(REMOTE_TYPES),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  industry: z.string().trim().min(1).max(120),
  salaryMin: z.number().nonnegative().optional().nullable(),
  salaryMax: z.number().nonnegative().optional().nullable(),
  salaryCurrency: z.string().trim().length(3).optional().default("GBP"),
  closingDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional()
    .nullable(),
  skillNames: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  publish: z.boolean().optional().default(false),
});

export const updateJobSchema = createJobSchema
  .omit({ publish: true })
  .partial()
  .extend({
    status: z.enum(JOB_STATUSES).optional(),
  });

export const listJobsQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().max(200).optional(),
  location: z.string().trim().max(200).optional(),
  remoteType: z.enum(REMOTE_TYPES).optional(),
  employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
  industry: z.string().trim().max(120).optional(),
});

export const applyToJobSchema = z.object({
  coverLetter: z.string().trim().max(5000).optional().nullable(),
});

const employerApplicationStatuses = [
  "under_review",
  "interview",
  "offer",
  "hired",
  "rejected",
] as const;

export const updateApplicationStatusSchema = z.object({
  status: z.enum(employerApplicationStatuses),
});
