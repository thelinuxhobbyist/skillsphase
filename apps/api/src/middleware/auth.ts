import { createClerkClient } from "@clerk/backend";
import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../env";
import { getDb } from "../lib/db";
import { fail } from "../lib/response";
import { findActiveUserByClerkId } from "../lib/users";

async function resolveClerkUserId(c: {
  env: AppEnv["Bindings"] & { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string };
  req: { raw: Request };
}): Promise<string | null> {
  const secretKey = c.env.CLERK_SECRET_KEY?.trim();
  const publishableKey = (c.env.CLERK_PUBLISHABLE_KEY || c.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)?.trim();

  if (
    !secretKey ||
    !publishableKey ||
    secretKey.includes("...") ||
    publishableKey.includes("...")
  ) {
    return null;
  }

  const clerk = createClerkClient({ secretKey, publishableKey });
  const authorizedParties = (
    c.env.CLERK_AUTHORIZED_PARTIES ?? "http://localhost:3000"
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const state = await clerk.authenticateRequest(c.req.raw, {
    publishableKey,
    authorizedParties,
  });

  if (!state.isSignedIn) {
    return null;
  }

  return state.toAuth().userId;
}

/**
 * Attaches clerkUserId when a valid session is present.
 * Does not require an application user row (bootstrap may still be needed).
 */
export const optionalClerkAuth = createMiddleware<AppEnv>(async (c, next) => {
  try {
    const clerkUserId = await resolveClerkUserId(c);
    if (clerkUserId) {
      c.set("clerkUserId", clerkUserId);

      const db = await getDb(c);
      const appUser = await findActiveUserByClerkId(db, clerkUserId);
      if (appUser) {
        c.set("appUser", appUser);
      }
    }
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "warn",
        requestId: c.get("requestId"),
        message: error instanceof Error ? error.message : "auth_resolve_failed",
      }),
    );
  }

  await next();
});

/** Requires a valid Clerk session. Application user may still be missing. */
export const requireClerkAuth = createMiddleware<AppEnv>(async (c, next) => {
  if (!c.env.CLERK_SECRET_KEY || !c.env.CLERK_PUBLISHABLE_KEY) {
    return fail(
      c,
      "AUTH_NOT_CONFIGURED",
      "Authentication is not configured on this environment.",
      503,
    );
  }

  let clerkUserId = c.get("clerkUserId");
  if (!clerkUserId) {
    try {
      clerkUserId = (await resolveClerkUserId(c)) ?? undefined;
    } catch {
      clerkUserId = undefined;
    }
  }

  if (!clerkUserId) {
    return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  }

  c.set("clerkUserId", clerkUserId);
  await next();
});

/** Requires Clerk session and a synced application user row. */
export const requireAppUser = createMiddleware<AppEnv>(async (c, next) => {
  let appUser = c.get("appUser");
  const clerkUserId = c.get("clerkUserId");

  if (!appUser && clerkUserId) {
    const db = await getDb(c);
    appUser = (await findActiveUserByClerkId(db, clerkUserId)) ?? undefined;
    if (appUser) {
      c.set("appUser", appUser);
    }
  }

  if (!appUser) {
    return fail(
      c,
      "USER_NOT_BOOTSTRAPPED",
      "Complete role selection to create your Horizon account.",
      409,
    );
  }

  if (appUser.suspendedAt) {
    return fail(
      c,
      "ACCOUNT_SUSPENDED",
      "This account has been suspended. Contact support if you believe this is a mistake.",
      403,
    );
  }

  await next();
});

export function requireRoles(...roles: Array<"job_seeker" | "employer" | "admin">) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const appUser = c.get("appUser");
    if (!appUser || !roles.includes(appUser.role)) {
      return fail(c, "FORBIDDEN", "You do not have permission to perform this action.", 403);
    }
    await next();
  });
}
