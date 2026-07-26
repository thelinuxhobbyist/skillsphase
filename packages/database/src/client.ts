import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Database = ReturnType<typeof createDb>;

export class DatabaseConfigError extends Error {
  code = "DATABASE_NOT_CONFIGURED";
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigError";
  }
}

export function isPlaceholderDb(connectionString: string | undefined): boolean {
  if (!connectionString) return true;
  const str = connectionString.trim();
  if (!str || str.includes("user:pass@host")) return true;

  try {
    const url = new URL(str);
    if (!url.hostname || !url.hostname.includes(".")) {
      return true;
    }
  } catch {
    return true;
  }
  return false;
}

/** Create a Drizzle client for Neon (HTTP). */
export function createDb(connectionString: string): Database {
  if (isPlaceholderDb(connectionString)) {
    throw new DatabaseConfigError(
      "DATABASE_URL is not configured with a valid PostgreSQL connection string. Please set DATABASE_URL in apps/api/.dev.vars.",
    );
  }

  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}
