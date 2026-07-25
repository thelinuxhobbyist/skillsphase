"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCurrentUser, getProfileBundle, type HorizonUser } from "@/lib/api";
import { isClerkConfigured } from "@/lib/clerk-config";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function SkillsMatchPanel({
  requiredSkills,
}: {
  requiredSkills: string[];
}) {
  if (!isClerkConfigured()) {
    return (
      <div className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
        <p className="text-sm font-semibold text-brand">Skills match</p>
        <p className="mt-2 text-sm text-[color:var(--foreground)]/75">
          Create a returner profile to see how your skills line up with this
          role — a Project Horizon difference versus traditional job boards.
        </p>
        <Link
          href="/register?as=seeker"
          className="mt-3 inline-block text-sm font-semibold text-brand underline"
        >
          Create your profile
        </Link>
      </div>
    );
  }
  return <ConfiguredSkillsMatchPanel requiredSkills={requiredSkills} />;
}

function ConfiguredSkillsMatchPanel({
  requiredSkills,
}: {
  requiredSkills: string[];
}) {
  const { isSignedIn, getToken } = useAuth();
  const [profileSkills, setProfileSkills] = useState<string[] | null>(null);
  const [user, setUser] = useState<HorizonUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      setProfileSkills(null);
      setUser(null);
      return;
    }
    setLoading(true);
    void (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const [me, profile] = await Promise.all([
          getCurrentUser(token),
          getProfileBundle(token).catch(() => null),
        ]);
        setUser(me);
        setProfileSkills(profile?.skills.map((s) => s.name) ?? []);
      } catch {
        setProfileSkills(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [isSignedIn, getToken]);

  const match = useMemo(() => {
    if (!profileSkills || requiredSkills.length === 0) return null;
    const have = new Set(profileSkills.map(normalize));
    const matched = requiredSkills.filter((s) => have.has(normalize(s)));
    const missing = requiredSkills.filter((s) => !have.has(normalize(s)));
    const percent = Math.round((matched.length / requiredSkills.length) * 100);
    return { matched, missing, percent };
  }, [profileSkills, requiredSkills]);

  if (!isSignedIn) {
    return (
      <div className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
        <p className="text-sm font-semibold text-brand">Skills match</p>
        <p className="mt-2 text-sm text-[color:var(--foreground)]/75">
          Create a returner profile to see how your skills line up with this
          role — a Project Horizon difference versus traditional job boards.
        </p>
        <Link
          href="/register?as=seeker"
          className="mt-3 inline-block text-sm font-semibold text-brand underline"
        >
          Create your profile
        </Link>
      </div>
    );
  }

  if (user && user.role !== "job_seeker") {
    return null;
  }

  if (loading || profileSkills == null || !match) {
    return (
      <div className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
        <p className="text-sm font-semibold text-brand">Skills match</p>
        <p className="mt-2 text-sm text-[color:var(--foreground)]/70">
          Checking your profile…
        </p>
      </div>
    );
  }

  if (profileSkills.length === 0) {
    return (
      <div className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
        <p className="text-sm font-semibold text-brand">Skills match</p>
        <p className="mt-2 text-sm text-[color:var(--foreground)]/75">
          Add skills to your profile to unlock a match score for this role.
        </p>
        <Link
          href="/profile"
          className="mt-3 inline-block text-sm font-semibold text-brand underline"
        >
          Complete your profile
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-brand">Skills match</p>
        <p className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
          {match.percent}%
        </p>
      </div>
      <p className="mt-1 text-xs text-[color:var(--foreground)]/65">
        Based on skills on your Project Horizon profile
      </p>
      {match.matched.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            Matched
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {match.matched.map((skill) => (
              <li
                key={skill}
                className="rounded-md bg-brand/10 px-2 py-1 text-xs font-medium text-brand"
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {match.missing.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)]/55">
            Not on your profile yet
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {match.missing.map((skill) => (
              <li
                key={skill}
                className="rounded-md border border-dashed border-[color:var(--line)] px-2 py-1 text-xs text-[color:var(--foreground)]/70"
              >
                {skill}
              </li>
            ))}
          </ul>
          <Link
            href="/profile"
            className="mt-2 inline-block text-xs font-semibold text-brand underline"
          >
            Update skills
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function JobListingActions({
  jobId,
  isExample,
  title,
  slug,
}: {
  jobId: number | null;
  isExample: boolean;
  title: string;
  slug: string;
}) {
  const [saved, setSaved] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const storageKey = `horizon.savedJob.${slug}`;

  useEffect(() => {
    try {
      setSaved(window.localStorage.getItem(storageKey) === "1");
    } catch {
      setSaved(false);
    }
  }, [storageKey]);

  function toggleSave() {
    try {
      if (saved) {
        window.localStorage.removeItem(storageKey);
        setSaved(false);
      } else {
        window.localStorage.setItem(storageKey, "1");
        setSaved(true);
      }
    } catch {
      /* ignore */
    }
  }

  async function share() {
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : `https://horizon-web.yama.workers.dev/jobs/${isExample ? `examples/${slug}` : slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNote("Link copied");
      window.setTimeout(() => setShareNote(null), 2000);
    } catch {
      setShareNote("Unable to share");
      window.setTimeout(() => setShareNote(null), 2000);
    }
  }

  return (
    <div className="space-y-2">
      {isExample || jobId == null ? (
        <button
          type="button"
          disabled
          className="w-full cursor-not-allowed rounded-md bg-brand/40 px-4 py-3 text-sm font-semibold text-white"
        >
          Apply now (example)
        </button>
      ) : (
        <a
          href="#apply"
          className="block w-full rounded-md bg-brand-accent px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
        >
          Apply now
        </a>
      )}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={toggleSave}
          className="rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm font-semibold text-brand"
        >
          {saved ? "Saved" : "Save job"}
        </button>
        <button
          type="button"
          onClick={() => void share()}
          className="rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm font-semibold text-brand"
        >
          Share
        </button>
      </div>
      {shareNote ? (
        <p className="text-xs text-[color:var(--foreground)]/65">{shareNote}</p>
      ) : null}
    </div>
  );
}
