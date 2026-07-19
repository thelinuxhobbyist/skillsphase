"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiRequestError, createJob, type AdminEmployer } from "@/lib/api";

export function AdminJobCreateForm({
  companies,
}: {
  companies: AdminEmployer[];
}) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [employmentType, setEmploymentType] = useState("full_time");
  const [remoteType, setRemoteType] = useState<"on_site" | "hybrid" | "remote">(
    "hybrid",
  );
  const [skills, setSkills] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (companies.length === 0) {
    return (
      <p className="text-[color:var(--foreground)]/70">
        No approved companies available. Approve an employer first.
      </p>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        void (async () => {
          setPending(true);
          setError(null);
          try {
            const token = await getToken();
            if (!token) throw new Error("Missing session token");
            await createJob(token, {
              companyId,
              title,
              description,
              location,
              industry,
              employmentType,
              remoteType,
              skillNames: skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              publish: true,
            });
            router.push("/admin/jobs");
            router.refresh();
          } catch (err) {
            setError(
              err instanceof ApiRequestError || err instanceof Error
                ? err.message
                : "Unable to create job.",
            );
            setPending(false);
          }
        })();
      }}
    >
      <label className="block text-sm">
        <span className="font-medium text-brand">Approved company</span>
        <select
          required
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
        >
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.companyName} ({company.companyNumber})
            </option>
          ))}
        </select>
      </label>
      <Field label="Title" value={title} onChange={setTitle} required />
      <label className="block text-sm">
        <span className="font-medium text-brand">Description</span>
        <textarea
          required
          rows={8}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
        />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Location" value={location} onChange={setLocation} required />
        <Field label="Industry" value={industry} onChange={setIndustry} required />
        <label className="block text-sm">
          <span className="font-medium text-brand">Employment type</span>
          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
          >
            <option value="full_time">Full time</option>
            <option value="part_time">Part time</option>
            <option value="contract">Contract</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-brand">Remote type</span>
          <select
            value={remoteType}
            onChange={(e) =>
              setRemoteType(e.target.value as "on_site" | "hybrid" | "remote")
            }
            className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
          >
            <option value="on_site">On-site</option>
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
          </select>
        </label>
        <Field
          label="Skills (comma-separated)"
          value={skills}
          onChange={setSkills}
        />
      </div>
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        Create & publish
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
