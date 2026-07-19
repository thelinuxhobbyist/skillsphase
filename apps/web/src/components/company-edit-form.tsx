"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ApiRequestError,
  updateMyCompany,
  type HorizonCompany,
} from "@/lib/api";

export function CompanyEditForm({ company }: { company: HorizonCompany }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [website, setWebsite] = useState(company.website);
  const [businessEmail, setBusinessEmail] = useState(company.businessEmail);
  const [recruiterName, setRecruiterName] = useState(company.recruiterName);
  const [recruiterJobTitle, setRecruiterJobTitle] = useState(
    company.recruiterJobTitle,
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const canEdit =
    company.verificationStatus === "rejected" ||
    company.verificationStatus === "pending_review" ||
    company.verificationStatus === "approved";

  if (!canEdit || company.verificationStatus === "suspended") {
    return null;
  }

  return (
    <form
      className="mt-6 space-y-3 rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void (async () => {
          setPending(true);
          setError(null);
          setMessage(null);
          try {
            const token = await getToken();
            if (!token) throw new Error("Missing session token");
            await updateMyCompany(token, {
              website,
              businessEmail,
              recruiterName,
              recruiterJobTitle,
            });
            setMessage("Company details saved.");
            router.refresh();
          } catch (err) {
            setError(
              err instanceof ApiRequestError || err instanceof Error
                ? err.message
                : "Unable to update company.",
            );
          } finally {
            setPending(false);
          }
        })();
      }}
    >
      <h3 className="font-semibold text-brand">Update company details</h3>
      <p className="text-sm text-[color:var(--foreground)]/70">
        Company number and legal name are fixed from Companies House. Update
        contact details before resubmitting if rejected.
      </p>
      <Field label="Website" value={website} onChange={setWebsite} required />
      <Field
        label="Business email"
        value={businessEmail}
        onChange={setBusinessEmail}
        required
      />
      <Field
        label="Recruiter name"
        value={recruiterName}
        onChange={setRecruiterName}
        required
      />
      <Field
        label="Recruiter job title"
        value={recruiterJobTitle}
        onChange={setRecruiterJobTitle}
        required
      />
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-brand" role="status">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        Save details
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-brand">{label}</span>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
      />
    </label>
  );
}
