"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiRequestError, applyToJob } from "@/lib/api";

export function ApplyForm({
  jobId,
  defaultCoverLetter,
}: {
  jobId: number;
  defaultCoverLetter?: string | null;
}) {
  const { isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const [coverLetter, setCoverLetter] = useState(defaultCoverLetter ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  if (!isSignedIn) {
    return (
      <div className="mt-10">
        <Link
          href="/login"
          className="inline-block rounded-md bg-brand-accent px-5 py-3 text-sm font-semibold text-white"
        >
          Sign in to apply
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mt-10 rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
        <p className="font-semibold text-brand">Application submitted</p>
        <p className="mt-2 text-sm text-[color:var(--foreground)]/75">
          You can track progress in{" "}
          <Link href="/applications" className="underline">
            My applications
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      className="mt-10 space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        void (async () => {
          setPending(true);
          setError(null);
          try {
            const token = await getToken();
            if (!token) throw new Error("Missing session token");
            await applyToJob(token, jobId, coverLetter || null);
            setDone(true);
            router.refresh();
          } catch (err) {
            setError(
              err instanceof ApiRequestError || err instanceof Error
                ? err.message
                : "Unable to apply.",
            );
            setPending(false);
          }
        })();
      }}
    >
      <label className="block text-sm">
        <span className="font-medium text-brand">Cover letter (optional)</span>
        <textarea
          rows={6}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
        />
      </label>
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
          {error.toLowerCase().includes("profile") ? (
            <>
              {" "}
              <Link href="/profile" className="underline">
                Complete your profile
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-accent px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        Submit application
      </button>
    </form>
  );
}
