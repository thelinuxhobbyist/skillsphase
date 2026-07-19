"use client";

import Link from "next/link";
import { useState } from "react";
import { SignUp } from "@clerk/nextjs";
import {
  storeBootstrapRole,
  type BootstrapRole,
} from "@/lib/roles";

export default function RegisterPage() {
  const configured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const [role, setRole] = useState<BootstrapRole | null>(null);

  if (!configured) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 py-16">
        <h1 className="mb-6 font-[family-name:var(--font-fraunces)] text-3xl text-brand">
          Create your account
        </h1>
        <p className="text-center text-[color:var(--foreground)]/75">
          Add <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> to enable Clerk
          registration.
        </p>
      </main>
    );
  }

  if (!role) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-6 py-16">
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
          Join Project Horizon
        </h1>
        <p className="mt-3 text-[color:var(--foreground)]/75">
          Choose your account type to continue.
        </p>
        <div className="mt-8 grid gap-4">
          <button
            type="button"
            className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-4 text-left transition hover:bg-white"
            onClick={() => {
              storeBootstrapRole("job_seeker");
              setRole("job_seeker");
            }}
          >
            <span className="block font-semibold text-brand">Job Seeker</span>
            <span className="mt-1 block text-sm text-[color:var(--foreground)]/70">
              Build a profile and apply to returner-friendly roles.
            </span>
          </button>
          <button
            type="button"
            className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-4 text-left transition hover:bg-white"
            onClick={() => {
              storeBootstrapRole("employer");
              setRole("employer");
            }}
          >
            <span className="block font-semibold text-brand">Employer</span>
            <span className="mt-1 block text-sm text-[color:var(--foreground)]/70">
              Verify your UK company and hire career returners.
            </span>
          </button>
        </div>
        <p className="mt-6 text-sm text-[color:var(--foreground)]/65">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand underline">
            Sign in
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 py-16">
      <button
        type="button"
        className="mb-4 self-start text-sm text-brand underline"
        onClick={() => setRole(null)}
      >
        ← Change account type
      </button>
      <h1 className="mb-6 font-[family-name:var(--font-fraunces)] text-3xl text-brand">
        {role === "employer" ? "Employer registration" : "Job seeker registration"}
      </h1>
      <SignUp
        routing="hash"
        signInUrl="/login"
        forceRedirectUrl="/onboarding"
        fallbackRedirectUrl="/onboarding"
        unsafeMetadata={{ horizonRole: role }}
      />
    </main>
  );
}
