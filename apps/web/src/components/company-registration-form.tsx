"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { COMPANY_EMAIL_HINT, isCompanyEmailAllowed } from "@horizon/shared";
import {
  ApiRequestError,
  createCompany,
  verifyCompanyNumber,
  type CompaniesHousePreview,
} from "@/lib/api";

/**
 * Business onboarding: Companies House lookup → company email → contact details.
 */
export function CompanyRegistrationForm() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [companyNumber, setCompanyNumber] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [website, setWebsite] = useState("https://");
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
          <span className="font-semibold text-primary">1.</span> Look up your UK
          company with its Companies House number.
        </li>
        <li>
          <span className="font-semibold text-primary">2.</span> Add your{" "}
          <strong>company email</strong> — we&apos;ll send account activation to
          this address after admin review.
        </li>
        <li>
          <span className="font-semibold text-primary">3.</span> Add your contact
          details and submit for review.
        </li>
      </ol>

      <ol className="flex flex-wrap gap-2 text-xs font-semibold">
        <StepBadge active={step === 1} done={step > 1} label="1. Company" />
        <StepBadge active={step === 2} done={step > 2} label="2. Email" />
        <StepBadge active={step === 3} done={false} label="3. Details" />
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
              if (step === 1) {
                const result = await verifyCompanyNumber(token, companyNumber);
                setPreview(result);
                setStep(2);
                setPending(false);
                return;
              }
              if (step === 2) {
                if (!isCompanyEmailAllowed(businessEmail)) {
                  throw new Error(COMPANY_EMAIL_HINT);
                }
                setStep(3);
                setPending(false);
                return;
              }
              if (!preview) {
                throw new Error("Company lookup is required.");
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
              <h2 className="font-display text-2xl text-primary">
                Find your company
              </h2>
              <p className="mt-1 text-sm text-[color:var(--foreground)]/70">
                Enter the UK Companies House registration number. We&apos;ll show
                the official company name from Companies House.
              </p>
            </div>
            <Field
              label="Companies House number"
              hint="8 digits, or 2 letters + 6 digits (e.g. 00000006)."
              value={companyNumber}
              onChange={(value) => {
                setCompanyNumber(value.toUpperCase());
                setPreview(null);
                if (step > 1) setStep(1);
              }}
              placeholder="00000006"
              required
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div>
              <h2 className="font-display text-2xl text-primary">
                Company email
              </h2>
              <p className="mt-1 text-sm text-[color:var(--foreground)]/70">
                Use a company email address (e.g. hr@yourcompany.co.uk) — not
                Gmail, Outlook, or other personal providers. After an admin
                reviews your registration, we&apos;ll send an activation link to
                this inbox.
              </p>
            </div>
            {preview ? (
              <CompanyPreview
                preview={preview}
                onChangeCompany={() => {
                  setStep(1);
                  setPreview(null);
                }}
              />
            ) : null}
            <Field
              label="Company email"
              hint={COMPANY_EMAIL_HINT}
              type="email"
              value={businessEmail}
              onChange={setBusinessEmail}
              placeholder="hr@company.co.uk"
              required
            />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div>
              <h2 className="font-display text-2xl text-primary">
                Your contact details
              </h2>
              <p className="mt-1 text-sm text-[color:var(--foreground)]/70">
                About you — the person registering this company on SkillsPhase.
              </p>
            </div>
            {preview ? (
              <CompanyPreview
                preview={preview}
                onChangeCompany={() => {
                  setStep(1);
                  setPreview(null);
                }}
              />
            ) : null}
            <div className="rounded-md border border-[color:var(--line)] bg-white px-4 py-3 text-sm">
              <p className="text-xs font-medium text-primary-accent">
                Activation email will be sent to
              </p>
              <p className="mt-1 font-semibold text-primary">{businessEmail}</p>
              <button
                type="button"
                className="mt-2 text-sm font-semibold text-primary underline"
                onClick={() => setStep(2)}
              >
                Change company email
              </button>
            </div>
            <Field
              label="Company website"
              hint="Your organisation's public website (must start with https://)."
              value={website}
              onChange={setWebsite}
              placeholder="https://example.co.uk"
              required
            />
            <Field
              label="Your full name"
              value={recruiterName}
              onChange={setRecruiterName}
              placeholder="Alex Morgan"
              required
            />
            <Field
              label="Your job title"
              value={recruiterJobTitle}
              onChange={setRecruiterJobTitle}
              placeholder="Hiring Manager"
              required
            />
          </>
        ) : null}

        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {step > 1 ? (
            <button
              type="button"
              className="rounded-md border border-[color:var(--line)] bg-white px-5 py-2.5 text-sm font-semibold text-primary"
              onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
            >
              Back
            </button>
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
                : step === 2
                  ? "Continue"
                  : "Submit for review"}
          </button>
        </div>
      </form>
    </div>
  );
}

function StepBadge({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <li
      className={`rounded-md px-2.5 py-1 ${
        active
          ? "bg-brand text-white"
          : done
            ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200"
            : "bg-white text-primary ring-1 ring-[color:var(--line)]"
      }`}
    >
      {label}
    </li>
  );
}

function CompanyPreview({
  preview,
  onChangeCompany,
}: {
  preview: CompaniesHousePreview;
  onChangeCompany: () => void;
}) {
  return (
    <div className="rounded-md border border-[color:var(--line)] bg-white px-4 py-3 text-sm">
      <p className="text-xs font-medium text-primary-accent">
        Company (from Companies House)
      </p>
      <p className="mt-1 font-semibold text-primary">{preview.companyName}</p>
      <p className="text-[color:var(--foreground)]/65">
        {preview.companyNumber}
        {preview.companyStatus ? ` · ${preview.companyStatus}` : ""}
      </p>
      <button
        type="button"
        className="mt-2 text-sm font-semibold text-primary underline"
        onClick={onChangeCompany}
      >
        Change company number
      </button>
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
      <span className="font-medium text-primary">{label}</span>
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
