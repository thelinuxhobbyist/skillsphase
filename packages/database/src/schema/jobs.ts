import {
  bigint,
  boolean,
  date,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { applicationStatusEnum, jobStatusEnum, remoteTypeEnum } from "./enums";
import { companies } from "./companies";
import { skills } from "./profile";
import { users } from "./users";

export const jobs = pgTable("jobs", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "restrict" }),
  createdByUserId: uuid("created_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  salaryMin: numeric("salary_min", { precision: 12, scale: 2 }),
  salaryMax: numeric("salary_max", { precision: 12, scale: 2 }),
  salaryCurrency: text("salary_currency").notNull().default("GBP"),
  location: text("location").notNull(),
  remoteType: remoteTypeEnum("remote_type").notNull(),
  employmentType: text("employment_type").notNull(),
  industry: text("industry").notNull(),
  closingDate: date("closing_date"),
  status: jobStatusEnum("status").notNull().default("draft"),
  removedByAdmin: boolean("removed_by_admin").notNull().default(false),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Application uses the SkillsPhase profile — not a CV upload.
 * `profileSnapshot` captures the public application view at apply time.
 * Documents (CV, certificates, references) are requested later (progressive trust).
 */
export const applications = pgTable("applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobId: bigint("job_id", { mode: "number" })
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  coverLetter: text("cover_letter"),
  profileSnapshot: jsonb("profile_snapshot").$type<Record<string, unknown>>(),
  status: applicationStatusEnum("status").notNull().default("applied"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const jobSkills = pgTable(
  "job_skills",
  {
    jobId: bigint("job_id", { mode: "number" })
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.jobId, table.skillId] })],
);
