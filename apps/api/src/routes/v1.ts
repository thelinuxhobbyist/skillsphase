import { Hono } from "hono";
import type { AppEnv } from "../env";
import { ok } from "../lib/response";
import { adminRoutes } from "./admin";
import { companyRoutes } from "./companies";
import { jobRoutes } from "./jobs";
import { profileRoutes } from "./profile";
import { userRoutes } from "./users";
import { waitlistRoutes } from "./waitlist";

export const v1Routes = new Hono<AppEnv>();

v1Routes.get("/", (c) =>
  ok(c, {
    name: "Project Horizon API",
    version: "v1",
    docs: "/docs/06-api-specification.md",
  }),
);

v1Routes.route("/users", userRoutes);
v1Routes.route("/users", profileRoutes);
v1Routes.route("/companies", companyRoutes);
v1Routes.route("/jobs", jobRoutes);
v1Routes.route("/waitlist", waitlistRoutes);
v1Routes.route("/admin", adminRoutes);
