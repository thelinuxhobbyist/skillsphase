// Applies a raw .sql file to DATABASE_URL using the Neon serverless driver's
// node-postgres-compatible Client. Useful when `psql` isn't installed locally.
//
// Requires Node >= 22 (native WebSocket) OR the `ws` package installed
// (`pnpm add -D ws -w`) on older Node versions.
//
// Usage:
//   DATABASE_URL=postgres://... node packages/database/scripts/run-sql-file.mjs packages/database/drizzle/0006_skills_marketplace.sql

import { readFileSync } from "node:fs";
import { Client, neonConfig } from "@neondatabase/serverless";

if (typeof WebSocket === "undefined") {
  try {
    const { default: ws } = await import("ws");
    neonConfig.webSocketConstructor = ws;
  } catch {
    console.error(
      "No global WebSocket and 'ws' package not found. Run: pnpm add -D ws -w",
    );
    process.exit(1);
  }
}

const file = process.argv[2];
if (!file) {
  console.error("Usage: node run-sql-file.mjs <path-to-sql-file>");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set in the environment.");
  process.exit(1);
}

const sql = readFileSync(file, "utf8");
const client = new Client(connectionString);

try {
  await client.connect();
  await client.query(sql);
  console.log(`Applied ${file} successfully.`);
} catch (err) {
  console.error("Migration failed:", err);
  process.exitCode = 1;
} finally {
  await client.end();
}
