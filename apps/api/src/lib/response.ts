import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { AppEnv } from "../env";

export function ok<T>(
  c: Context<AppEnv>,
  data: T,
  status: ContentfulStatusCode = 200,
  meta?: { page: number; pageSize: number; total: number },
) {
  return c.json({ success: true as const, data, ...(meta ? { meta } : {}) }, status);
}

export function fail(
  c: Context<AppEnv>,
  code: string,
  message: string,
  status: ContentfulStatusCode = 400,
) {
  return c.json(
    {
      success: false as const,
      error: { code, message },
    },
    status,
  );
}
