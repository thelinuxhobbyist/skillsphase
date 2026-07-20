import { createMiddleware } from "hono/factory";
import {
  findAdminSessionUser,
  touchAdminSession,
} from "@horizon/database";
import type { AppEnv } from "../env";
import { getDb } from "./db";
import { fail } from "./response";
import { hashToken } from "./admin-crypto";

function extractBearer(c: { req: { header: (name: string) => string | undefined } }) {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

/** Authenticates administrators via local session tokens (not Clerk). */
export const requireAdminAuth = createMiddleware<AppEnv>(async (c, next) => {
  if (!c.env.DATABASE_URL) {
    return fail(
      c,
      "DATABASE_NOT_CONFIGURED",
      "Database is not configured on this environment.",
      503,
    );
  }

  const token = extractBearer(c);
  if (!token) {
    return fail(c, "UNAUTHORIZED", "Administrator authentication required.", 401);
  }

  const tokenHash = await hashToken(token);
  const db = getDb(c);
  const matched = await findAdminSessionUser(db, tokenHash);
  if (!matched) {
    return fail(c, "UNAUTHORIZED", "Invalid or expired administrator session.", 401);
  }

  c.set("appUser", matched.user);
  c.set("adminSessionToken", token);
  c.set("adminSessionId", matched.sessionId);

  // Fire-and-forget last-seen update
  void touchAdminSession(db, matched.sessionId);

  await next();
});
