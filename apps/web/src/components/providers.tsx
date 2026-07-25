import { isClerkConfigured, getClerkPublishableKey } from "@/lib/clerk-config";
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
  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>;
}
