"use client";

import { useAuth } from "@clerk/nextjs";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ApiRequestError, confirmBusinessEmailVerification } from "@/lib/api";

function VerifyEmailContent() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<"pending" | "success" | "error">(
    "pending",
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setState("error");
      setMessage("Sign in to your business account, then reopen this link.");
      return;
    }
    if (!token) {
      setState("error");
      setMessage("This verification link is missing a token.");
      return;
    }

    void (async () => {
      try {
        const sessionToken = await getToken();
        if (!sessionToken) throw new Error("Missing session token");
        await confirmBusinessEmailVerification(sessionToken, token);
        setState("success");
      } catch (err) {
        setState("error");
        setMessage(
          err instanceof ApiRequestError || err instanceof Error
            ? err.message
            : "Unable to verify this email.",
        );
      }
    })();
  }, [isLoaded, isSignedIn, getToken, token]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        {state === "pending" ? (
          <p className="text-[color:var(--foreground)]/70">Activating your account…</p>
        ) : null}
        {state === "success" ? (
          <>
            <h1 className="font-display text-3xl text-primary">
              Account activated
            </h1>
            <p className="mt-4 text-[color:var(--foreground)]/75">
              Your business account is now active. You can discover and contact
              candidates.
            </p>
            <Link
              href="/employer"
              className="btn-primary mt-8 inline-block rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white"
            >
              Go to dashboard
            </Link>
          </>
        ) : null}
        {state === "error" ? (
          <>
            <h1 className="font-display text-3xl text-primary">
              Activation failed
            </h1>
            <p className="mt-4 text-red-700" role="alert">
              {message}
            </p>
            <Link
              href="/employer/company"
              className="btn-primary mt-8 inline-block rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white"
            >
              Back to company profile
            </Link>
          </>
        ) : null}
      </main>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-lg px-6 py-16 text-center">
          <p className="text-[color:var(--foreground)]/70">Loading…</p>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
