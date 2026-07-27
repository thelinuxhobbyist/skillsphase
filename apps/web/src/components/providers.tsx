import {
  getClerkPublishableKey,
  getClerkSignInUrl,
  getClerkSignUpUrl,
  isClerkConfigured,
} from "@/lib/clerk-config";
import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

/**
 * Clerk is wired for Phase 1. When publishable key is missing or placeholder,
 * the app still renders so docs/UI work can proceed without secrets.
 */
export function Providers({ children }: ProvidersProps) {
  if (!isClerkConfigured()) {
    return <>{children}</>;
  }

  const publishableKey = getClerkPublishableKey();
  const signInUrl = getClerkSignInUrl();
  const signUpUrl = getClerkSignUpUrl();

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      afterSignInUrl="/onboarding"
      afterSignUpUrl="/onboarding"
      signInFallbackRedirectUrl="/onboarding"
      signUpFallbackRedirectUrl="/onboarding"
      appearance={{
        variables: {
          colorPrimary: "#31a88f",
          colorText: "#1a1f2e",
          colorBackground: "#fafbfb",
          borderRadius: "0.875rem",
          fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
