#!/usr/bin/env node
/**
 * One-shot provisioning of the Root Administrator (local auth — no Clerk).
 *
 * Usage (from repo root):
 *   ROOT_ADMIN_EMAIL=publish.linux@gmail.com \
 *   ROOT_ADMIN_PASSWORD='...' \
 *   DATABASE_URL=postgres://... \
 *   node apps/api/scripts/create-root-admin.mjs
 *
 * Do not commit passwords.
 */

import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { webcrypto } from "node:crypto";

const crypto = webcrypto;
const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../../..");
const require = createRequire(import.meta.url);

const { neon } = require(
  join(repoRoot, "packages/database/node_modules/@neondatabase/serverless"),
);

const email = (process.env.ROOT_ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = process.env.ROOT_ADMIN_PASSWORD ?? "";
const databaseUrl = process.env.DATABASE_URL ?? "";

if (!email || !password || !databaseUrl) {
  console.error("Required env: ROOT_ADMIN_EMAIL, ROOT_ADMIN_PASSWORD, DATABASE_URL");
  process.exit(1);
}

if (password.length < 8) {
  console.error("ROOT_ADMIN_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

const ITERATIONS = 100_000;
const HASH_BYTES = 32;
const SALT_BYTES = 16;

function bytesToBase64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

async function hashPassword(pwd) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pwd),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
    keyMaterial,
    HASH_BYTES * 8,
  );
  const derived = new Uint8Array(bits);
  return `pbkdf2$${ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(derived)}`;
}

const sql = neon(databaseUrl);

async function main() {
  const passwordHash = await hashPassword(password);
  const clerkUserId = `local-admin:root`;

  const existingRows = await sql`
    SELECT id FROM users
    WHERE lower(email) = ${email} AND deleted_at IS NULL
    LIMIT 1
  `;

  if (existingRows[0]) {
    const localId = `local-admin:${existingRows[0].id}`;
    await sql`
      UPDATE users
      SET
        role = 'admin',
        is_root_admin = true,
        admin_role = 'root',
        profile_completed = true,
        password_hash = ${passwordHash},
        clerk_user_id = CASE
          WHEN clerk_user_id LIKE 'local-admin:%' THEN clerk_user_id
          ELSE ${localId}
        END,
        email = ${email},
        suspended_at = NULL,
        updated_at = NOW()
      WHERE id = ${existingRows[0].id}
    `;
    console.log("Updated Root Administrator:", existingRows[0].id);
  } else {
    const inserted = await sql`
      INSERT INTO users (
        clerk_user_id, role, email, profile_completed, is_root_admin, admin_role, password_hash
      ) VALUES (
        ${clerkUserId}, 'admin', ${email}, true, true, 'root', ${passwordHash}
      )
      RETURNING id
    `;
    console.log("Created Root Administrator row:", inserted[0]?.id);
  }

  console.log("Done. Sign in at /admin/login with", email);
  console.log("Change the temporary password after first login.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
