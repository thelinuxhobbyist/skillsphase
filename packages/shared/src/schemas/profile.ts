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

export const setSkillsSchema = z.object({
  skillIds: z.array(z.string().uuid()).min(0),
});

/** Convenient for MVP UI — upsert skills by name, then attach to the user. */
export const setSkillsByNameSchema = z.object({
  skills: z.array(z.string().trim().min(1).max(80)).max(40),
});


/** Fields required before a job seeker may apply (ADR 001). */
export const profileCompletionSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().email(),
  city: z.string().trim().min(1),
  country: z.string().trim().min(1),
  careerSummary: z.string().trim().min(1),
  skillCount: z.number().int().min(1),
  hasCv: z.literal(true),
});
