import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { availabilityEnum, remoteTypeEnum, userRoleEnum } from "./enums";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  role: userRoleEnum("role").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phoneNumber: text("phone_number"),
  city: text("city"),
  country: text("country"),
  /** Short professional summary shown on the candidate's Skill Profile. */
  careerSummary: text("career_summary"),
  profilePhotoUrl: text("profile_photo_url"),
  /** Candidate Skill Profile fields (role = job_seeker only). */
  professionalTitle: text("professional_title"),
  remotePreference: remoteTypeEnum("remote_preference"),
  availability: availabilityEnum("availability"),
  yearsExperience: integer("years_experience"),
  salaryMin: numeric("salary_min", { precision: 12, scale: 2 }),
  salaryMax: numeric("salary_max", { precision: 12, scale: 2 }),
  salaryCurrency: text("salary_currency").notNull().default("GBP"),
  profileCompleted: boolean("profile_completed").notNull().default(false),
  /** Only true for root operators; never set via public signup. */
  isRootAdmin: boolean("is_root_admin").notNull().default(false),
  /** Staff tier when role=admin: admin | editor | moderator (root uses isRootAdmin). */
  adminRole: text("admin_role"),
  /** Optional permission overrides; null means use role defaults. */
  adminPermissions: jsonb("admin_permissions").$type<string[] | null>(),
  /** PBKDF2 password hash for local admin auth (never used for Clerk users). */
  passwordHash: text("password_hash"),
  lastAdminLoginAt: timestamp("last_admin_login_at", { withTimezone: true }),
  suspendedAt: timestamp("suspended_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
