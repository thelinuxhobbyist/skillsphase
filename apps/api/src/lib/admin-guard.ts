import {
  adminHasPermission,
  type AdminPermission,
} from "@horizon/shared";
import {
  countRootAdmins,
  type AppUser,
  type Database,
} from "@horizon/database";

export function staffCan(
  admin: AppUser,
  permission: AdminPermission,
): boolean {
  if (admin.role !== "admin") return false;
  return adminHasPermission(
    {
      isRootAdmin: admin.isRootAdmin,
      adminRole: admin.adminRole,
      adminPermissions: admin.adminPermissions ?? null,
    },
    permission,
  );
}

/** Block deleting/demoting/suspending the last remaining root admin. */
export async function wouldRemoveLastRootAdmin(
  db: Database,
  target: AppUser,
  next?: { isRootAdmin?: boolean; deleteOrSuspend?: boolean },
): Promise<boolean> {
  if (!target.isRootAdmin && target.adminRole !== "root") {
    return false;
  }

  const roots = await countRootAdmins(db);
  if (roots > 1) return false;

  if (next?.deleteOrSuspend) return true;
  if (next?.isRootAdmin === false) return true;
  return false;
}
