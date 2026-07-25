/**
 * Single source of truth for checking if Clerk authentication is configured in the web app.
 * Returns true only if NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set to a valid non-placeholder key.
 */
export function isClerkConfigured(): boolean {
  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";
  return publishableKey.startsWith("pk_") && !publishableKey.includes("...");
}

export function getClerkPublishableKey(): string {
  return isClerkConfigured()
    ? (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "")
    : "";
}
