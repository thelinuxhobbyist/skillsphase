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

function GuestActions({
  onNavigate,
  stacked = false,
}: {
  onNavigate?: () => void;
  stacked?: boolean;
}) {
  const layoutClass = stacked
    ? "flex flex-col gap-3"
    : "flex items-center gap-[18px]";

  return (
    <div className={layoutClass}>
      <Link
        href="/login"
        className={`text-[14.5px] font-medium text-muted-foreground transition-colors hover:text-foreground ${stacked ? "" : "max-[920px]:hidden"}`}
        onClick={onNavigate}
      >
        Sign in
      </Link>
      <Link
        href="/register"
        className={`btn-primary rounded-lg px-[22px] py-2.5 text-sm font-semibold ${stacked ? "text-center" : ""}`}
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
          className="flex shrink-0 items-center gap-2 font-display text-base font-semibold tracking-tight text-primary sm:text-lg"
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
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const close = () => setOpen(false);
  const links = user ? linksForUser(user) : PUBLIC_LINKS;

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function publicLinkClass(href: string) {
    const active = isNavLinkActive(pathname, href);
    return [
      "relative px-1 py-2 text-[14.5px] font-medium transition-colors",
      "after:absolute after:right-1 after:bottom-0.5 after:left-1 after:h-0.5 after:origin-left after:bg-primary after:transition-transform after:duration-150",
      active
        ? "text-foreground after:scale-x-100"
        : "text-muted-foreground after:scale-x-0 hover:text-foreground hover:after:scale-x-100",
    ].join(" ");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-[10px]">
      <nav
        className="relative mx-auto flex w-full max-w-[1160px] items-center justify-between gap-6 px-5 py-4 sm:px-8"
        aria-label="Main"
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 font-display text-[19px] font-semibold tracking-tight text-foreground"
          onClick={close}
        >
          <StampMark className="h-[29px] w-[29px]" />
          <span>SkillsPhase</span>
        </Link>

        <div
          id={menuId}
          className={[
            "min-[921px]:flex min-[921px]:flex-1 min-[921px]:items-center",
            open
              ? "absolute top-full right-0 left-0 z-50 block border-b border-border bg-background"
              : "hidden min-[921px]:flex",
          ].join(" ")}
        >
          <ul
            className={[
              "flex list-none",
              "max-[920px]:flex-col max-[920px]:items-stretch max-[920px]:px-5 max-[920px]:py-2 sm:max-[920px]:px-8",
              "min-[921px]:ml-11 min-[921px]:flex-row min-[921px]:items-center",
            ].join(" ")}
          >
            {!loadingUser
              ? links.map((link, index) => (
                  <li
                    key={link.href}
                    className={
                      index > 0
                        ? "min-[921px]:ml-7 max-[920px]:border-t max-[920px]:border-border"
                        : ""
                    }
                  >
                    <Link
                      href={link.href}
                      className={[
                        publicLinkClass(link.href),
                        "max-[920px]:block max-[920px]:px-0 max-[920px]:py-3 max-[920px]:after:hidden",
                      ].join(" ")}
                      onClick={close}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))
              : null}
          </ul>
        </div>

        <div className="flex shrink-0 items-center gap-[18px]">
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
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center text-foreground min-[921px]:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </nav>
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
