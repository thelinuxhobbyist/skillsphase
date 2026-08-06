"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  EMPLOYMENT_TYPES,
  EMPLOYMENT_TYPE_LABELS,
  REMOTE_TYPES,
  REMOTE_TYPE_LABELS,
  type EmploymentType,
  type RemoteType,
} from "@horizon/shared";
import {
  ApiRequestError,
  createEmployerJob,
  updateEmployerJob,
  type EmployerJobDetail,
} from "@/lib/api";

type JobFormState = {
  title: string;
  description: string;
  location: string;
  remoteType: RemoteType;
  employmentType: EmploymentType;
  industry: string;
  salaryMin: string;
  salaryMax: string;
  closingDate: string;
  skillNames: string;
  publish: boolean;
};

function toState(job?: EmployerJobDetail | null): JobFormState {
  return {
    title: job?.title ?? "",
    description: job?.description ?? "",
    location: job?.location ?? "",
    remoteType: (job?.remoteType as RemoteType) ?? "hybrid",
    employmentType: (job?.employmentType as EmploymentType) ?? "full_time",
    industry: job?.industry ?? "",
    salaryMin: job?.salaryMin ?? "",
    salaryMax: job?.salaryMax ?? "",
    closingDate: job?.closingDate ?? "",
    skillNames: job?.skills?.join(", ") ?? "",
    publish: job?.status === "published",
  };
}

export function EmployerJobForm({
  mode,
  jobId,
  initial,
}: {
  mode: "create" | "edit";
  jobId?: number;
  initial?: EmployerJobDetail | null;
}) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<JobFormState>(() => toState(initial));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function update<K extends keyof JobFormState>(key: K, value: JobFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        setError("Please sign in again.");
        return;
      }
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        remoteType: form.remoteType,
        employmentType: form.employmentType,
        industry: form.industry.trim(),
        salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
        closingDate: form.closingDate || null,
        skillNames: form.skillNames
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (mode === "create") {
        const created = await createEmployerJob(token, {
          ...payload,
          publish: form.publish,
        });
        router.push(`/employer/jobs/${created.id}/edit`);
        router.refresh();
        return;
      }

      if (!jobId) {
        setError("Missing job id.");
        return;
      }
      await updateEmployerJob(token, jobId, {
        ...payload,
        status: form.publish ? "published" : "draft",
      });
      router.push("/employer/jobs");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Unable to save this job.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field label="Job title">
        <input
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="w-full rounded-md border border-[color:var(--line)] px-3 py-2 text-sm"
        />
      </Field>
      <Field label="Description">
        <textarea
          required
          rows={10}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full rounded-md border border-[color:var(--line)] px-3 py-2 text-sm"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Location">
          <input
            required
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            className="w-full rounded-md border border-[color:var(--line)] px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Industry">
          <input
            required
            value={form.industry}
            onChange={(e) => update("industry", e.target.value)}
            className="w-full rounded-md border border-[color:var(--line)] px-3 py-2 text-sm"
            placeholder="Education, Healthcare, Construction…"
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Remote type">
          <select
            value={form.remoteType}
            onChange={(e) => update("remoteType", e.target.value as RemoteType)}
            className="w-full rounded-md border border-[color:var(--line)] px-3 py-2 text-sm"
          >
            {REMOTE_TYPES.map((value) => (
              <option key={value} value={value}>
                {REMOTE_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Employment type">
          <select
            value={form.employmentType}
            onChange={(e) =>
              update("employmentType", e.target.value as EmploymentType)
            }
            className="w-full rounded-md border border-[color:var(--line)] px-3 py-2 text-sm"
          >
            {EMPLOYMENT_TYPES.map((value) => (
              <option key={value} value={value}>
                {EMPLOYMENT_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Salary min">
          <input
            type="number"
            min={0}
            value={form.salaryMin}
            onChange={(e) => update("salaryMin", e.target.value)}
            className="w-full rounded-md border border-[color:var(--line)] px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Salary max">
          <input
            type="number"
            min={0}
            value={form.salaryMax}
            onChange={(e) => update("salaryMax", e.target.value)}
            className="w-full rounded-md border border-[color:var(--line)] px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Closing date">
          <input
            type="date"
            value={form.closingDate}
            onChange={(e) => update("closingDate", e.target.value)}
            className="w-full rounded-md border border-[color:var(--line)] px-3 py-2 text-sm"
          />
        </Field>
      </div>
      <Field label="Skills (comma-separated)">
        <input
          value={form.skillNames}
          onChange={(e) => update("skillNames", e.target.value)}
          className="w-full rounded-md border border-[color:var(--line)] px-3 py-2 text-sm"
          placeholder="Lesson planning, Classroom leadership…"
        />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.publish}
          onChange={(e) => update("publish", e.target.checked)}
        />
        Publish this role (candidates can find and apply)
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="btn-primary rounded-md px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
      >
        {busy ? "Saving…" : mode === "create" ? "Create job" : "Save changes"}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-[color:var(--ink)]">
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
