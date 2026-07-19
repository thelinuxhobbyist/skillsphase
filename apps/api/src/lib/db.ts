import { createDb, type Database } from "@horizon/database";
import type { Context } from "hono";
import type { AppEnv } from "../env";

export function getDb(c: Context<AppEnv>): Database {
  const url = c.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return createDb(url);
}
