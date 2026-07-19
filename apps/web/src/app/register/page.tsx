"use client";

import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { SignUp } from "@clerk/nextjs";
import {
  storeBootstrapRole,
  type BootstrapRole,
} from "@/lib/roles";

function withChrome(content: React.ReactNode) {
  return (
    <>
      <SiteHeader />
      {content}
    </>
  );
}

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";
const hasClerk =
  publishableKey.startsWith("pk_") && !publishableKey.includes("...");

function parseRoleParam(value: string | null): BootstrapRole | null {
  if (value === "job_seeker" || value === "seeker" || value === "returner") {
    return "job_seeker";
  }
  if (value === "employer" || value === "business" || value === "company") {
    return "employer";
  }
  return null;
}

function RegisterContent() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<BootstrapRole | null>(null);

  useEffect(() => {
    const fromQuery = parseRoleParam(
      searchParams.get("as") ?? searchParams.get("role"),
    );
    if (fromQuery) {
      storeBootstrapRole(fromQuery);
      setRole(fromQuery);
    }
  }, [searchParams]);

  function chooseRole(next: BootstrapRole) {
    storeBootstrapRole(next);
    setRole(next);
  }

  if (!role) {
    return withChrome(
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-[family-name:var(--font-fraunces)] text-4xl text-brand">
          Join Project Horizon
        </h1>
        <p className="mt-3 max-w-xl text-[color:var(--foreground)]/75">
          Choose how you want to use Horizon. Job seekers and employers create
          different accounts — pick the path that fits you.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-6 text-left transition hover:border-brand hover:bg-white"
            onClick={() => chooseRole("job_seeker")}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-accent">
              For individuals
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-fraunces)] text-2xl text-brand">
              I&apos;m returning to work
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--foreground)]/70">
              Create a job seeker profile, share your career story, and apply to
              gap-friendly UK roles.
            </p>
            <span className="btn-primary mt-6 inline-block rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-white">
              Register as a returner
            </span>
          </button>

          <button
            type="button"
            className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-6 text-left transition hover:border-brand hover:bg-white"
            onClick={() => chooseRole("employer")}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              For businesses
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-fraunces)] text-2xl text-brand">
              I want to hire returners
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--foreground)]/70">
              Register your UK company, complete verification, and post roles for
              career returners.
            </p>
            <span className="btn-primary mt-6 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white">
              Register as an employer
            </span>
          </button>
        </div>

        <p className="mt-8 text-sm text-[color:var(--foreground)]/65">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand underline">
            Sign in
          </Link>
        </p>
      </main>,
    );
  }

  if (!hasClerk) {
    return withChrome(
      <main className="mx-auto max-w-lg px-6 py-16">
        <button
          type="button"
          className="mb-4 text-sm text-brand underline"
          onClick={() => setRole(null)}
        >
          ← Change account type
        </button>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
          {role === "employer"
            ? "Employer registration"
            : "Returner registration"}
        </h1>
        <p className="mt-4 text-[color:var(--foreground)]/75">
          Clerk is not configured yet, so account creation is unavailable in this
          preview. Your choice ({role === "employer" ? "employer" : "job seeker"})
          is ready for when keys are added.
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

  return withChrome(
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 py-16">
      <button
        type="button"
        className="mb-4 self-start text-sm text-brand underline"
        onClick={() => setRole(null)}
      >
        ← Change account type
      </button>
      <h1 className="mb-2 font-[family-name:var(--font-fraunces)] text-3xl text-brand">
        {role === "employer"
          ? "Employer registration"
          : "Returner registration"}
      </h1>
      <p className="mb-6 self-start text-sm text-[color:var(--foreground)]/70">
        {role === "employer"
          ? "Create your business account, then verify your UK company."
          : "Create your job seeker account to build a profile and apply."}
      </p>
      <SignUp
        routing="hash"
        signInUrl="/login"
        forceRedirectUrl="/onboarding"
        fallbackRedirectUrl="/onboarding"
        unsafeMetadata={{ horizonRole: role }}
      />
    </main>,
  );
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
