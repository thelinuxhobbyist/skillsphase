"use client";

import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { getCurrentUser, type HorizonUser } from "@/lib/api";
import { SafeUserButton } from "@/components/safe-user-button";
import { isClerkConfigured } from "@/lib/clerk-config";

const PUBLIC_LINKS = [
  { href: "/discover-talent", label: "Browse Talent" },
  { href: "/about", label: "About" },
  { href: "/waitlist", label: "Waitlist" },
] as const;

const hasClerk = isClerkConfigured();

const navLinkClass =
  "text-base text-muted-foreground transition-colors hover:text-foreground";
const mobileNavLinkClass =
  "rounded-md px-1 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-surface hover:text-primary";

function linksForUser(user: HorizonUser | null) {
  if (user?.role === "job_seeker") {
    return [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/profile", label: "Skill Profile" },
      { href: "/contacts", label: "Messages" },
      { href: "/settings", label: "Settings" },
    ];
  }
  if (user?.role === "employer") {
    return [
      { href: "/employer", label: "Dashboard" },
      { href: "/employer/discover", label: "Discover Talent" },
      { href: "/employer/saved", label: "Saved" },
      { href: "/employer/contacts", label: "Contacts" },
      { href: "/employer/company", label: "Company" },
      { href: "/employer/settings", label: "Settings" },
    ];
  }
  if (user?.role === "admin") {
    return [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/employers", label: "Businesses" },
      { href: "/admin/users", label: "Users" },
      { href: "/admin/staff", label: "Admins" },
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
      <Link href="/login" className={navLinkClass} onClick={onNavigate}>
        Sign in
      </Link>
      <Link
        href="/register"
        className="btn-primary rounded-lg px-5 py-2.5 text-sm font-medium"
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
          className={className ?? navLinkClass}
          onClick={onNavigate}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}

function StampMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-current ${className ?? "h-9 w-9"}`}
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
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-3 px-4 py-3 sm:gap-5 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 font-sans text-xl font-semibold tracking-tight text-primary sm:text-2xl"
          onClick={close}
        >
          <StampMark />
          SkillsPhase
        </Link>

        <div className="flex items-center gap-2 md:hidden">
          {hasClerk ? (
            <SignedIn>
              <SafeUserButton />
            </SignedIn>
          ) : null}
          <button
            type="button"
            className="rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>

        <nav className="hidden min-w-0 items-center justify-end gap-6 md:flex lg:gap-8">
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
          className="border-t border-border px-4 py-4 md:hidden"
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-1">
            {!loadingUser ? (
              <NavLinks
                user={user}
                onNavigate={close}
                className={mobileNavLinkClass}
              />
            ) : null}
            {hasClerk ? (
              <SignedOut>
                <div className="mt-2 flex flex-col gap-3 border-t border-border pt-3">
                  <GuestActions onNavigate={close} />
                </div>
              </SignedOut>
            ) : (
              <div className="mt-2 flex flex-col gap-3 border-t border-border pt-3">
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
