import { Hono } from "hono";
import type { AppEnv } from "./env";
import { fail } from "./lib/response";
import { optionalClerkAuth } from "./middleware/auth";
import { corsMiddleware } from "./middleware/cors";
import { requestIdMiddleware } from "./middleware/request-id";
import { healthRoutes } from "./routes/health";
import { v1Routes } from "./routes/v1";
import { runRetentionPurge } from "./scheduled";

const app = new Hono<AppEnv>();

app.use("*", requestIdMiddleware);
app.use("*", corsMiddleware);
app.use("*", optionalClerkAuth);

app.route("/", healthRoutes);
app.route("/api/v1", v1Routes);

app.notFound((c) => fail(c, "NOT_FOUND", "Route not found.", 404));

app.onError((err, c) => {
  const cause = (err as { cause?: unknown }).cause;
  console.error(
    JSON.stringify({
      level: "error",
      requestId: c.get("requestId"),
      path: c.req.path,
      message: err.message,
      // Drizzle wraps driver errors; the actionable detail lives on `cause`.
      cause: cause instanceof Error ? cause.message : cause,
      stack: err.stack,
    }),
  );

  if (err.name === "DatabaseConfigError" || (err as { code?: string }).code === "DATABASE_NOT_CONFIGURED") {
    return fail(
      c,
      "DATABASE_NOT_CONFIGURED",
      err.message || "Database is not configured.",
      503,
    );
  }

  // Never surface driver/query internals (SQL text, params) to clients.
  return fail(
    c,
    "INTERNAL_ERROR",
    "An unexpected server error occurred. Please try again.",
    500,
  );
});

export default {
  fetch: app.fetch,
  async scheduled(
    _controller: ScheduledController,
    env: AppEnv["Bindings"],
    _ctx: ExecutionContext,
  ) {
    await runRetentionPurge(env);
  },
};
