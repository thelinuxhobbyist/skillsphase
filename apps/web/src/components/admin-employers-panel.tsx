"use client";

import { useAdminToken } from "@/lib/use-admin-token";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminEmployerAction,
  ApiRequestError,
  type AdminEmployer,
} from "@/lib/api";

export function AdminEmployersPanel({
  employers,
}: {
  employers: AdminEmployer[];
}) {
  const { getToken } = useAdminToken();
  const router = useRouter();
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function runAction(
    companyId: string,
    action: "approve" | "reject" | "suspend" | "reinstate",
  ) {
    setPendingId(companyId);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Missing session token");
      await adminEmployerAction(
        token,
        companyId,
        action,
        action === "reject" ? rejectionReasons[companyId] : undefined,
      );
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

  if (employers.length === 0) {
    return (
      <p className="text-[color:var(--foreground)]/70">
        No employer registrations to show.
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
      {employers.map((employer) => (
        <article
          key={employer.id}
          className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-brand">{employer.companyName}</h2>
              <p className="text-sm text-[color:var(--foreground)]/70">
                {employer.companyNumber} · {employer.verificationStatus}
              </p>
              <p className="mt-1 text-sm">
                {employer.ownerName || "Owner"} · {employer.ownerEmail}
              </p>
              <p className="text-sm">
                {employer.recruiterName} ({employer.recruiterJobTitle})
              </p>
              <p className="text-sm">{employer.website}</p>
              {employer.businessEmailIsFreeProvider ? (
                <p className="mt-1 text-sm text-amber-800">
                  Free email provider flagged for review
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {employer.verificationStatus === "pending_review" ||
              employer.verificationStatus === "rejected" ? (
                <ActionButton
                  label="Approve"
                  disabled={pendingId === employer.id}
                  onClick={() => void runAction(employer.id, "approve")}
                />
              ) : null}
              {employer.verificationStatus !== "suspended" ? (
                <ActionButton
                  label="Suspend"
                  disabled={pendingId === employer.id}
                  onClick={() => void runAction(employer.id, "suspend")}
                />
              ) : (
                <ActionButton
                  label="Reinstate"
                  disabled={pendingId === employer.id}
                  onClick={() => void runAction(employer.id, "reinstate")}
                />
              )}
            </div>
          </div>

          {(employer.verificationStatus === "pending_review" ||
            employer.verificationStatus === "rejected") && (
            <div className="mt-4 flex flex-col gap-2 md:flex-row">
              <input
                value={rejectionReasons[employer.id] ?? ""}
                onChange={(event) =>
                  setRejectionReasons((current) => ({
                    ...current,
                    [employer.id]: event.target.value,
                  }))
                }
                placeholder="Rejection reason"
                className="flex-1 rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
              />
              <ActionButton
                label="Reject"
                disabled={pendingId === employer.id}
                onClick={() => void runAction(employer.id, "reject")}
              />
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function ActionButton({
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
