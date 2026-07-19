import { bigint, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { applicationStatusEnum } from "./enums";
import { jobs } from "./jobs";
import { users } from "./users";

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: bigint("job_id", { mode: "number" })
      .notNull()
      .references(() => jobs.id, { onDelete: "restrict" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    coverLetter: text("cover_letter"),
    cvUrl: text("cv_url").notNull(),
    cvFileName: text("cv_file_name"),
    status: applicationStatusEnum("status").notNull().default("applied"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique("applications_job_user_unique").on(table.jobId, table.userId)],
);
