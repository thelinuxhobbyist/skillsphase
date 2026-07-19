import {
  bigint,
  boolean,
  date,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { jobStatusEnum, remoteTypeEnum } from "./enums";
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
