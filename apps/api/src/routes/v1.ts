import { Hono } from "hono";
import type { AppEnv } from "../env";
import { ok } from "../lib/response";
import { adminRoutes } from "./admin";
import {
  candidateListRoutes,
  discoveryRoutes,
  publicDiscoveryRoutes,
  savedCandidateRoutes,
} from "./discovery";
import { companyRoutes } from "./companies";
import { contactRoutes } from "./contacts";
import { adminHomepageRoutes, contentRoutes } from "./content";
import {
  applicationRoutes,
  employerJobRoutes,
  jobRoutes,
} from "./jobs";
import { mediaRoutes } from "./media";
import { profileRoutes } from "./profile";
import { projectRoutes } from "./projects";
import { userRoutes } from "./users";
import { waitlistRoutes } from "./waitlist";

export const v1Routes = new Hono<AppEnv>();

v1Routes.get("/", (c) =>
  ok(c, {
    name: "SkillsPhase API",
    version: "v1",
    docs: "/docs/06-api-specification.md",
  }),
);

v1Routes.route("/users", userRoutes);
v1Routes.route("/users", profileRoutes);
v1Routes.route("/projects", projectRoutes);
v1Routes.route("/media", mediaRoutes);
v1Routes.route("/companies", companyRoutes);
v1Routes.route("/jobs", jobRoutes);
v1Routes.route("/applications", applicationRoutes);
v1Routes.route("/employer/jobs", employerJobRoutes);
v1Routes.route("/discover", discoveryRoutes);
v1Routes.route("/public/candidates", publicDiscoveryRoutes);
v1Routes.route("/saved-candidates", savedCandidateRoutes);
v1Routes.route("/candidate-lists", candidateListRoutes);
v1Routes.route("/contacts", contactRoutes);
v1Routes.route("/waitlist", waitlistRoutes);
v1Routes.route("/content", contentRoutes);
v1Routes.route("/admin", adminRoutes);
v1Routes.route("/admin/homepage", adminHomepageRoutes);
