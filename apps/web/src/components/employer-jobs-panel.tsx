"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ApiRequestError,
  closeJob,
  deleteDraftJob,
  publishJob,
  reopenJob,
  type HorizonJob,
} from "@/lib/api";

export function EmployerJobsPanel({ jobs }: { jobs: HorizonJob[] }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function run(
    id: number,
    action: "publish" | "close" | "reopen" | "delete",
  ) {
    setPendingId(id);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Missing session token");
      if (action === "publish") await publishJob(token, id);
      if (action === "close") await closeJob(token, id);
      if (action === "reopen") await reopenJob(token, id);
      if (action === "delete") await deleteDraftJob(token, id);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Action failed.",
      );
      setPendingId(null);
    }
  }

  if (jobs.length === 0) {
    return (
      <p className="text-[color:var(--foreground)]/70">
        No jobs yet.{" "}
        <Link href="/employer/jobs/new" className="font-semibold text-brand underline">
          Create one
        </Link>
        .
      </p>
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
                {job.status} · {job.location}
              </p>
              {job.status === "published" ? (
                <Link
                  href={`/jobs/${job.slug}`}
                  className="mt-1 inline-block text-sm text-brand underline"
                >
                  View public page
                </Link>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {job.status === "draft" ? (
                <>
                  <Action
                    label="Publish"
                    disabled={pendingId === job.id}
                    onClick={() => void run(job.id, "publish")}
                  />
                  <Action
                    label="Delete"
                    disabled={pendingId === job.id}
                    onClick={() => void run(job.id, "delete")}
                  />
                </>
              ) : null}
              {job.status === "published" ? (
                <Action
                  label="Close"
                  disabled={pendingId === job.id}
                  onClick={() => void run(job.id, "close")}
                />
              ) : null}
              {job.status === "closed" ? (
                <Action
                  label="Reopen"
                  disabled={pendingId === job.id}
                  onClick={() => void run(job.id, "reopen")}
                />
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function Action({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
    >
      {label}
    </button>
  );
}
