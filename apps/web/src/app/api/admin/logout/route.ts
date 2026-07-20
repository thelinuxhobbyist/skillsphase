import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session";

export async function POST() {
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;

  if (token) {
    try {
      await fetch(`${getApiBaseUrl()}/admin/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
    } catch {
      /* ignore upstream logout failures */
    }
  }

  jar.delete(ADMIN_SESSION_COOKIE);
  return NextResponse.json({ success: true });
}
