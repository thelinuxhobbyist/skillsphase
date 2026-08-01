import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { projects } from "./marketplace";
import { skills } from "./profile";
import { users } from "./users";

/**
 * Candidate capabilities — what they can do.
 * Future trust columns (confidence / lastDemonstratedAt / verificationStatus)
 * are nullable placeholders for Phase 2C; unused in product today.
 */
export const candidateCapabilities = pgTable("candidate_capabilities", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  /** Reserved: emerging | proficient | expert (or numeric later). */
  confidence: text("confidence"),
  /** Reserved: when this capability was last evidenced. */
  lastDemonstratedAt: timestamp("last_demonstrated_at", { withTimezone: true }),
  /** Reserved: unverified | portfolio | employer | assessment | peer. */
  verificationStatus: text("verification_status"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const capabilitySkills = pgTable(
  "capability_skills",
  {
    capabilityId: uuid("capability_id")
      .notNull()
      .references(() => candidateCapabilities.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.capabilityId, table.skillId] })],
);

export const capabilityProjects = pgTable(
  "capability_projects",
  {
    capabilityId: uuid("capability_id")
      .notNull()
      .references(() => candidateCapabilities.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.capabilityId, table.projectId] })],
);
