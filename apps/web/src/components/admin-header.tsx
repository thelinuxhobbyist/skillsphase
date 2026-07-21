"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
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
  const [open, setOpen] = useState(false);
  const menuId = useId();

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

  function close() {
    setOpen(false);
  }

  return (
    <header className="border-b border-[color:var(--line)]/70 bg-[color:var(--surface)]/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <Link
          href="/admin"
          className="shrink-0 font-[family-name:var(--font-fraunces)] text-lg font-semibold tracking-tight text-brand sm:text-xl"
          onClick={close}
        >
          Project Horizon
        </Link>

        <button
          type="button"
          className="rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm font-semibold text-brand lg:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>

        <nav className="hidden min-w-0 flex-wrap items-center justify-end gap-3 text-sm font-medium text-[color:var(--foreground)]/80 lg:flex">
          {ADMIN_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-brand">
              {link.label}
            </Link>
          ))}
          <span className="max-w-[12rem] truncate text-xs text-[color:var(--foreground)]/55">
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

      {open ? (
        <div
          id={menuId}
          className="border-t border-[color:var(--line)]/70 px-4 py-4 lg:hidden"
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-2 text-sm font-medium text-[color:var(--foreground)]/85">
            {ADMIN_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-1 py-1.5 hover:bg-white/70 hover:text-brand"
                onClick={close}
              >
                {link.label}
              </Link>
            ))}
            <p className="mt-2 truncate border-t border-[color:var(--line)] pt-3 text-xs text-[color:var(--foreground)]/55">
              {user?.email ?? "Admin"}
            </p>
            <button
              type="button"
              onClick={() => void logout()}
              className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-left text-sm font-semibold text-brand"
            >
              Sign out
            </button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
