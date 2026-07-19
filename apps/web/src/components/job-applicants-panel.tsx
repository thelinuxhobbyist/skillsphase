"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ApiRequestError,
  applicationCvUrl,
  updateApplicationStatus,
  type HorizonApplication,
} from "@/lib/api";

const STATUS_OPTIONS = [
  "under_review",
  "interview",
  "offer",
  "hired",
  "rejected",
] as const;

export function JobApplicantsPanel({
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
      <p className="text-[color:var(--foreground)]/70">No applications yet.</p>
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
          <h2 className="font-semibold text-brand">
            {application.candidateName}
          </h2>
          <p className="text-sm text-[color:var(--foreground)]/70">
            {application.candidateEmail}
            {application.location ? ` · ${application.location}` : ""}
          </p>
          {application.careerSummary ? (
            <p className="mt-2 text-sm text-[color:var(--foreground)]/80">
              {application.careerSummary}
            </p>
          ) : null}
          {application.coverLetter ? (
            <p className="mt-2 whitespace-pre-wrap text-sm text-[color:var(--foreground)]/75">
              {application.coverLetter}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <select
              disabled={
                pendingId === application.id ||
                application.status === "withdrawn"
              }
              value={
                application.status === "applied"
                  ? "under_review"
                  : application.status === "withdrawn"
                    ? "withdrawn"
                    : application.status
              }
              className="rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
              onChange={(event) => {
                const status = event.target.value as (typeof STATUS_OPTIONS)[number];
                void (async () => {
                  setPendingId(application.id);
                  setError(null);
                  try {
                    const token = await getToken();
                    if (!token) throw new Error("Missing session token");
                    await updateApplicationStatus(token, application.id, status);
                    router.refresh();
                  } catch (err) {
                    setError(
                      err instanceof ApiRequestError || err instanceof Error
                        ? err.message
                        : "Status update failed.",
                    );
                    setPendingId(null);
                  }
                })();
              }}
            >
              {application.status === "applied" ? (
                <option value="under_review">applied → under review</option>
              ) : null}
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
              {application.status === "withdrawn" ? (
                <option value="withdrawn">withdrawn</option>
              ) : null}
            </select>

            <button
              type="button"
              className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white"
              onClick={() => {
                void (async () => {
                  const token = await getToken();
                  if (!token) return;
                  const response = await fetch(applicationCvUrl(application.id), {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (!response.ok) {
                    setError("Unable to download CV snapshot.");
                    return;
                  }
                  const blob = await response.blob();
                  const url = URL.createObjectURL(blob);
                  const anchor = document.createElement("a");
                  anchor.href = url;
                  anchor.download = application.cvFileName ?? "cv";
                  anchor.click();
                  URL.revokeObjectURL(url);
                })();
              }}
            >
              Download CV
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
