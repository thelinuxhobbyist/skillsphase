import { Hono } from "hono";
import type { AppEnv } from "../env";
import { ok } from "../lib/response";

export const healthRoutes = new Hono<AppEnv>();

healthRoutes.get("/health", (c) =>
  ok(c, {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT ?? "unknown",
  }),
);
