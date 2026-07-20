import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAdminMe,
  type HorizonUser,
} from "@/lib/api";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session";

/**
 * Server-side gate for all /admin pages (except /admin/login).
 * Uses local admin sessions — never Clerk.
 */
export async function requireAdminPage(): Promise<{
  user: HorizonUser;
  token: string;
}> {
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    redirect("/admin/login");
  }

  let user: HorizonUser;
  try {
    user = await getAdminMe(token);
  } catch {
    redirect("/admin/login");
  }

  if (user.role !== "admin" || user.suspendedAt) {
    redirect("/access-denied");
  }

  return { user, token };
}
