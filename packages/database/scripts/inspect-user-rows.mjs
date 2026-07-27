// Read-only: list recent users rows (no secrets printed beyond email/ids already in app).
// Usage: DATABASE_URL=postgres://... node packages/database/scripts/inspect-user-rows.mjs

import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../../..");
const require = createRequire(import.meta.url);

const { neon } = require(
  join(repoRoot, "packages/database/node_modules/@neondatabase/serverless"),
);

const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(connectionString);

const rows = await sql`
  SELECT clerk_user_id, role, email, first_name, last_name,
         deleted_at, suspended_at, created_at
  FROM users
  ORDER BY created_at DESC
  LIMIT 25
`;

console.log(`total rows returned: ${rows.length}`);
for (const r of rows) {
  console.log(
    [
      r.clerk_user_id,
      r.role,
      r.email,
      `${r.first_name ?? "-"} ${r.last_name ?? "-"}`,
      `deleted=${r.deleted_at ? "YES" : "no"}`,
      `suspended=${r.suspended_at ? "YES" : "no"}`,
      r.created_at?.toISOString?.() ?? r.created_at,
    ].join(" | "),
  );
}
