import { z } from "zod";
import { HOMEPAGE_SECTION_TYPES } from "../homepage";

export const homepageSectionTypeSchema = z.enum(HOMEPAGE_SECTION_TYPES);

export const homepageSectionSchema = z.object({
  id: z.string().min(1),
  type: homepageSectionTypeSchema,
  enabled: z.boolean(),
  sortOrder: z.number().int(),
  label: z.string().trim().min(1).max(120),
  content: z.record(z.string(), z.unknown()),
});

export const updateHomepageSectionSchema = z.object({
  enabled: z.boolean().optional(),
  label: z.string().trim().min(1).max(120).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
});

export const reorderHomepageSectionsSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

export const createHomepageSectionSchema = z.object({
  type: homepageSectionTypeSchema,
  label: z.string().trim().min(1).max(120).optional(),
  enabled: z.boolean().optional(),
});

export const replaceHomepageSectionsSchema = z.object({
  sections: z.array(homepageSectionSchema),
});
