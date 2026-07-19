import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { userRoleEnum } from "./enums";

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
  careerSummary: text("career_summary"),
  careerGapNarrative: text("career_gap_narrative"),
  coverLetterTemplate: text("cover_letter_template"),
  profilePhotoUrl: text("profile_photo_url"),
  cvUrl: text("cv_url"),
  cvFileName: text("cv_file_name"),
  profileCompleted: boolean("profile_completed").notNull().default(false),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
