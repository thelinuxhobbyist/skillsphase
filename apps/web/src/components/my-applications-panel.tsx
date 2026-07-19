"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ApiRequestError,
  withdrawApplication,
  type HorizonApplication,
} from "@/lib/api";

export function MyApplicationsPanel({
  applications,
}: {
  applications: HorizonApplication[];
}) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  if (applications.length === 0) {
    return (
      <p className="text-[color:var(--foreground)]/70">
        No applications yet.{" "}
        <Link href="/jobs" className="font-semibold text-brand underline">
          Browse jobs
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
      {applications.map((application) => (
        <article
          key={application.id}
          className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-brand">
                <Link href={`/jobs/${application.jobSlug}`} className="underline">
                  {application.jobTitle}
                </Link>
              </h2>
              <p className="text-sm text-[color:var(--foreground)]/70">
                {application.companyName} · {application.status.replace("_", " ")}
              </p>
              <p className="mt-1 text-xs text-[color:var(--foreground)]/55">
                Applied {new Date(application.createdAt).toLocaleDateString("en-GB")}
              </p>
            </div>
            {application.status !== "withdrawn" &&
            application.status !== "hired" &&
            application.status !== "rejected" ? (
              <button
                type="button"
                disabled={pendingId === application.id}
                className="rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm font-semibold text-brand disabled:opacity-60"
                onClick={() => {
                  void (async () => {
                    setPendingId(application.id);
                    setError(null);
                    try {
                      const token = await getToken();
                      if (!token) throw new Error("Missing session token");
                      await withdrawApplication(token, application.id);
                      router.refresh();
                    } catch (err) {
                      setError(
                        err instanceof ApiRequestError || err instanceof Error
                          ? err.message
                          : "Withdraw failed.",
                      );
                      setPendingId(null);
                    }
                  })();
                }}
              >
                Withdraw
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
