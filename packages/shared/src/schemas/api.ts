import { z } from "zod";
import {
  AVAILABILITY_OPTIONS,
  COMPANY_EMAIL_HINT,
  isCompanyEmailAllowed,
  PROJECT_MEDIA_TYPES,
  REMOTE_TYPES,
  USER_ROLES,
  VERIFICATION_STATUSES,
} from "../constants";

export const businessEmailSchema = z
  .string()
  .trim()
  .email()
  .refine((value) => isCompanyEmailAllowed(value), {
    message: COMPANY_EMAIL_HINT,
  });

export const adminPermissionSchema = z.enum([
  "manage_businesses",
  "manage_users",
  "manage_homepage",
  "manage_admins",
  "view_audit",
  "view_reports",
]);

export const apiSuccessSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  meta: z
    .object({
      page: z.number().int().positive(),
      pageSize: z.number().int().positive(),
      total: z.number().int().nonnegative(),
    })
    .optional(),
});

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

/** Roles a new user may self-assign: Candidate or Business. Admins are provisioned out-of-band. */
export const bootstrapRoleSchema = z.object({
  role: z.enum(["job_seeker", "employer"]),
});

/** Role-agnostic account identity fields (used by both Candidate and Business settings). */
export const updateUserProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  phoneNumber: z.string().trim().max(40).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  country: z.string().trim().max(120).optional().nullable(),
});

/** Candidate Skill Profile fields (job_seeker role only). */
export const updateCandidateProfileSchema = z.object({
  professionalTitle: z.string().trim().max(150).optional().nullable(),
  /** Kept for backwards compatibility; prefer PUT /me/capabilities. */
  primaryCapability: z.string().trim().max(120).optional().nullable(),
  careerSummary: z.string().trim().max(3000).optional().nullable(),
  remotePreference: z.enum(REMOTE_TYPES).optional().nullable(),
  availability: z.enum(AVAILABILITY_OPTIONS).optional().nullable(),
  yearsExperience: z.number().int().min(0).max(60).optional().nullable(),
  salaryMin: z.number().nonnegative().optional().nullable(),
  salaryMax: z.number().nonnegative().optional().nullable(),
  salaryCurrency: z.string().trim().length(3).optional(),
});

export const capabilityInputSchema = z.object({
  label: z.string().trim().min(1).max(120),
  isPrimary: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(100).optional(),
  skillNames: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  projectIds: z.array(z.string().uuid()).max(20).optional(),
});

export const setCapabilitiesSchema = z.object({
  capabilities: z.array(capabilityInputSchema).max(8),
});

export const createCompanySchema = z.object({
  companyNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{6,8}$/, "Enter a valid UK Companies House number"),
  website: z.string().url().refine((v) => v.startsWith("https://"), {
    message: "Website must use HTTPS",
  }),
  businessEmail: businessEmailSchema,
  recruiterName: z.string().trim().min(1).max(120),
  recruiterJobTitle: z.string().trim().min(1).max(120),
  countryCode: z.literal("GB").default("GB"),
});

export const updateCompanySchema = z.object({
  companyNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{6,8}$/, "Enter a valid UK Companies House number")
    .optional(),
  website: z
    .string()
    .url()
    .refine((v) => v.startsWith("https://"), {
      message: "Website must use HTTPS",
    })
    .optional(),
  businessEmail: businessEmailSchema.optional(),
  recruiterName: z.string().trim().min(1).max(120).optional(),
  recruiterJobTitle: z.string().trim().min(1).max(120).optional(),
});

export const verifyCompanySchema = z.object({
  companyNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{6,8}$/, "Enter a valid UK Companies House number"),
});

export const confirmBusinessEmailSchema = z.object({
  token: z.string().trim().min(10).max(200),
});

export const waitlistSchema = z.object({
  email: z.string().email(),
  companyName: z.string().trim().max(200).optional(),
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .length(2)
    .refine((code) => code !== "GB", {
      message: "UK businesses should register normally, not via the waitlist",
    }),
  notes: z.string().trim().max(1000).optional(),
});

export const projectMediaItemSchema = z.object({
  type: z.enum(PROJECT_MEDIA_TYPES),
  /** Either an absolute link (video/link types) or an internal `/api/v1/media/...` path (uploaded image/document). */
  url: z.string().trim().min(1).max(2000),
  label: z.string().trim().max(200).optional().nullable(),
});

export const projectSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional().nullable(),
  outcome: z.string().trim().max(500).optional().nullable(),
  role: z.string().trim().max(200).optional().nullable(),
  projectUrl: z.string().url().optional().nullable(),
  technologies: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  media: z.array(projectMediaItemSchema).max(20).default([]),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(1000).optional(),
});

export const discoveryQuerySchema = z.object({
  skills: z.string().trim().max(500).optional(),
  availability: z.enum(AVAILABILITY_OPTIONS).optional(),
  remoteType: z.enum(REMOTE_TYPES).optional(),
  minYearsExperience: z.coerce.number().int().min(0).max(60).optional(),
  keyword: z.string().trim().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const publicDiscoveryQuerySchema = z.object({
  skills: z.string().trim().max(500).optional(),
  availability: z.enum(AVAILABILITY_OPTIONS).optional(),
  remoteType: z.enum(REMOTE_TYPES).optional(),
  minYearsExperience: z.coerce.number().int().min(0).max(60).optional(),
  keyword: z.string().trim().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(24).default(12),
  offset: z.coerce.number().int().min(0).default(0),
});

export const reviewCandidateSchema = z.object({
  action: z.enum(["skip", "viewed"]),
});

export const saveCandidateSchema = z.object({
  listId: z.string().uuid().optional().nullable(),
});

export const createCandidateListSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export const createContactSchema = z.object({
  message: z.string().trim().min(1).max(3000),
});

export const sendMessageSchema = z.object({
  body: z.string().trim().min(1).max(3000),
});

export const adminEmployerActionSchema = z.object({
  action: z.enum(["approve", "reject", "suspend", "reinstate"]),
  rejectionReason: z.string().trim().min(1).max(2000).optional(),
});

export const adminUserActionSchema = z.object({
  action: z.enum(["suspend", "reactivate", "delete"]),
});

export const createAdminStaffSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  adminRole: z.enum(["admin", "editor", "moderator"]).default("admin"),
  isRootAdmin: z.boolean().optional().default(false),
  permissions: z.array(adminPermissionSchema).optional().nullable(),
});

export const updateAdminStaffSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().trim().min(1).max(100).optional().nullable(),
  lastName: z.string().trim().min(1).max(100).optional().nullable(),
  adminRole: z.enum(["admin", "editor", "moderator", "root"]).optional(),
  isRootAdmin: z.boolean().optional(),
  permissions: z.array(adminPermissionSchema).optional().nullable(),
});

export const resetAdminPasswordSchema = z.object({
  password: z.string().min(8).max(128),
});

export const roleSchema = z.enum(USER_ROLES);
export const verificationStatusSchema = z.enum(VERIFICATION_STATUSES);
