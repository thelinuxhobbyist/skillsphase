"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiRequestError, updateJob, type HorizonJob } from "@/lib/api";

export function JobEditForm({ job }: { job: HorizonJob }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState(job.title);
  const [skills, setSkills] = useState(job.skills.map((s) => s.name).join(", "));
  const [description, setDescription] = useState(job.description);
  const [location, setLocation] = useState(job.location);
  const [industry, setIndustry] = useState(job.industry);
  const [employmentType, setEmploymentType] = useState(job.employmentType);
  const [remoteType, setRemoteType] = useState(job.remoteType);
  const [salaryMin, setSalaryMin] = useState(
    job.salaryMin != null ? String(job.salaryMin) : "",
  );
  const [salaryMax, setSalaryMax] = useState(
    job.salaryMax != null ? String(job.salaryMax) : "",
  );
  const [closingDate, setClosingDate] = useState(job.closingDate ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void (async () => {
          setPending(true);
          setError(null);
          const skillNames = skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          if (skillNames.length < 3) {
            setError(
              "Keep at least 3 required skills. Lead with abilities this role needs.",
            );
            setPending(false);
            return;
          }
          try {
            const token = await getToken();
            if (!token) throw new Error("Missing session token");
            await updateJob(token, job.id, {
              title,
              description,
              location,
              industry,
              employmentType,
              remoteType,
              salaryMin: salaryMin ? Number(salaryMin) : null,
              salaryMax: salaryMax ? Number(salaryMax) : null,
              closingDate: closingDate || null,
              skillNames,
            });
            router.push("/employer/jobs");
            router.refresh();
          } catch (err) {
            setError(
              err instanceof ApiRequestError || err instanceof Error
                ? err.message
                : "Unable to update job.",
            );
            setPending(false);
          }
        })();
      }}
    >
      <Field label="Job title" value={title} onChange={setTitle} required />

      <label className="block text-sm">
        <span className="font-medium text-brand">
          Skills required (at least 3)
        </span>
        <p className="mt-1 text-[color:var(--foreground)]/70">
          List the abilities this role needs first.
        </p>
        <input
          required
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="mt-2 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
        />
        <p className="mt-1 text-xs text-[color:var(--foreground)]/60">
          Separate skills with commas.
        </p>
      </label>

      <label className="block text-sm">
        <span className="font-medium text-brand">About the role</span>
        <textarea
          required
          rows={8}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-2 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
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
            <option value="temporary">Temporary</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-brand">Remote type</span>
          <select
            value={remoteType}
            onChange={(e) =>
              setRemoteType(e.target.value as HorizonJob["remoteType"])
            }
            className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
          >
            <option value="on_site">On-site</option>
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
          </select>
        </label>
        <Field label="Salary min" value={salaryMin} onChange={setSalaryMin} />
        <Field label="Salary max" value={salaryMax} onChange={setSalaryMax} />
        <Field
          label="Closing date (YYYY-MM-DD)"
          value={closingDate}
          onChange={setClosingDate}
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
        Save changes
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
