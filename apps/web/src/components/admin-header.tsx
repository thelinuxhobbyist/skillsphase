"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAdminMe, type HorizonUser } from "@/lib/api";
import { useAdminToken } from "@/lib/use-admin-token";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/employers", label: "Employers" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/staff", label: "Admins" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/audit", label: "Audit" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/account", label: "Account" },
] as const;

export function AdminHeader() {
  const router = useRouter();
  const { getToken } = useAdminToken();
  const [user, setUser] = useState<HorizonUser | null>(null);

  useEffect(() => {
    void (async () => {
      const token = await getToken();
      if (!token) return;
      try {
        setUser(await getAdminMe(token));
      } catch {
        setUser(null);
      }
    })();
  }, [getToken]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-[color:var(--line)]/70 bg-[color:var(--surface)]/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/admin"
          className="font-[family-name:var(--font-fraunces)] text-xl font-semibold tracking-tight text-brand"
        >
          Project Horizon
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-4 text-sm font-medium text-[color:var(--foreground)]/80">
          {ADMIN_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-brand">
              {link.label}
            </Link>
          ))}
          <span className="text-xs text-[color:var(--foreground)]/55">
            {user?.email ?? "Admin"}
          </span>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-md border border-[color:var(--line)] bg-white px-3 py-1.5 text-sm font-semibold text-brand"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
