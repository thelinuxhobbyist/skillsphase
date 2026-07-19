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

export function CompanyRegistrationForm() {
  const { getToken } = useAuth();
  const router = useRouter();
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
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void (async () => {
          setPending(true);
          setError(null);
          try {
            const token = await withToken();
            if (!preview) {
              const result = await verifyCompanyNumber(token, companyNumber);
              setPreview(result);
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
      <Field
        label="Companies House number"
        value={companyNumber}
        onChange={(value) => {
          setCompanyNumber(value.toUpperCase());
          setPreview(null);
        }}
        placeholder="00000006"
        required
      />
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

      {preview ? (
        <div className="rounded-md border border-[color:var(--line)] bg-white/70 p-4 text-sm">
          <p className="font-semibold text-brand">Confirm company</p>
          <p className="mt-2">{preview.companyName}</p>
          <p className="text-[color:var(--foreground)]/65">
            Status: {preview.companyStatus}
          </p>
          {!preview.valid ? (
            <p className="mt-2 text-red-700">
              Only active companies can register.
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || (preview !== null && !preview.valid)}
        className="rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {preview ? "Submit for approval" : "Validate with Companies House"}
      </button>
      <p className="text-sm text-[color:var(--foreground)]/65">
        Not a UK company?{" "}
        <a href="/waitlist" className="font-semibold text-brand underline">
          Join the waitlist
        </a>
        .
      </p>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-brand">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
      />
    </label>
  );
}
