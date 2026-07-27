"use client";

import { AuthFormSkeleton } from "@/components/auth-form-skeleton";
import { SignUp } from "@clerk/nextjs";
import type { BootstrapRole } from "@/lib/roles";

/**
 * Client-only SignUp with an always-visible fallback (same SSR blank-page
 * issue as SignIn). Uses path routing to match /login.
 */
export function AuthSignUp({ role }: { role: BootstrapRole }) {
  return (
    <SignUp
      routing="path"
      path="/register"
      signInUrl="/login"
      forceRedirectUrl="/onboarding"
      fallbackRedirectUrl="/onboarding"
      unsafeMetadata={{ horizonRole: role }}
      fallback={<AuthFormSkeleton />}
    />
  );
}
