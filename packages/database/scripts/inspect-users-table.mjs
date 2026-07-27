// Read-only introspection of the live `users` table and enum types.
// Usage: DATABASE_URL=postgres://... node packages/database/scripts/inspect-users-table.mjs

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

const columns = await sql`
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_name = 'users'
  ORDER BY ordinal_position
`;
console.log("=== users columns ===");
for (const c of columns) {
  console.log(
    `${c.column_name} | ${c.data_type} | nullable=${c.is_nullable} | default=${c.column_default ?? "-"}`,
  );
}

const enums = await sql`
  SELECT t.typname, string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder) AS labels
  FROM pg_type t
  JOIN pg_enum e ON e.enumtypid = t.oid
  GROUP BY t.typname
  ORDER BY t.typname
`;
console.log("\n=== enum types ===");
for (const e of enums) {
  console.log(`${e.typname}: ${e.labels}`);
}

const constraints = await sql`
  SELECT conname, pg_get_constraintdef(oid) AS def
  FROM pg_constraint
  WHERE conrelid = 'users'::regclass
  ORDER BY conname
`;
console.log("\n=== users constraints ===");
for (const c of constraints) {
  console.log(`${c.conname}: ${c.def}`);
}

const tables = await sql`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' ORDER BY table_name
`;
console.log("\n=== tables ===");
console.log(tables.map((t) => t.table_name).join(", "));
