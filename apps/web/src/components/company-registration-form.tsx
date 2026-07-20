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
 * Two-step employer onboarding: verify Companies House number, then confirm details.
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
      <ol className="flex gap-2 text-xs font-semibold">
        <li
          className={`rounded-md px-2.5 py-1 ${
            step === 1 ? "bg-brand text-white" : "bg-white text-brand ring-1 ring-[color:var(--line)]"
          }`}
        >
          1. Verify company
        </li>
        <li
          className={`rounded-md px-2.5 py-1 ${
            step === 2 ? "bg-brand text-white" : "bg-white text-brand ring-1 ring-[color:var(--line)]"
          }`}
        >
          2. Contact details
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
                Verify your company
              </h2>
              <p className="mt-1 text-sm text-[color:var(--foreground)]/70">
                Enter your UK Companies House number. We’ll confirm the legal
                name before you continue.
              </p>
            </div>
            <Field
              label="Companies House number"
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
                Contact details
              </h2>
              <p className="mt-1 text-sm text-[color:var(--foreground)]/70">
                One submission sends your company for review — no extra save
                buttons.
              </p>
            </div>
            {preview ? (
              <div className="rounded-md border border-[color:var(--line)] bg-white px-4 py-3 text-sm">
                <p className="font-semibold text-brand">{preview.companyName}</p>
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
              value={website}
              onChange={setWebsite}
              placeholder="https://example.co.uk"
              required
            />
            <Field
              label="Business email"
              type="email"
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
              ? "Continue"
              : "Submit for review"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
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
    </label>
  );
}
