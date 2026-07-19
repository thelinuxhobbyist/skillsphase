"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

/**
 * Clerk is wired for Phase 1. When publishable key is missing (local scaffold),
 * the app still renders so docs/UI work can proceed without secrets.
 */
export function Providers({ children }: ProvidersProps) {
  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";
  const configured =
    publishableKey.startsWith("pk_") && !publishableKey.includes("...");

  if (!configured) {
    return <>{children}</>;
  }

  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>;
}
