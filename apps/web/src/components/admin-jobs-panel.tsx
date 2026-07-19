"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminRemoveJob, ApiRequestError, type HorizonJob } from "@/lib/api";

export function AdminJobsPanel({ jobs }: { jobs: HorizonJob[] }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  if (jobs.length === 0) {
    return (
      <p className="text-[color:var(--foreground)]/70">No jobs to moderate.</p>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {jobs.map((job) => (
        <article
          key={job.id}
          className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-brand">{job.title}</h2>
              <p className="text-sm text-[color:var(--foreground)]/70">
                {job.companyName} · {job.status}
                {job.status === "published" ? (
                  <>
                    {" · "}
                    <Link href={`/jobs/${job.slug}`} className="underline">
                      public page
                    </Link>
                  </>
                ) : null}
              </p>
            </div>
            <button
              type="button"
              disabled={pendingId === job.id}
              className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              onClick={() => {
                void (async () => {
                  setPendingId(job.id);
                  setError(null);
                  try {
                    const token = await getToken();
                    if (!token) throw new Error("Missing session token");
                    await adminRemoveJob(token, job.id);
                    router.refresh();
                  } catch (err) {
                    setError(
                      err instanceof ApiRequestError || err instanceof Error
                        ? err.message
                        : "Remove failed.",
                    );
                    setPendingId(null);
                  }
                })();
              }}
            >
              Remove
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
