"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApiRequestError,
  createCompany,
  verifyCompanyNumber,
  type CompaniesHousePreview,
} from "@/lib/api";

/**
 * Two-step employer onboarding: verify Companies House number, then your contact details.
 */
export function CompanyRegistrationForm() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [companyNumber, setCompanyNumber] = useState("");
  const [website, setWebsite] = useState("https://");
  const [businessEmail, setBusinessEmail] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterJobTitle, setRecruiterJobTitle] = useState("");
  const [preview, setPreview] = useState<CompaniesHousePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function withToken() {
    const token = await getToken();
    if (!token) throw new Error("Missing session token");
    return token;
  }

  return (
    <div className="space-y-6">
      <ol className="space-y-2 rounded-md border border-[color:var(--line)] bg-white/70 px-4 py-3 text-sm text-[color:var(--foreground)]/80">
        <li>
          <span className="font-semibold text-brand">1.</span> Look up your{" "}
          <strong>company</strong> with its Companies House number (legal name
          comes from Companies House — you don’t type it).
        </li>
        <li>
          <span className="font-semibold text-brand">2.</span> Add{" "}
          <strong>your</strong> contact details (the person hiring, not the
          company name again).
        </li>
        <li>
          <span className="font-semibold text-brand">3.</span> Submit — a Horizon{" "}
          <strong>admin reviews and approves</strong> you before you can post
          jobs.
        </li>
      </ol>

      <ol className="flex gap-2 text-xs font-semibold">
        <li
          className={`rounded-md px-2.5 py-1 ${
            step === 1
              ? "bg-brand text-white"
              : "bg-white text-brand ring-1 ring-[color:var(--line)]"
          }`}
        >
          1. Find company
        </li>
        <li
          className={`rounded-md px-2.5 py-1 ${
            step === 2
              ? "bg-brand text-white"
              : "bg-white text-brand ring-1 ring-[color:var(--line)]"
          }`}
        >
          2. Your details
        </li>
      </ol>

      <form
        className="space-y-4 rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void (async () => {
            setPending(true);
            setError(null);
            try {
              const token = await withToken();
              if (step === 1 || !preview) {
                const result = await verifyCompanyNumber(token, companyNumber);
                setPreview(result);
                setStep(2);
                setPending(false);
                return;
              }
              await createCompany(token, {
                companyNumber,
                website,
                businessEmail,
                recruiterName,
                recruiterJobTitle,
              });
              router.refresh();
            } catch (err) {
              setError(
                err instanceof ApiRequestError || err instanceof Error
                  ? err.message
                  : "Unable to submit company registration.",
              );
              setPending(false);
            }
          })();
        }}
      >
        {step === 1 ? (
          <>
            <div>
              <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
                Find your company
              </h2>
              <p className="mt-1 text-sm text-[color:var(--foreground)]/70">
                Enter the UK Companies House registration number. We’ll show the
                official company name next — that becomes your organisation on
                Horizon.
              </p>
            </div>
            <Field
              label="Companies House number"
              hint="8 digits, or 2 letters + 6 digits (e.g. 00000006). Not your company trading name."
              value={companyNumber}
              onChange={(value) => {
                setCompanyNumber(value.toUpperCase());
                setPreview(null);
                setStep(1);
              }}
              placeholder="00000006"
              required
            />
          </>
        ) : (
          <>
            <div>
              <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
                Your contact details
              </h2>
              <p className="mt-1 text-sm text-[color:var(--foreground)]/70">
                These are about <strong>you</strong> (the person registering),
                not the company name. When you submit, your registration goes to
                a Horizon admin for approval — you can’t post jobs until they
                approve you.
              </p>
            </div>
            {preview ? (
              <div className="rounded-md border border-[color:var(--line)] bg-white px-4 py-3 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-accent">
                  Company (from Companies House)
                </p>
                <p className="mt-1 font-semibold text-brand">
                  {preview.companyName}
                </p>
                <p className="text-[color:var(--foreground)]/65">
                  {preview.companyNumber}
                  {preview.companyStatus ? ` · ${preview.companyStatus}` : ""}
                </p>
                <button
                  type="button"
                  className="mt-2 text-sm font-semibold text-brand underline"
                  onClick={() => {
                    setStep(1);
                    setPreview(null);
                  }}
                >
                  Change company number
                </button>
              </div>
            ) : null}
            <Field
              label="Company website"
              hint="Your organisation’s public website (must start with https://)."
              value={website}
              onChange={setWebsite}
              placeholder="https://example.co.uk"
              required
            />
            <Field
              label="Work email"
              hint="Best as a company email (e.g. you@company.co.uk). Used for approval and hiring updates."
              type="email"
              value={businessEmail}
              onChange={setBusinessEmail}
              required
            />
            <Field
              label="Your full name"
              hint="The person hiring / registering this company — not the company name."
              value={recruiterName}
              onChange={setRecruiterName}
              placeholder="Alex Morgan"
              required
            />
            <Field
              label="Your job title"
              hint="Your role at the company (e.g. Hiring Manager, HR Lead)."
              value={recruiterJobTitle}
              onChange={setRecruiterJobTitle}
              placeholder="Hiring Manager"
              required
            />
          </>
        )}

        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending
            ? "Please wait…"
            : step === 1
              ? "Look up company"
              : "Submit for admin approval"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-brand">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
      />
      {hint ? (
        <span className="mt-1 block text-xs text-[color:var(--foreground)]/55">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
