import { z } from "zod";
import {
  EMPLOYER_ASSIGNABLE_STATUSES,
  REMOTE_TYPES,
  USER_ROLES,
  VERIFICATION_STATUSES,
} from "../constants";

export const adminPermissionSchema = z.enum([
  "manage_employers",
  "manage_users",
  "manage_jobs",
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

/** Roles a new user may self-assign. Admins are provisioned out-of-band. */
export const bootstrapRoleSchema = z.object({
  role: z.enum(["job_seeker", "employer"]),
});

export const updateUserProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  phoneNumber: z.string().trim().max(40).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  country: z.string().trim().max(120).optional().nullable(),
  careerSummary: z.string().trim().max(5000).optional().nullable(),
  careerGapNarrative: z.string().trim().max(5000).optional().nullable(),
  coverLetterTemplate: z.string().trim().max(10000).optional().nullable(),
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
  businessEmail: z.string().email(),
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
  businessEmail: z.string().email().optional(),
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

export const waitlistSchema = z.object({
  email: z.string().email(),
  companyName: z.string().trim().max(200).optional(),
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .length(2)
    .refine((code) => code !== "GB", {
      message: "UK employers should register normally, not via the waitlist",
    }),
  notes: z.string().trim().max(1000).optional(),
});

export const createJobSchema = z
  .object({
    companyId: z.string().uuid().optional(),
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1).max(50000),
    salaryMin: z.number().nonnegative().optional().nullable(),
    salaryMax: z.number().nonnegative().optional().nullable(),
    salaryCurrency: z.string().trim().length(3).default("GBP"),
    location: z.string().trim().min(1).max(200),
    remoteType: z.enum(REMOTE_TYPES),
    employmentType: z.string().trim().min(1).max(80),
    industry: z.string().trim().min(1).max(120),
    closingDate: z.string().date().optional().nullable(),
    skillIds: z.array(z.string().uuid()).default([]),
    skillNames: z.array(z.string().trim().min(1).max(80)).max(40).default([]),
    publish: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    const skillCount = data.skillIds.length + data.skillNames.length;
    if (skillCount < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["skillNames"],
        message:
          "Add at least 3 required skills. Project Horizon is skills-first — lead with abilities, not employment history.",
      });
    }
  });

export const updateJobSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).max(50000).optional(),
    salaryMin: z.number().nonnegative().optional().nullable(),
    salaryMax: z.number().nonnegative().optional().nullable(),
    salaryCurrency: z.string().trim().length(3).optional(),
    location: z.string().trim().min(1).max(200).optional(),
    remoteType: z.enum(REMOTE_TYPES).optional(),
    employmentType: z.string().trim().min(1).max(80).optional(),
    industry: z.string().trim().min(1).max(120).optional(),
    closingDate: z.string().date().optional().nullable(),
    skillIds: z.array(z.string().uuid()).optional(),
    skillNames: z.array(z.string().trim().min(1).max(80)).max(40).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.skillIds !== undefined || data.skillNames !== undefined) {
      const skillCount =
        (data.skillIds?.length ?? 0) + (data.skillNames?.length ?? 0);
      if (skillCount < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["skillNames"],
          message:
            "Keep at least 3 required skills. List the abilities this role needs first.",
        });
      }
    }
  });


export const jobListQuerySchema = paginationQuerySchema.extend({
  keyword: z.string().trim().max(200).optional(),
  location: z.string().trim().max(200).optional(),
  employmentType: z.string().trim().max(80).optional(),
  remoteType: z.enum(REMOTE_TYPES).optional(),
  industry: z.string().trim().max(120).optional(),
});

export const applyToJobSchema = z.object({
  coverLetter: z.string().trim().max(10000).optional().nullable(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(EMPLOYER_ASSIGNABLE_STATUSES),
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
