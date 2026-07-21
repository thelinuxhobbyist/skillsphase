"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiRequestError, createJob } from "@/lib/api";

export function JobCreateForm() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [employmentType, setEmploymentType] = useState("full_time");
  const [remoteType, setRemoteType] = useState<"on_site" | "hybrid" | "remote">(
    "hybrid",
  );
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function skillNames() {
    return skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function submit(publish: boolean) {
    setPending(true);
    setError(null);
    const names = skillNames();
    if (names.length < 3) {
      setError(
        "Add at least 3 required skills. Lead with abilities, not employment history.",
      );
      setPending(false);
      return;
    }
    try {
      const token = await getToken();
      if (!token) throw new Error("Missing session token");
      await createJob(token, {
        title,
        description,
        location,
        industry,
        employmentType,
        remoteType,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        salaryCurrency: "GBP",
        closingDate: closingDate || null,
        skillNames: names,
        publish,
      });
      router.push("/employer/jobs");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Unable to create job.",
      );
      setPending(false);
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit(false);
      }}
    >
      <Field label="Job title" value={title} onChange={setTitle} required />

      <label className="block text-sm">
        <span className="font-medium text-brand">
          Skills required (at least 3)
        </span>
        <p className="mt-1 text-[color:var(--foreground)]/70">
          List the abilities this role needs first. Project Horizon is
          skills-first — avoid long must-have employment timelines.
        </p>
        <input
          required
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="e.g. Stakeholder communication, Budgeting, Excel"
          className="mt-2 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
        />
        <p className="mt-1 text-xs text-[color:var(--foreground)]/60">
          Separate skills with commas.
        </p>
      </label>

      <label className="block text-sm">
        <span className="font-medium text-brand">About the role</span>
        <p className="mt-1 text-[color:var(--foreground)]/70">
          Context for the day-to-day work. Skills above do the heavy lifting for
          who should apply.
        </p>
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
              setRemoteType(e.target.value as "on_site" | "hybrid" | "remote")
            }
            className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
          >
            <option value="on_site">On-site</option>
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
          </select>
        </label>
        <Field label="Salary min (optional)" value={salaryMin} onChange={setSalaryMin} />
        <Field label="Salary max (optional)" value={salaryMax} onChange={setSalaryMax} />
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

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-brand disabled:opacity-60"
        >
          Save draft
        </button>
        <button
          type="button"
          disabled={pending}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          onClick={() => void submit(true)}
        >
          Publish
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-brand">{label}</span>
      <input
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
      />
    </label>
  );
}
