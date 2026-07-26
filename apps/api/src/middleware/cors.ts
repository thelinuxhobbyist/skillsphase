import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../env";

const DEFAULT_ORIGINS = ["http://localhost:3000"];

export const corsMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const allowed = (c.env.CLERK_AUTHORIZED_PARTIES ?? DEFAULT_ORIGINS.join(","))
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const requestOrigin = c.req.header("Origin");
  const fallbackOrigin = allowed[0] ?? DEFAULT_ORIGINS[0]!;
  const origin =
    requestOrigin && allowed.includes(requestOrigin)
      ? requestOrigin
      : fallbackOrigin;

  if (c.req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
        Vary: "Origin",
      },
    });
  }

  try {
    await next();
  } finally {
    if (c.res) {
      c.res.headers.set("Access-Control-Allow-Origin", origin);
      c.res.headers.set("Access-Control-Allow-Credentials", "true");
      c.res.headers.set("Vary", "Origin");
    }
  }
});
