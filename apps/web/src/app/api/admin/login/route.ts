import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
} from "@/lib/admin-session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body !== "object" ||
    typeof (body as { email?: unknown }).email !== "string" ||
    typeof (body as { password?: unknown }).password !== "string"
  ) {
    return NextResponse.json(
      { success: false, error: "Email and password are required." },
      { status: 400 },
    );
  }

  const upstream = await fetch(`${getApiBaseUrl()}/admin/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: (body as { email: string }).email,
      password: (body as { password: string }).password,
    }),
    cache: "no-store",
  });

  const payload = (await upstream.json()) as {
    success: boolean;
    data?: { token: string };
    error?: { message?: string };
  };

  if (!upstream.ok || !payload.success || !payload.data?.token) {
    return NextResponse.json(
      {
        success: false,
        error: payload.error?.message ?? "Invalid email or password.",
      },
      { status: upstream.status === 429 ? 429 : 401 },
    );
  }

  const jar = await cookies();
  jar.set(ADMIN_SESSION_COOKIE, payload.data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  return NextResponse.json({ success: true });
}
