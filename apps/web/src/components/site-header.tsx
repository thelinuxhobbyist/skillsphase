"use client";

import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { getCurrentUser, type HorizonUser } from "@/lib/api";
import { SafeUserButton } from "@/components/safe-user-button";
import { isClerkConfigured } from "@/lib/clerk-config";

const PUBLIC_LINKS = [
  { href: "/jobs", label: "Jobs" },
  { href: "/about", label: "About" },
  { href: "/waitlist", label: "Waitlist" },
] as const;

const hasClerk = isClerkConfigured();

function linksForUser(user: HorizonUser | null) {
  if (user?.role === "job_seeker") {
    return [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/jobs", label: "Jobs" },
      { href: "/applications", label: "Applications" },
      { href: "/profile", label: "Profile" },
      { href: "/settings", label: "Settings" },
    ];
  }
  if (user?.role === "employer") {
    return [
      { href: "/employer", label: "Dashboard" },
      { href: "/employer/jobs", label: "Jobs" },
      { href: "/employer/company", label: "Company" },
      { href: "/employer/settings", label: "Settings" },
    ];
  }
  if (user?.role === "admin") {
    return [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/employers", label: "Employers" },
      { href: "/admin/users", label: "Users" },
      { href: "/admin/staff", label: "Admins" },
      { href: "/admin/jobs", label: "Jobs" },
      { href: "/admin/audit", label: "Audit" },
      { href: "/admin/homepage", label: "Homepage" },
      { href: "/admin/reports", label: "Reports" },
      { href: "/admin/account", label: "Account" },
    ];
  }
  return [...PUBLIC_LINKS];
}

function GuestActions({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <Link href="/login" className="hover:text-brand" onClick={onNavigate}>
        Sign in
      </Link>
      <Link
        href="/register"
        className="btn-primary rounded-md bg-brand-accent px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        onClick={onNavigate}
      >
        Register
      </Link>
    </>
  );
}

function NavLinks({
  user,
  onNavigate,
  className,
}: {
  user: HorizonUser | null;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <>
      {linksForUser(user).map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={className ?? "hover:text-brand"}
          onClick={onNavigate}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}

function HeaderChrome({
  user,
  loadingUser,
}: {
  user: HorizonUser | null;
  loadingUser: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const close = () => setOpen(false);

  return (
    <header className="border-b border-[color:var(--line)]/70 bg-[color:var(--surface)]/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="shrink-0 font-[family-name:var(--font-fraunces)] text-lg font-semibold tracking-tight text-brand sm:text-xl"
          onClick={close}
        >
          Project Horizon
        </Link>

        <div className="flex items-center gap-2 md:hidden">
          {hasClerk ? (
            <SignedIn>
              <SafeUserButton />
            </SignedIn>
          ) : null}
          <button
            type="button"
            className="rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm font-semibold text-brand"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>

        <nav className="hidden min-w-0 items-center justify-end gap-4 text-sm font-medium text-[color:var(--foreground)]/80 md:flex">
          {!loadingUser ? <NavLinks user={user} /> : null}
          {hasClerk ? (
            <>
              <SignedOut>
                <GuestActions />
              </SignedOut>
              <SignedIn>
                <SafeUserButton />
              </SignedIn>
            </>
          ) : (
            <GuestActions />
          )}
        </nav>
      </div>

      {open ? (
        <div
          id={menuId}
          className="border-t border-[color:var(--line)]/70 px-4 py-4 md:hidden"
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-3 text-sm font-medium text-[color:var(--foreground)]/85">
            {!loadingUser ? (
              <NavLinks
                user={user}
                onNavigate={close}
                className="rounded-md px-1 py-1.5 hover:bg-white/70 hover:text-brand"
              />
            ) : null}
            {hasClerk ? (
              <SignedOut>
                <div className="mt-2 flex flex-col gap-3 border-t border-[color:var(--line)] pt-3">
                  <GuestActions onNavigate={close} />
                </div>
              </SignedOut>
            ) : (
              <div className="mt-2 flex flex-col gap-3 border-t border-[color:var(--line)] pt-3">
                <GuestActions onNavigate={close} />
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function AuthenticatedHeaderShell() {
  const { isSignedIn, getToken } = useAuth();
  const [user, setUser] = useState<HorizonUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      setUser(null);
      setLoadingUser(false);
      return;
    }
    setLoadingUser(true);
    void (async () => {
      try {
        const token = await getToken();
        if (!token) {
          setUser(null);
          return;
        }
        setUser(await getCurrentUser(token));
      } catch {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    })();
  }, [isSignedIn, getToken]);

  return (
    <HeaderChrome
      user={isSignedIn ? user : null}
      loadingUser={Boolean(isSignedIn && loadingUser)}
    />
  );
}

export function SiteHeader() {
  if (!hasClerk) {
    return <HeaderChrome user={null} loadingUser={false} />;
  }
  return <AuthenticatedHeaderShell />;
}
