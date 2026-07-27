"use client";

import { AuthFormSkeleton } from "@/components/auth-form-skeleton";
import { SignIn } from "@clerk/nextjs";

/**
 * Client-only SignIn with an always-visible fallback.
 * ClerkLoading/ClerkLoaded leave a blank gap during SSR/hydration, which
 * reads as a broken page (heading only). The SignIn `fallback` prop paints
 * immediately until clerk-js is ready.
 */
export function AuthSignIn() {
  return (
    <SignIn
      routing="path"
      path="/login"
      signUpUrl="/register"
      forceRedirectUrl="/onboarding"
      fallbackRedirectUrl="/onboarding"
      fallback={<AuthFormSkeleton />}
    />
  );
}
