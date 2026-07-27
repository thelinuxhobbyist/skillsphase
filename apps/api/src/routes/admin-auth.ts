import {
  createAdminSession,
  deleteAdminSession,
  findAdminUserByEmail,
  setAdminPasswordHash,
  toAdminUserView,
  touchAdminLogin,
  updateAdminStaff,
  writeAdminLog,
} from "@horizon/database";
import { z } from "zod";
import { Hono } from "hono";
import type { AppEnv } from "../env";
import {
  ADMIN_SESSION_TTL_MS,
  generateSessionToken,
  hashPassword,
  hashToken,
  verifyPassword,
} from "../lib/admin-crypto";
import { getDb } from "../lib/db";
import { fail, ok } from "../lib/response";
import { requireAdminAuth } from "../lib/require-admin-auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128),
});

/** Best-effort in-memory rate limit (per isolate). */
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function rateLimitLogin(key: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 10;
  const entry = loginAttempts.get(key);
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxAttempts) return false;
  entry.count += 1;
  return true;
}

export const adminAuthRoutes = new Hono<AppEnv>();

adminAuthRoutes.post("/login", async (c) => {
  if (!c.env.DATABASE_URL) {
    return fail(c, "DATABASE_NOT_CONFIGURED", "Database is not configured.", 503);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return fail(c, "VALIDATION_ERROR", "Email and password are required.", 400);
  }

  const email = parsed.data.email.toLowerCase();
  const ip = c.req.header("CF-Connecting-IP") ?? c.req.header("X-Forwarded-For") ?? "unknown";
  const rateKey = `${ip}:${email}`;
  if (!rateLimitLogin(rateKey)) {
    return fail(
      c,
      "RATE_LIMITED",
      "Too many login attempts. Try again in 15 minutes.",
      429,
    );
  }

  const db = getDb(c);
  const user = await findAdminUserByEmail(db, email);

  if (
    !user ||
    user.suspendedAt ||
    !(await verifyPassword(parsed.data.password, user.passwordHash))
  ) {
    return fail(c, "INVALID_CREDENTIALS", "Invalid email or password.", 401);
  }

  const token = generateSessionToken();
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_TTL_MS);
  await createAdminSession(db, {
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  await touchAdminLogin(db, user.id);
  await writeAdminLog(db, {
    adminUserId: user.id,
    action: "Admin Login",
    entity: "user",
    entityId: user.id,
  });

  return ok(c, {
    token,
    expiresAt: expiresAt.toISOString(),
    user: toAdminUserView(user),
  });
});

adminAuthRoutes.post("/logout", requireAdminAuth, async (c) => {
  const token = c.get("adminSessionToken");
  if (token) {
    await deleteAdminSession(getDb(c), await hashToken(token));
  }
  return ok(c, { loggedOut: true });
});

adminAuthRoutes.get("/me", requireAdminAuth, async (c) => {
  const admin = c.get("appUser");
  if (!admin) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  return ok(c, toAdminUserView(admin));
});

adminAuthRoutes.post("/change-password", requireAdminAuth, async (c) => {
  const admin = c.get("appUser");
  if (!admin) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

  const body = await c.req.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid password payload.",
      400,
    );
  }

  if (!(await verifyPassword(parsed.data.currentPassword, admin.passwordHash))) {
    return fail(c, "INVALID_CREDENTIALS", "Current password is incorrect.", 401);
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  const updated = await setAdminPasswordHash(getDb(c), admin.id, passwordHash);
  if (!updated) {
    return fail(c, "USER_NOT_FOUND", "Administrator not found.", 404);
  }

  await writeAdminLog(getDb(c), {
    adminUserId: admin.id,
    action: "Admin Password Changed",
    entity: "user",
    entityId: admin.id,
  });

  return ok(c, { changed: true });
});

adminAuthRoutes.patch("/profile", requireAdminAuth, async (c) => {
  const admin = c.get("appUser");
  if (!admin) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);

  const body = await c.req.json().catch(() => null);
  const schema = z.object({
    email: z.string().email().optional(),
    firstName: z.string().trim().min(1).max(100).optional().nullable(),
    lastName: z.string().trim().min(1).max(100).optional().nullable(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid profile update.",
      400,
    );
  }

  const db = getDb(c);
  if (parsed.data.email && parsed.data.email.toLowerCase() !== admin.email) {
    const clash = await findUserByEmail(db, parsed.data.email);
    if (clash && clash.id !== admin.id) {
      return fail(c, "EMAIL_IN_USE", "That email is already in use.", 409);
    }
  }

  const updated = await updateAdminStaff(db, admin.id, {
    email: parsed.data.email?.toLowerCase(),
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
  });
  if (!updated) {
    return fail(c, "USER_NOT_FOUND", "Administrator not found.", 404);
  }

  await writeAdminLog(db, {
    adminUserId: admin.id,
    action: "Admin Profile Updated",
    entity: "user",
    entityId: admin.id,
  });

  c.set("appUser", updated);
  return ok(c, toAdminUserView(updated));
});
