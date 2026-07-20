"use client";

import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser, type HorizonUser } from "@/lib/api";
import { SafeUserButton } from "@/components/safe-user-button";

const PUBLIC_LINKS = [
  { href: "/jobs", label: "Jobs" },
  { href: "/about", label: "About" },
  { href: "/waitlist", label: "Waitlist" },
] as const;

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";
const hasClerk =
  publishableKey.startsWith("pk_") && !publishableKey.includes("...");

function RoleNav({ user }: { user: HorizonUser | null }) {
  const roleLinks =
    user?.role === "job_seeker"
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/jobs", label: "Jobs" },
          { href: "/applications", label: "Applications" },
          { href: "/profile", label: "Profile" },
          { href: "/settings", label: "Settings" },
        ]
      : user?.role === "employer"
        ? [
            { href: "/employer", label: "Dashboard" },
            { href: "/employer/jobs", label: "Jobs" },
            { href: "/employer/company", label: "Company" },
            { href: "/employer/settings", label: "Settings" },
          ]
        : user?.role === "admin"
          ? [
              { href: "/admin", label: "Dashboard" },
              { href: "/admin/employers", label: "Employers" },
              { href: "/admin/users", label: "Users" },
              { href: "/admin/staff", label: "Admins" },
              { href: "/admin/jobs", label: "Jobs" },
              { href: "/admin/audit", label: "Audit" },
              { href: "/admin/homepage", label: "Homepage" },
              { href: "/admin/reports", label: "Reports" },
              { href: "/admin/account", label: "Account" },
            ]
          : PUBLIC_LINKS;

  return (
    <>
      {roleLinks.map((link) => (
        <Link key={link.href} href={link.href} className="hover:text-brand">
          {link.label}
        </Link>
      ))}
    </>
  );
}

function GuestActions() {
  return (
    <>
      <Link href="/login" className="hover:text-brand">
        Sign in
      </Link>
      <Link
        href="/register"
        className="btn-primary rounded-md bg-brand-accent px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Register
      </Link>
    </>
  );
}

function AuthenticatedHeader() {
  const { isSignedIn, getToken } = useAuth();
  const [user, setUser] = useState<HorizonUser | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      setUser(null);
      return;
    }
    void (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        setUser(await getCurrentUser(token));
      } catch {
        setUser(null);
      }
    })();
  }, [isSignedIn, getToken]);

  return (
    <>
      <RoleNav user={isSignedIn ? user : null} />
      <SignedOut>
        <GuestActions />
      </SignedOut>
      <SignedIn>
        <SafeUserButton />
      </SignedIn>
    </>
  );
}

function PublicOnlyHeader() {
  return (
    <>
      <RoleNav user={null} />
      <GuestActions />
    </>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-[color:var(--line)]/70 bg-[color:var(--surface)]/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="font-[family-name:var(--font-fraunces)] text-xl font-semibold tracking-tight text-brand"
        >
          Project Horizon
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-4 text-sm font-medium text-[color:var(--foreground)]/80">
          {hasClerk ? <AuthenticatedHeader /> : <PublicOnlyHeader />}
        </nav>
      </div>
    </header>
  );
}
