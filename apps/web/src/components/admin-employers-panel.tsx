"use client";

import { useAdminToken } from "@/lib/use-admin-token";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminEmployerAction,
  ApiRequestError,
  type AdminEmployer,
} from "@/lib/api";

const STATUS_ACCENT: Record<string, string> = {
  pending_review: "var(--mustard)",
  approved: "var(--verified)",
  rejected: "var(--stamp)",
  suspended: "var(--ink)",
  email_pending: "var(--mustard)",
};

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
      <p className="text-base text-[color:var(--ink-soft)]">
        No business registrations to show.
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
      {employers.map((employer) => {
        const accent =
          STATUS_ACCENT[employer.verificationStatus] ?? "var(--folder-line)";
        return (
          <article
            key={employer.id}
            className="rounded-[5px] border border-[color:var(--folder-line)] border-l-4 bg-[color:var(--folder)] p-5 sm:p-6"
            style={{ borderLeftColor: accent }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="font-display text-[1.35rem] font-semibold text-[color:var(--ink)]">
                    {employer.companyName}
                  </h2>
                  <span className="font-mono text-xs tracking-[0.08em] uppercase text-[color:var(--stamp)]">
                    {employer.verificationStatus.replaceAll("_", " ")}
                  </span>
                </div>
                <p className="mt-1 font-mono text-sm text-[color:var(--ink-soft)]">
                  {employer.companyNumber}
                </p>
                <p className="mt-3 text-base text-[color:var(--ink)]">
                  {employer.ownerName || "Owner"} · {employer.ownerEmail}
                </p>
                <p className="text-sm text-[color:var(--ink-soft)]">
                  {employer.recruiterName} ({employer.recruiterJobTitle})
                </p>
                {employer.website ? (
                  <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
                    {employer.website}
                  </p>
                ) : null}
                {employer.businessEmailIsFreeProvider ? (
                  <p className="mt-2 font-mono text-xs tracking-[0.04em] text-[color:var(--mustard)]">
                    Free email provider flagged for review
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {employer.verificationStatus === "pending_review" ||
                employer.verificationStatus === "rejected" ? (
                  <ActionButton
                    label="Approve"
                    variant="primary"
                    disabled={pendingId === employer.id}
                    onClick={() => void runAction(employer.id, "approve")}
                  />
                ) : null}
                {employer.verificationStatus !== "suspended" ? (
                  <ActionButton
                    label="Suspend"
                    variant="outline"
                    disabled={pendingId === employer.id}
                    onClick={() => void runAction(employer.id, "suspend")}
                  />
                ) : (
                  <ActionButton
                    label="Reinstate"
                    variant="primary"
                    disabled={pendingId === employer.id}
                    onClick={() => void runAction(employer.id, "reinstate")}
                  />
                )}
              </div>
            </div>

            {(employer.verificationStatus === "pending_review" ||
              employer.verificationStatus === "rejected") && (
              <div className="mt-5 flex flex-col gap-2 md:flex-row">
                <input
                  value={rejectionReasons[employer.id] ?? ""}
                  onChange={(event) =>
                    setRejectionReasons((current) => ({
                      ...current,
                      [employer.id]: event.target.value,
                    }))
                  }
                  placeholder="Rejection reason"
                  className="flex-1 rounded-[var(--radius)] border border-[color:var(--line-strong)] bg-[color:var(--paper)] px-3.5 py-2.5 text-sm text-[color:var(--ink)] outline-none focus:border-[color:var(--stamp)]"
                />
                <ActionButton
                  label="Reject"
                  variant="outline"
                  disabled={pendingId === employer.id}
                  onClick={() => void runAction(employer.id, "reject")}
                />
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  variant = "primary",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "outline";
}) {
  const base =
    "rounded-[var(--radius)] px-4 py-2.5 font-mono text-xs tracking-[0.05em] uppercase disabled:opacity-60";
  const styles =
    variant === "primary"
      ? "btn-primary text-white"
      : "border border-[color:var(--line-strong)] bg-transparent text-[color:var(--ink)] transition hover:border-[color:var(--ink)]";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${styles}`}
    >
      {label}
    </button>
  );
}
