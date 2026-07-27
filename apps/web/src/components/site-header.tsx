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
  "block rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-surface hover:text-primary";

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

function GuestActions({
  onNavigate,
  stacked = false,
}: {
  onNavigate?: () => void;
  stacked?: boolean;
}) {
  const layoutClass = stacked
    ? "flex flex-col gap-3"
    : "flex items-center gap-4";

  return (
    <div className={layoutClass}>
      <Link href="/login" className={navLinkClass} onClick={onNavigate}>
        Sign in
      </Link>
      <Link
        href="/register"
        className={`btn-primary rounded-lg px-5 py-2.5 text-sm font-medium ${stacked ? "text-center" : ""}`}
        onClick={onNavigate}
      >
        Register
      </Link>
    </div>
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

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="flex min-w-0 shrink items-center gap-2.5 font-sans text-lg font-semibold tracking-tight text-primary sm:text-xl md:text-2xl"
          onClick={close}
        >
          <StampMark className="h-8 w-8 sm:h-9 sm:w-9" />
          <span className="truncate">SkillsPhase</span>
        </Link>

        <div className="flex items-center gap-2 md:hidden">
          {hasClerk ? (
            <SignedIn>
              <SafeUserButton />
            </SignedIn>
          ) : null}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-surface p-2.5 text-foreground"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <MenuIcon open={open} />
          </button>
        </div>

        <nav
          className="hidden min-w-0 items-center justify-end gap-5 md:flex lg:gap-8"
          aria-label="Main"
        >
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
          className="border-t border-border bg-background md:hidden"
        >
          <nav
            className="mx-auto flex max-h-[calc(100dvh-4.5rem)] max-w-[1180px] flex-col overflow-y-auto px-4 py-4"
            aria-label="Mobile"
          >
            {!loadingUser ? (
              <NavLinks
                user={user}
                onNavigate={close}
                className={mobileNavLinkClass}
              />
            ) : null}
            {hasClerk ? (
              <SignedOut>
                <div className="mt-3 border-t border-border pt-4">
                  <GuestActions onNavigate={close} stacked />
                </div>
              </SignedOut>
            ) : (
              <div className="mt-3 border-t border-border pt-4">
                <GuestActions onNavigate={close} stacked />
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
