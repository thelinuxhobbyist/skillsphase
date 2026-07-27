"use client";

import type { HorizonCompany } from "@/lib/api";

export function BusinessEmailVerificationPanel({
  company,
}: {
  company: HorizonCompany;
}) {
  if (company.businessEmailVerified) {
    return (
      <section className="rounded-md border border-emerald-200 bg-emerald-50 p-5">
        <p className="font-semibold text-emerald-900">Account active</p>
        <p className="mt-1 text-sm text-emerald-900/80">
          {company.businessEmail} is confirmed. You can discover and contact
          candidates.
        </p>
      </section>
    );
  }

  if (company.verificationStatus === "approved") {
    return (
      <section className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
        <h2 className="font-semibold text-primary">Activate your account</h2>
        <p className="mt-2 text-sm text-[color:var(--foreground)]/75">
          We sent an activation link to{" "}
          <strong className="text-primary">{company.businessEmail}</strong>. Open
          that email and click the link while signed in to activate your
          business account.
        </p>
        <p className="mt-3 text-xs text-[color:var(--foreground)]/55">
          Didn&apos;t receive it? Contact SkillsPhase support — activation emails are
          sent when an administrator approves your registration.
        </p>
      </section>
    );
  }

  if (company.verificationStatus === "pending_review") {
    return (
      <section className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
        <h2 className="font-semibold text-primary">Awaiting review</h2>
        <p className="mt-2 text-sm text-[color:var(--foreground)]/75">
          Your registration is with our team. Once approved, an activation link
          will be sent to {company.businessEmail}.
        </p>
      </section>
    );
  }

  return null;
}
