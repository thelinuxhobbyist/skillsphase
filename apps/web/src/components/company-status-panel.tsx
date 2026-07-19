"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApiRequestError,
  resubmitCompany,
  type HorizonCompany,
} from "@/lib/api";

const STATUS_COPY: Record<
  HorizonCompany["verificationStatus"],
  { title: string; body: string }
> = {
  pending_review: {
    title: "Awaiting approval",
    body: "Your organisation is awaiting approval. We'll notify you once the review is complete.",
  },
  approved: {
    title: "Approved",
    body: "Your organisation is verified. Job posting will be available in the next phase.",
  },
  rejected: {
    title: "Not approved",
    body: "Update your details if needed, then resubmit for another review.",
  },
  suspended: {
    title: "Suspended",
    body: "Recruitment features are disabled while your account is suspended.",
  },
};

export function CompanyStatusPanel({ company }: { company: HorizonCompany }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const copy = STATUS_COPY[company.verificationStatus];

  return (
    <section className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
        Verification status
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-fraunces)] text-2xl text-brand">
        {copy.title}
      </h2>
      <p className="mt-2 text-[color:var(--foreground)]/75">{copy.body}</p>

      <dl className="mt-6 grid gap-3 text-sm md:grid-cols-2">
        <div>
          <dt className="font-semibold text-brand">Company</dt>
          <dd>{company.companyName}</dd>
        </div>
        <div>
          <dt className="font-semibold text-brand">Registration number</dt>
          <dd>{company.companyNumber}</dd>
        </div>
        <div>
          <dt className="font-semibold text-brand">Website</dt>
          <dd>{company.website}</dd>
        </div>
        <div>
          <dt className="font-semibold text-brand">Business email</dt>
          <dd>
            {company.businessEmail}
            {company.businessEmailIsFreeProvider
              ? " (free provider — flagged for review)"
              : ""}
          </dd>
        </div>
      </dl>

      {company.rejectionReason ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          Reason: {company.rejectionReason}
        </p>
      ) : null}

      {company.verificationStatus === "rejected" ? (
        <button
          type="button"
          disabled={pending}
          className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          onClick={() => {
            void (async () => {
              setPending(true);
              setError(null);
              try {
                const token = await getToken();
                if (!token) throw new Error("Missing session token");
                await resubmitCompany(token);
                router.refresh();
              } catch (err) {
                setError(
                  err instanceof ApiRequestError || err instanceof Error
                    ? err.message
                    : "Unable to resubmit.",
                );
                setPending(false);
              }
            })();
          }}
        >
          Resubmit for review
        </button>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
