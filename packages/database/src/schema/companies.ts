import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { verificationStatusEnum } from "./enums";
import { users } from "./users";

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerUserId: uuid("owner_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  companyNumber: text("company_number").notNull().unique(),
  companyName: text("company_name").notNull(),
  website: text("website").notNull(),
  businessEmail: text("business_email").notNull(),
  recruiterName: text("recruiter_name").notNull(),
  recruiterJobTitle: text("recruiter_job_title").notNull(),
  verificationStatus: verificationStatusEnum("verification_status")
    .notNull()
    .default("pending_review"),
  companiesHouseVerified: boolean("companies_house_verified")
    .notNull()
    .default(false),
  businessEmailVerified: boolean("business_email_verified")
    .notNull()
    .default(false),
  businessEmailVerifiedAt: timestamp("business_email_verified_at", {
    withTimezone: true,
  }),
  companiesHousePayload: jsonb("companies_house_payload"),
  rejectionReason: text("rejection_reason"),
  countryCode: text("country_code").notNull().default("GB"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
