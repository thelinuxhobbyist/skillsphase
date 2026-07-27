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
    title: "Waiting for admin review",
    body: "We've received your registration. A SkillsPhase administrator will review your company details. Once approved, an activation link will be sent to your company email.",
  },
  approved: {
    title: "Review complete — activate your account",
    body: "Your registration passed review. Check your company email and click the activation link to start discovering and contacting candidates.",
  },
  rejected: {
    title: "Not approved",
    body: "An admin declined this registration. Update your contact details if needed, then resubmit for another review.",
  },
  suspended: {
    title: "Suspended",
    body: "An admin has suspended this account. Contacting candidates is disabled until reinstated.",
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
      <p className="text-sm font-medium text-primary">
        Verification status
      </p>
      <h2 className="mt-2 font-sans text-2xl text-primary">
        {copy.title}
      </h2>
      <p className="mt-2 text-[color:var(--foreground)]/75">{copy.body}</p>

      <dl className="mt-6 grid gap-3 text-sm md:grid-cols-2">
        <div>
          <dt className="font-semibold text-primary">Company</dt>
          <dd>{company.companyName}</dd>
        </div>
        <div>
          <dt className="font-semibold text-primary">Registration number</dt>
          <dd>{company.companyNumber}</dd>
        </div>
        <div>
          <dt className="font-semibold text-primary">Registered contact</dt>
          <dd>
            {company.recruiterName}
            {company.recruiterJobTitle ? ` · ${company.recruiterJobTitle}` : ""}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-primary">Website</dt>
          <dd>{company.website}</dd>
        </div>
        <div>
          <dt className="font-semibold text-primary">Work email</dt>
          <dd>
            {company.businessEmail}
            {company.businessEmailIsFreeProvider
              ? " (personal/free email — flagged for review)"
              : ""}
          </dd>
        </div>
      </dl>

      <div className="mt-6 rounded-md border border-[color:var(--line)] bg-white p-4">
        <p className="text-sm font-semibold text-primary">Trust status</p>
        <ul className="mt-2 space-y-1 text-sm text-[color:var(--foreground)]/80">
          <li>
            {company.companiesHouseVerified ? "✓" : "·"} Active company record
            (Companies House)
          </li>
          <li>
            {company.businessEmailVerified ? "✓" : "·"} Verified business email
          </li>
        </ul>
        {company.companiesHouseVerified && company.businessEmailVerified ? (
          <p className="mt-2 text-sm font-semibold text-emerald-800">
            Account active
          </p>
        ) : company.verificationStatus === "approved" ? (
          <p className="mt-2 text-sm font-semibold text-primary-accent">
            Activation email sent — check {company.businessEmail}
          </p>
        ) : null}
      </div>

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
