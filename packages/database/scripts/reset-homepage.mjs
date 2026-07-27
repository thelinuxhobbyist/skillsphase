// Reset homepage sections to the built-in SkillsPhase defaults.
// Usage: DATABASE_URL=postgres://... node packages/database/scripts/reset-homepage.mjs

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

const { getDefaultHomepageSections } = await import(
  join(repoRoot, "packages/shared/src/homepage.ts")
);

const sql = neon(connectionString);
const defaults = getDefaultHomepageSections();

await sql`DELETE FROM homepage_sections`;

for (const section of defaults) {
  await sql`
    INSERT INTO homepage_sections (type, enabled, sort_order, label, content)
    VALUES (
      ${section.type},
      ${section.enabled},
      ${section.sortOrder},
      ${section.label},
      ${JSON.stringify(section.content)}::jsonb
    )
  `;
}

const hero = defaults.find((section) => section.type === "hero");
console.log(
  `Reset ${defaults.length} sections. Hero title: ${hero?.content?.title ?? "?"}`,
);
