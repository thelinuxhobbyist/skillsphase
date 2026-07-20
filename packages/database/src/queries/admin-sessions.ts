import { and, eq, gt, lt } from "drizzle-orm";
import type { Database } from "../client";
import { adminSessions } from "../schema/admin-sessions";
import { users } from "../schema/users";
import type { AppUser } from "./users";

export async function createAdminSession(
  db: Database,
  input: { userId: string; tokenHash: string; expiresAt: Date },
) {
  const [row] = await db
    .insert(adminSessions)
    .values({
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
    })
    .returning();
  return row!;
}

export async function findAdminSessionUser(
  db: Database,
  tokenHash: string,
): Promise<{ sessionId: string; user: AppUser } | null> {
  const [row] = await db
    .select({
      sessionId: adminSessions.id,
      user: users,
    })
    .from(adminSessions)
    .innerJoin(users, eq(users.id, adminSessions.userId))
    .where(
      and(
        eq(adminSessions.tokenHash, tokenHash),
        gt(adminSessions.expiresAt, new Date()),
        eq(users.role, "admin"),
      ),
    )
    .limit(1);

  if (!row || row.user.deletedAt || row.user.suspendedAt) {
    return null;
  }

  return { sessionId: row.sessionId, user: row.user };
}

export async function touchAdminSession(db: Database, sessionId: string) {
  await db
    .update(adminSessions)
    .set({ lastSeenAt: new Date() })
    .where(eq(adminSessions.id, sessionId));
}

export async function deleteAdminSession(db: Database, tokenHash: string) {
  await db
    .delete(adminSessions)
    .where(eq(adminSessions.tokenHash, tokenHash));
}

export async function deleteAdminSessionsForUser(db: Database, userId: string) {
  await db.delete(adminSessions).where(eq(adminSessions.userId, userId));
}

export async function purgeExpiredAdminSessions(db: Database) {
  await db
    .delete(adminSessions)
    .where(lt(adminSessions.expiresAt, new Date()));
}

export async function setAdminPasswordHash(
  db: Database,
  userId: string,
  passwordHash: string,
) {
  const [updated] = await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(and(eq(users.id, userId), eq(users.role, "admin")))
    .returning();
  return updated ?? null;
}
