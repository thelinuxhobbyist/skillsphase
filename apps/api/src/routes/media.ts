import { Hono } from "hono";
import type { AppEnv } from "../env";
import { readStoredObject } from "../lib/storage";
import { fail } from "../lib/response";
import { requireAppUser, requireClerkAuth } from "../middleware/auth";

/**
 * Serves uploaded portfolio media (images/documents) to any authenticated user
 * (candidates viewing their own profile, or businesses viewing a candidate's profile).
 */
export const mediaRoutes = new Hono<AppEnv>();

mediaRoutes.use("*", requireClerkAuth, requireAppUser);

mediaRoutes.get("/*", async (c) => {
  const key = c.req.path.split("/media/")[1];
  if (!key) {
    return fail(c, "NOT_FOUND", "Media not found.", 404);
  }

  const object = await readStoredObject({
    ref: `r2://${decodeURIComponent(key)}`,
    bucket: c.env.UPLOADS,
  });

  if (!object) {
    const devObject = await readStoredObject({
      ref: `dev://${decodeURIComponent(key)}`,
      bucket: c.env.UPLOADS,
    });
    if (!devObject) return fail(c, "NOT_FOUND", "Media not found.", 404);
    return c.body(devObject.body as ArrayBuffer, 200, {
      "Content-Type": devObject.contentType,
    });
  }

  return c.body(object.body as ArrayBuffer, 200, {
    "Content-Type": object.contentType,
    "Cache-Control": "private, max-age=3600",
  });
});
