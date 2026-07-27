/**
 * Single source of truth for Clerk configuration in the web app.
 */

function readPublishableKey(): string {
  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";
}

function readSecretKey(): string {
  return process.env.CLERK_SECRET_KEY?.trim() ?? "";
}

function isValidKey(value: string, prefix: "pk_" | "sk_"): boolean {
  return value.startsWith(prefix) && !value.includes("...");
}

/**
 * True when the browser can render Clerk components (publishable key only).
 */
export function isClerkConfigured(): boolean {
  return isValidKey(readPublishableKey(), "pk_");
}

/**
 * True when Next.js middleware can run clerkMiddleware.
 * Both keys are required: the secret key is needed for the development-instance
 * dev-browser handshake that authorizes browser requests to Clerk's Frontend API.
 */
export function isClerkMiddlewareEnabled(): boolean {
  return isValidKey(readPublishableKey(), "pk_") && isValidKey(readSecretKey(), "sk_");
}

export function getClerkPublishableKey(): string {
  return isClerkConfigured() ? readPublishableKey() : "";
}

/**
 * Clerk encodes its Frontend API host in the publishable key, so the browser can
 * warm the connection before clerk-js is requested.
 */
export function getClerkFrontendApiOrigin(): string | null {
  const key = readPublishableKey();
  const encoded = key.replace(/^pk_(live|test)_/, "");
  if (!encoded || encoded === key) return null;

  try {
    const host = atob(encoded).replace(/\$$/, "");
    return host ? `https://${host}` : null;
  } catch {
    return null;
  }
}

export function getClerkSignInUrl(): string {
  return process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL?.trim() || "/login";
}

export function getClerkSignUpUrl(): string {
  return process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL?.trim() || "/register";
}
