"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { getAdminMe, type HorizonUser } from "@/lib/api";
import { useAdminToken } from "@/lib/use-admin-token";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/employers", label: "Businesses" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/staff", label: "Admins" },
  { href: "/admin/audit", label: "Audit" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/account", label: "Account" },
] as const;

const navLinkClass =
  "text-base text-muted-foreground transition-colors hover:text-foreground";
const mobileNavLinkClass =
  "block rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-surface hover:text-primary";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

function StampMark() {
  return (
    <span
      aria-hidden
      className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-current sm:h-9 sm:w-9"
    >
      <span className="absolute inset-[3px] rounded-full border border-dashed border-current opacity-60" />
      <svg
        viewBox="0 0 24 24"
        className="relative h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

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

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  function close() {
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-3 px-4 py-3 sm:gap-5 sm:px-6 sm:py-4">
        <Link
          href="/admin"
          className="flex min-w-0 shrink items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-primary sm:text-xl lg:text-2xl"
          onClick={close}
        >
          <StampMark />
          <span className="truncate">SkillsPhase</span>
        </Link>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-surface p-2.5 text-foreground lg:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <MenuIcon open={open} />
        </button>

        <nav
          className="hidden min-w-0 flex-wrap items-center justify-end gap-5 lg:flex lg:gap-6"
          aria-label="Admin"
        >
          {ADMIN_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass}>
              {link.label}
            </Link>
          ))}
          <span className="max-w-[12rem] truncate text-xs text-muted-foreground">
            {user?.email ?? "Admin"}
          </span>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground transition hover:border-foreground"
          >
            Sign out
          </button>
        </nav>
      </div>

      {open ? (
        <div
          id={menuId}
          className="border-t border-border bg-background lg:hidden"
        >
          <nav
            className="mx-auto flex max-h-[calc(100dvh-4.5rem)] max-w-[1180px] flex-col overflow-y-auto px-4 py-4"
            aria-label="Admin mobile"
          >
            {ADMIN_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={mobileNavLinkClass}
                onClick={close}
              >
                {link.label}
              </Link>
            ))}
            <p className="mt-3 truncate border-t border-border pt-3 text-xs text-muted-foreground">
              {user?.email ?? "Admin"}
            </p>
            <button
              type="button"
              onClick={() => void logout()}
              className="mt-3 w-full rounded-lg border border-border bg-surface px-3 py-3 text-left text-sm font-medium text-foreground"
            >
              Sign out
            </button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
