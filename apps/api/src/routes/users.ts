import { createClerkClient } from "@clerk/backend";
import {
  bootstrapRoleSchema,
  updateUserProfileSchema,
} from "@horizon/shared";
import { Hono } from "hono";
import type { AppEnv } from "../env";
import { getDb } from "../lib/db";
import { fail, ok } from "../lib/response";
import { buildGdprExport } from "@horizon/database";
import {
  createAppUser,
  employerHasBlockingDependencies,
  extractBootstrapRole,
  findActiveUserByClerkId,
  softDeleteAppUser,
  toPublicUser,
  updateAppUserProfile,
} from "../lib/users";
import { requireAppUser, requireClerkAuth } from "../middleware/auth";

export const userRoutes = new Hono<AppEnv>();

userRoutes.use("*", requireClerkAuth);

async function loadClerkProfile(c: {
  env: AppEnv["Bindings"];
  get: (key: "clerkUserId") => string | undefined;
}) {
  const clerkUserId = c.get("clerkUserId");
  if (!clerkUserId) {
    return null;
  }

  const clerk = createClerkClient({
    secretKey: c.env.CLERK_SECRET_KEY,
    publishableKey: c.env.CLERK_PUBLISHABLE_KEY,
  });

  return clerk.users.getUser(clerkUserId);
}

userRoutes.get("/me", requireAppUser, async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) {
    return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  }
  return ok(c, toPublicUser(appUser));
});

userRoutes.post("/me/bootstrap", async (c) => {
  if (!c.env.DATABASE_URL) {
    return fail(
      c,
      "DATABASE_NOT_CONFIGURED",
      "Database is not configured on this environment.",
      503,
    );
  }

  const clerkUserId = c.get("clerkUserId");
  if (!clerkUserId) {
    return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  }

  const db = getDb(c);
  const existing = await findActiveUserByClerkId(db, clerkUserId);
  if (existing) {
    return ok(c, toPublicUser(existing));
  }

  const body = await c.req.json().catch(() => ({}));

  if (
    body &&
    typeof body === "object" &&
    "role" in body &&
    (body as { role?: unknown }).role === "admin"
  ) {
    return fail(
      c,
      "FORBIDDEN",
      "Administrator accounts cannot be created through public registration.",
      403,
    );
  }

  const parsedBody = bootstrapRoleSchema.safeParse(body);

  const clerkUser = await loadClerkProfile(c);
  if (!clerkUser) {
    return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  }

  const roleFromMetadata =
    extractBootstrapRole(
      clerkUser.publicMetadata as Record<string, unknown> | undefined,
    ) ??
    extractBootstrapRole(
      clerkUser.unsafeMetadata as Record<string, unknown> | undefined,
    );

  const role = parsedBody.success ? parsedBody.data.role : roleFromMetadata;

  if (!role) {
    return fail(
      c,
      "ROLE_REQUIRED",
      "Choose Job Seeker or Employer to finish creating your account.",
      400,
    );
  }

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    return fail(
      c,
      "EMAIL_REQUIRED",
      "A verified email address is required.",
      400,
    );
  }

  const created = await createAppUser(db, {
    clerkUserId,
    role,
    email,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
  });

  const clerk = createClerkClient({
    secretKey: c.env.CLERK_SECRET_KEY,
    publishableKey: c.env.CLERK_PUBLISHABLE_KEY,
  });
  await clerk.users.updateUserMetadata(clerkUserId, {
    publicMetadata: {
      ...clerkUser.publicMetadata,
      horizonRole: role,
    },
  });

  c.set("appUser", created);
  return ok(c, toPublicUser(created), 201);
});

userRoutes.patch("/me", requireAppUser, async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) {
    return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = updateUserProfileSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid input.",
      400,
    );
  }

  const db = getDb(c);
  const result = await updateAppUserProfile(db, appUser, parsed.data);
  c.set("appUser", result);
  return ok(c, toPublicUser(result));
});

userRoutes.get("/me/export", requireAppUser, async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) {
    return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  }

  return ok(c, await buildGdprExport(getDb(c), appUser));
});

userRoutes.delete("/me", requireAppUser, async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) {
    return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  }

  if (appUser.role === "admin") {
    return fail(
      c,
      "FORBIDDEN",
      "Administrator accounts cannot be self-deleted.",
      403,
    );
  }

  const db = getDb(c);

  if (appUser.role === "employer") {
    const blocked = await employerHasBlockingDependencies(db, appUser.id);
    if (blocked) {
      return fail(
        c,
        "ACCOUNT_DELETE_BLOCKED",
        "Close all active jobs before deleting your employer account.",
        409,
      );
    }
  }

  const deletedAt = await softDeleteAppUser(db, appUser.id);

  const clerk = createClerkClient({
    secretKey: c.env.CLERK_SECRET_KEY,
    publishableKey: c.env.CLERK_PUBLISHABLE_KEY,
  });

  try {
    await clerk.users.deleteUser(appUser.clerkUserId);
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        requestId: c.get("requestId"),
        message:
          error instanceof Error
            ? error.message
            : "failed_to_delete_clerk_user",
      }),
    );
  }

  return ok(c, { deleted: true, softDeletedAt: deletedAt.toISOString() });
});
