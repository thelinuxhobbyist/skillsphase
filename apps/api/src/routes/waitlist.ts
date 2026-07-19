import { waitlistSchema } from "@horizon/shared";
import { Hono } from "hono";
import { createWaitlistEntry } from "@horizon/database";
import type { AppEnv } from "../env";
import { getDb } from "../lib/db";
import { fail, ok } from "../lib/response";

export const waitlistRoutes = new Hono<AppEnv>();

waitlistRoutes.post("/", async (c) => {
  if (!c.env.DATABASE_URL) {
    return fail(
      c,
      "DATABASE_NOT_CONFIGURED",
      "Database is not configured on this environment.",
      503,
    );
  }

  const body = await c.req.json().catch(() => null);
  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid waitlist details.",
      400,
    );
  }

  const db = getDb(c);
  const created = await createWaitlistEntry(db, parsed.data);

  return ok(
    c,
    {
      id: created.id,
      email: created.email,
      companyName: created.companyName,
      countryCode: created.countryCode,
      createdAt: created.createdAt.toISOString(),
    },
    201,
  );
});
