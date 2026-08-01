"use client";

import { AuthSignUp } from "@/components/auth-sign-up";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState, useTransition } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import {
  ApiRequestError,
  bootstrapUser,
  getCurrentUser,
  type HorizonUser,
} from "@/lib/api";
import {
  clearBootstrapRole,
  dashboardPathForRole,
  readBootstrapRole,
  storeBootstrapRole,
  type BootstrapRole,
} from "@/lib/roles";
import { isClerkConfigured } from "@/lib/clerk-config";

const hasClerk = isClerkConfigured();

function withChrome(content: React.ReactNode) {
  return (
    <>
      <SiteHeader />
      {content}
    </>
  );
}

function parseRoleParam(value: string | null): BootstrapRole | null {
  if (
    value === "job_seeker" ||
    value === "seeker" ||
    value === "returner" ||
    value === "candidate"
  ) {
    return "job_seeker";
  }
  if (value === "employer" || value === "business" || value === "company") {
    return "employer";
  }
  return null;
}

/** Never surface SQL / driver internals in the UI. */
function friendlyBootstrapError(err: unknown): string {
  if (err instanceof ApiRequestError) {
    if (
      err.code === "INTERNAL_ERROR" ||
      err.code === "NETWORK_ERROR" ||
      /Failed query/i.test(err.message) ||
      /insert into/i.test(err.message)
    ) {
      return "We couldn't finish creating your account. Please try again in a moment.";
    }
    return err.message;
  }
  if (err instanceof Error) {
    if (/Failed query/i.test(err.message) || /insert into/i.test(err.message)) {
      return "We couldn't finish creating your account. Please try again in a moment.";
    }
    return err.message;
  }
  return "Unable to connect to your SkillsPhase account.";
}

function ConfiguredRegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();

  const [role, setRole] = useState<BootstrapRole | null>(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [currentUser, setCurrentUser] = useState<HorizonUser | null>(null);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [, startTransition] = useTransition();
  const [retryToken, setRetryToken] = useState(0);
  // Track which signed-in + role combo we already attempted, so choosing a
  // role after first paint can still trigger bootstrap.
  const lastSyncKey = useRef<string | null>(null);

  const queryRole = parseRoleParam(
    searchParams.get("as") ?? searchParams.get("role"),
  );

  useEffect(() => {
    if (queryRole) {
      storeBootstrapRole(queryRole);
      setRole(queryRole);
    }
  }, [queryRole]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      lastSyncKey.current = null;
      setCheckingUser(false);
      return;
    }

    const targetRole = queryRole ?? role ?? readBootstrapRole();
    const syncKey = `${targetRole ?? "none"}:${retryToken}`;
    if (lastSyncKey.current === syncKey) {
      return;
    }
    lastSyncKey.current = syncKey;

    setCheckingUser(true);
    let isCancelled = false;

    async function checkAndSyncUser() {
      try {
        const token = await getToken();
        if (!token) {
          if (!isCancelled) setCheckingUser(false);
          return;
        }

        let user: HorizonUser;
        try {
          user = await getCurrentUser(token);
        } catch (err) {
          if (
            err instanceof ApiRequestError &&
            (err.code === "USER_NOT_BOOTSTRAPPED" || err.status === 409)
          ) {
            if (targetRole) {
              if (!isCancelled) setIsBootstrapping(true);
              user = await bootstrapUser(token, targetRole);
              clearBootstrapRole();
            } else {
              // Wait for the user to pick Candidate vs Business — do not lock
              // the sync key forever, or choosing a role later never bootstraps.
              if (!isCancelled) {
                lastSyncKey.current = null;
                setCheckingUser(false);
              }
              return;
            }
          } else {
            throw err;
          }
        }

        if (isCancelled) return;

        setCurrentUser(user);

        const desiredRole = queryRole ?? role;
        if (!desiredRole || user.role === desiredRole) {
          startTransition(() => {
            router.replace(dashboardPathForRole(user.role));
          });
        } else {
          setCheckingUser(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setBootstrapError(friendlyBootstrapError(err));
          setCheckingUser(false);
        }
      } finally {
        if (!isCancelled) setIsBootstrapping(false);
      }
    }

    void checkAndSyncUser();

    return () => {
      isCancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken, queryRole, role, router, retryToken]);

  function chooseRole(next: BootstrapRole) {
    storeBootstrapRole(next);
    // Allow the sync effect to run again now that a role exists.
    lastSyncKey.current = null;
    setRole(next);
  }

  if (!isLoaded || checkingUser || isBootstrapping) {
    return withChrome(
      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="text-[color:var(--foreground)]/70">
          {isBootstrapping
            ? "Setting up your SkillsPhase account…"
            : "Checking account status…"}
        </p>
      </main>,
    );
  }

  if (bootstrapError) {
    return withChrome(
      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="font-display text-3xl text-primary">
          Connection error
        </h1>
        <p className="mt-4 text-red-700" role="alert">
          {bootstrapError}
        </p>
        <button
          type="button"
          onClick={() => {
            lastSyncKey.current = null;
            setBootstrapError(null);
            setCheckingUser(true);
            setRetryToken((value) => value + 1);
          }}
          className="btn-primary mt-6 inline-block rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </main>,
    );
  }

  if (isSignedIn && currentUser) {
    const targetRole = queryRole ?? role;
    return withChrome(
      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="font-display text-3xl text-primary">
          Account already active
        </h1>
        <p className="mt-4 text-[color:var(--foreground)]/75">
          You are currently signed in as{" "}
          <strong>
            {currentUser.role === "employer" ? "a Business" : "a Candidate"}
          </strong>{" "}
          ({currentUser.email}).
        </p>
        <p className="mt-2 text-sm text-[color:var(--foreground)]/65">
          Your account role is already registered. To register as a{" "}
          {targetRole === "employer" ? "business" : "candidate"}, please sign out
          first.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href={dashboardPathForRole(currentUser.role)}
            className="btn-primary rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white"
          >
            Go to your dashboard
          </Link>
          <button
            type="button"
            onClick={() =>
              void signOut({
                redirectUrl: `/register${targetRole ? `?as=${targetRole}` : ""}`,
              })
            }
            className="rounded-md border border-[color:var(--line)] bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-white/80"
          >
            Sign out to switch accounts
          </button>
        </div>
      </main>,
    );
  }

  if (!role) {
    return withChrome(
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-4xl text-primary">
          Join SkillsPhase
        </h1>
        <p className="mt-3 max-w-xl text-[color:var(--foreground)]/75">
          Skills first. Because life happens. Choose how you want to use
          SkillsPhase — pick the path that fits you.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-6 text-left transition hover:border-brand hover:bg-white"
            onClick={() => chooseRole("job_seeker")}
          >
            <p className="text-sm font-medium text-primary-accent">
              For candidates
            </p>
            <h2 className="mt-2 font-display text-2xl text-primary">
              I have skills to show
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--foreground)]/70">
              Build a Skill Profile with your skills, experience, and portfolio
              evidence. No CV required.
            </p>
            <span className="btn-primary mt-6 inline-block rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-white">
              Create your Skill Profile
            </span>
          </button>

          <button
            type="button"
            className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-6 text-left transition hover:border-brand hover:bg-white"
            onClick={() => chooseRole("employer")}
          >
            <p className="text-sm font-medium text-primary">
              For businesses
            </p>
            <h2 className="mt-2 font-display text-2xl text-primary">
              I want to discover talent
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--foreground)]/70">
              Register your UK company, verify it, and browse skill-based
              profiles with real portfolio evidence.
            </p>
            <span className="btn-primary mt-6 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white">
              Register as a business
            </span>
          </button>
        </div>

        <p className="mt-8 text-sm text-[color:var(--foreground)]/65">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary underline">
            Sign in
          </Link>
        </p>
      </main>,
    );
  }

  return withChrome(
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 py-16">
      <button
        type="button"
        className="mb-4 self-start text-sm text-primary underline"
        onClick={() => setRole(null)}
      >
        ← Change account type
      </button>
      <h1 className="mb-2 font-display text-3xl text-primary">
        {role === "employer" ? "Business registration" : "Candidate registration"}
      </h1>
      <p className="mb-6 self-start text-sm text-[color:var(--foreground)]/70">
        {role === "employer"
          ? "Create your business account, then verify your UK company."
          : "Create your candidate account to build your Skill Profile."}
      </p>
      <AuthSignUp role={role} />
    </main>,
  );
}

function UnconfiguredRegisterContent() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<BootstrapRole | null>(null);

  useEffect(() => {
    const fromQuery = parseRoleParam(
      searchParams.get("as") ?? searchParams.get("role"),
    );
    if (fromQuery) {
      setRole(fromQuery);
    }
  }, [searchParams]);

  if (!role) {
    return withChrome(
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-4xl text-primary">
          Join SkillsPhase
        </h1>
        <p className="mt-3 max-w-xl text-[color:var(--foreground)]/75">
          Skills first. Because life happens. Choose how you want to use
          SkillsPhase — pick the path that fits you.
        </p>
        <p className="mt-8 text-sm text-[color:var(--foreground)]/65">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary underline">
            Sign in
          </Link>
        </p>
      </main>,
    );
  }

  return withChrome(
    <main className="mx-auto max-w-lg px-6 py-16">
      <h1 className="font-display text-3xl text-primary">
        {role === "employer" ? "Business registration" : "Candidate registration"}
      </h1>
      <p className="mt-4 text-[color:var(--foreground)]/75">
        Clerk is not configured yet, so account creation is unavailable in this
        preview.
      </p>
      <Link
        href="/"
        className="btn-primary mt-8 inline-block rounded-md bg-brand-accent px-5 py-3 text-sm font-semibold text-white"
      >
        Back home
      </Link>
    </main>,
  );
}

function RegisterContent() {
  if (hasClerk) {
    return <ConfiguredRegisterContent />;
  }
  return <UnconfiguredRegisterContent />;
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-[color:var(--foreground)]/70">Loading…</p>
        </main>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
