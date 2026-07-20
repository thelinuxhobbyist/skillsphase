"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const skipFirst = useRef(true);

  const canEdit =
    company.verificationStatus === "rejected" ||
    company.verificationStatus === "pending_review" ||
    company.verificationStatus === "approved";

  useEffect(() => {
    if (!canEdit || company.verificationStatus === "suspended") return;
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const handle = window.setTimeout(() => {
      void (async () => {
        setSaveState("saving");
        setError(null);
        try {
          const token = await getToken();
          if (!token) throw new Error("Missing session token");
          await updateMyCompany(token, {
            website,
            businessEmail,
            recruiterName,
            recruiterJobTitle,
          });
          setSaveState("saved");
          router.refresh();
        } catch (err) {
          setSaveState("error");
          setError(
            err instanceof ApiRequestError || err instanceof Error
              ? err.message
              : "Unable to update company.",
          );
        }
      })();
    }, 700);
    return () => window.clearTimeout(handle);
  }, [
    website,
    businessEmail,
    recruiterName,
    recruiterJobTitle,
    canEdit,
    company.verificationStatus,
    getToken,
    router,
  ]);

  if (!canEdit || company.verificationStatus === "suspended") {
    return null;
  }

  return (
    <div className="mt-6 space-y-3 rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="font-semibold text-brand">Company contact details</h3>
          <p className="text-sm text-[color:var(--foreground)]/70">
            Company number and legal name stay fixed from Companies House.
            Changes save automatically.
          </p>
        </div>
        <p className="text-xs font-medium text-[color:var(--foreground)]/60" aria-live="polite">
          {saveState === "saving"
            ? "Saving…"
            : saveState === "saved"
              ? "Saved"
              : saveState === "error"
                ? "Save failed"
                : "Autosave on"}
        </p>
      </div>
      <Field label="Website" value={website} onChange={setWebsite} />
      <Field
        label="Business email"
        value={businessEmail}
        onChange={setBusinessEmail}
      />
      <Field
        label="Recruiter name"
        value={recruiterName}
        onChange={setRecruiterName}
      />
      <Field
        label="Recruiter job title"
        value={recruiterJobTitle}
        onChange={setRecruiterJobTitle}
      />
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-brand">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
      />
    </label>
  );
}
