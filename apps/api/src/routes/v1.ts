import { Hono } from "hono";
import type { AppEnv } from "../env";
import { ok } from "../lib/response";
import { userRoutes } from "./users";

export const v1Routes = new Hono<AppEnv>();

v1Routes.get("/", (c) =>
  ok(c, {
    name: "Project Horizon API",
    version: "v1",
    docs: "/docs/06-api-specification.md",
  }),
);

v1Routes.route("/users", userRoutes);
