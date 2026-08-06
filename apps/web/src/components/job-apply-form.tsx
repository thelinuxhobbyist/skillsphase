"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiRequestError, applyToJob } from "@/lib/api";

export function JobApplyForm({
  jobId,
  jobTitle,
}: {
  jobId: number;
  jobTitle: string;
}) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isLoaded) {
    return <p className="text-sm text-[color:var(--ink-soft)]">Loading…</p>;
  }

  if (!isSignedIn) {
    return (
      <div className="rounded-md border border-[color:var(--line)] bg-[color:var(--paper-warm)] p-5">
        <p className="font-display text-lg font-semibold text-[color:var(--ink)]">
          Apply with your SkillsPhase profile
        </p>
        <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
          Sign in or create a profile to apply. You won&apos;t upload a CV —
          employers review your capabilities and evidence first.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/login?redirect_url=${encodeURIComponent(`/jobs`)}`}
            className="btn-primary rounded-md px-4 py-2 text-sm font-semibold"
          >
            Sign in to apply
          </Link>
          <Link
            href="/register?as=candidate"
            className="rounded-md border border-[color:var(--line)] px-4 py-2 text-sm font-semibold"
          >
            Create profile
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const token = await getToken();
      if (!token) {
        setError("Please sign in again to apply.");
        return;
      }
      const result = await applyToJob(token, jobId, {
        coverLetter: coverLetter.trim() || null,
      });
      setMessage(result.message);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.code === "PROFILE_INCOMPLETE") {
          setError(err.message);
        } else {
          setError(err.message);
        }
      } else {
        setError("Unable to submit application.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-md border border-[color:var(--line)] bg-white p-5"
    >
      <p className="font-display text-lg font-semibold text-[color:var(--ink)]">
        Apply for {jobTitle}
      </p>
      <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
        Your SkillsPhase profile is the application. Share an optional note —
        CVs, certificates, and references stay available upon request later.
      </p>
      <label className="mt-4 block text-sm font-medium text-[color:var(--ink)]">
        Optional note to the employer
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          rows={4}
          maxLength={5000}
          className="mt-1.5 w-full rounded-md border border-[color:var(--line)] px-3 py-2 text-sm"
          placeholder="Why you're a fit for this role…"
        />
      </label>
      {error ? (
        <p className="mt-3 text-sm text-red-700">
          {error}{" "}
          {error.toLowerCase().includes("complete") ? (
            <Link href="/profile" className="underline">
              Finish your profile
            </Link>
          ) : null}
        </p>
      ) : null}
      {message ? (
        <p className="mt-3 text-sm text-primary">{message}</p>
      ) : null}
      <button
        type="submit"
        disabled={submitting || Boolean(message)}
        className="btn-primary mt-4 rounded-md px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
      >
        {submitting ? "Submitting…" : message ? "Applied" : "Apply with profile"}
      </button>
    </form>
  );
}
