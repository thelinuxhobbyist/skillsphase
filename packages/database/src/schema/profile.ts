import {
  boolean,
  date,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/** Public/private trust signal verification states (Phase 2C expands usage). */
export type RecommendationVerificationStatus =
  | "unverified"
  | "self_attested"
  | "verified";

export const employmentHistory = pgTable("employment_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  employerName: text("employer_name").notNull(),
  jobTitle: text("job_title").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  currentlyWorking: boolean("currently_working").notNull().default(false),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const education = pgTable("education", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  institution: text("institution").notNull(),
  qualification: text("qualification").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const qualifications = pgTable("qualifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  issuingBody: text("issuing_body"),
  dateAwarded: date("date_awarded"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Professional references / recommendations.
 * Public profile shows anonymous context + summary only; referee identity and
 * full document stay private until controlled employer access (future).
 */
export const recommendations = pgTable("recommendations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  /** Private — never shown on public profiles. */
  authorName: text("author_name"),
  relationship: text("relationship").notNull(),
  /** Short extract shown publicly. */
  publicSummary: text("public_summary").notNull().default(""),
  /** Optional theme chips shown publicly. */
  keyThemes: jsonb("key_themes").$type<string[]>().notNull().default([]),
  /** Private full letter/text when no document upload. */
  body: text("body"),
  verificationStatus: text("verification_status")
    .$type<RecommendationVerificationStatus | null>()
    .default("self_attested"),
  /** Private R2 object key for a full reference letter (future upload flow). */
  documentKey: text("document_key"),
  documentFileName: text("document_file_name"),
  documentContentType: text("document_content_type"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const skills = pgTable("skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userSkills = pgTable(
  "user_skills",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.skillId] })],
);

export type SupportingInformationType =
  | "portfolio"
  | "website"
  | "github"
  | "cv"
  | "references"
  | "certifications"
  | "professional_registrations"
  | "licences"
  | "awards"
  | "other";

export const supportingInformation = pgTable("supporting_information", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<SupportingInformationType>().notNull().default("other"),
  title: text("title").notNull(),
  url: text("url"),
  description: text("description"),
  documentKey: text("document_key"),
  documentFileName: text("document_file_name"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

