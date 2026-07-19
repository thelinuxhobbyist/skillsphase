import { desc, eq } from "drizzle-orm";
import type { Database } from "../client";
import { adminLogs } from "../schema/admin";
import { users } from "../schema/users";

export type AdminLogView = {
  id: string;
  adminUserId: string;
  adminEmail: string;
  adminName: string;
  action: string;
  entity: string;
  entityId: string;
  notes: string | null;
  createdAt: string;
};

export async function listAdminLogs(
  db: Database,
  limit = 100,
): Promise<AdminLogView[]> {
  const rows = await db
    .select({
      log: adminLogs,
      adminEmail: users.email,
      adminFirstName: users.firstName,
      adminLastName: users.lastName,
    })
    .from(adminLogs)
    .innerJoin(users, eq(users.id, adminLogs.adminUserId))
    .orderBy(desc(adminLogs.createdAt))
    .limit(limit);

  return rows.map((row) => {
    const name = [row.adminFirstName, row.adminLastName]
      .filter(Boolean)
      .join(" ");
    return {
      id: row.log.id,
      adminUserId: row.log.adminUserId,
      adminEmail: row.adminEmail,
      adminName: name || row.adminEmail,
      action: row.log.action,
      entity: row.log.entity,
      entityId: row.log.entityId,
      notes: row.log.notes,
      createdAt: row.log.createdAt.toISOString(),
    };
  });
}

export async function listRecentAdminLogs(db: Database, limit = 8) {
  return listAdminLogs(db, limit);
}
