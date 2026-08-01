"use client";

import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { getCurrentUser, type HorizonUser } from "@/lib/api";
import { SafeUserButton } from "@/components/safe-user-button";
import { isClerkConfigured } from "@/lib/clerk-config";
import {
  isNavLinkActive,
  linksForUser,
  PUBLIC_LINKS,
  usesAppNav,
  type NavLink,
} from "@/lib/nav-links";

const hasClerk = isClerkConfigured();

const guestNavLinkClass =
  "text-base text-muted-foreground transition-colors hover:text-foreground";
const mobileNavLinkClass =
  "block rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-surface hover:text-primary";

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
      <Link href="/login" className={guestNavLinkClass} onClick={onNavigate}>
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

function ChevronDown() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function AppNavRow({ links }: { links: NavLink[] }) {
  const pathname = usePathname() ?? "/";
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const primary = links.filter((link) => !link.collapsible);
  const overflow = links.filter((link) => link.collapsible);

  useEffect(() => {
    if (!moreOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!moreRef.current?.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen]);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  function linkClass(href: string) {
    const active = isNavLinkActive(pathname, href);
    return [
      "shrink-0 border-b-2 px-3.5 py-3 text-sm whitespace-nowrap transition-colors",
      active
        ? "border-primary font-medium text-primary"
        : "border-transparent text-muted-foreground hover:text-foreground",
    ].join(" ");
  }

  return (
    <nav
      className="flex items-center gap-1 overflow-x-auto border-b border-border bg-background px-3 scrollbar-none sm:px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Application"
    >
      {primary.map((link) => (
        <Link key={link.href} href={link.href} className={linkClass(link.href)}>
          {link.label}
        </Link>
      ))}

      {overflow.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`${linkClass(link.href)} max-[720px]:hidden`}
        >
          {link.label}
        </Link>
      ))}

      {overflow.length > 0 ? (
        <div
          ref={moreRef}
          className="relative hidden shrink-0 max-[720px]:block"
        >
          <button
            type="button"
            className="flex items-center gap-1 px-3.5 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
            aria-expanded={moreOpen}
            aria-haspopup="menu"
            onClick={() => setMoreOpen((value) => !value)}
          >
            More
            <ChevronDown />
          </button>
          {moreOpen ? (
            <div
              role="menu"
              className="absolute top-full right-0 z-50 min-w-[10rem] rounded-lg border border-border bg-background p-1.5 shadow-lift"
            >
              {overflow.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  className={[
                    "block rounded-md px-2.5 py-2 text-sm transition-colors",
                    isNavLinkActive(pathname, link.href)
                      ? "bg-brand/10 font-medium text-primary"
                      : "text-foreground hover:bg-[color:var(--surface-2)]",
                  ].join(" ")}
                  onClick={() => setMoreOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}

function AppHeaderChrome({
  user,
  loadingUser,
}: {
  user: HorizonUser;
  loadingUser: boolean;
}) {
  const links = linksForUser(user);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-sans text-base font-semibold tracking-tight text-primary sm:text-lg"
        >
          <StampMark className="h-7 w-7 sm:h-8 sm:w-8" />
          <span>SkillsPhase</span>
        </Link>
        <div className="flex shrink-0 items-center gap-3">
          {hasClerk ? <SafeUserButton /> : null}
        </div>
      </div>
      {!loadingUser ? <AppNavRow links={links} /> : null}
    </header>
  );
}

function PublicHeaderChrome({
  user,
  loadingUser,
}: {
  user: HorizonUser | null;
  loadingUser: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const close = () => setOpen(false);
  const links = user ? linksForUser(user) : PUBLIC_LINKS;

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
      <div className="mx-auto flex w-full max-w-[1180px] items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="mr-auto flex shrink-0 items-center gap-2.5 font-sans text-lg font-semibold tracking-tight text-primary sm:text-xl md:text-2xl"
          onClick={close}
        >
          <StampMark className="h-8 w-8 sm:h-9 sm:w-9" />
          <span>SkillsPhase</span>
        </Link>

        <div className="flex shrink-0 items-center gap-2 md:hidden">
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
          className="hidden min-w-0 shrink items-center justify-end gap-5 overflow-x-auto md:flex lg:gap-8"
          aria-label="Main"
        >
          {!loadingUser
            ? links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={guestNavLinkClass}
                >
                  {link.label}
                </Link>
              ))
            : null}
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
            {!loadingUser
              ? links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={mobileNavLinkClass}
                    onClick={close}
                  >
                    {link.label}
                  </Link>
                ))
              : null}
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

function HeaderChrome({
  user,
  loadingUser,
}: {
  user: HorizonUser | null;
  loadingUser: boolean;
}) {
  if (usesAppNav(user) && user) {
    return <AppHeaderChrome user={user} loadingUser={loadingUser} />;
  }
  return <PublicHeaderChrome user={user} loadingUser={loadingUser} />;
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
