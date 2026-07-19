"use client";

import { useAuth } from "@clerk/nextjs";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApiRequestError,
  addEducation,
  addEmployment,
  addQualification,
  deleteEducation,
  deleteEmployment,
  deleteQualification,
  setSkillsByName,
  updateCurrentUser,
  uploadCv,
  type ProfileBundle,
} from "@/lib/api";

type ProfileEditorProps = {
  initial: ProfileBundle;
};

export function ProfileEditor({ initial }: ProfileEditorProps) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState(initial.user);
  const [employment, setEmployment] = useState(initial.employmentHistory);
  const [education, setEducation] = useState(initial.education);
  const [qualifications, setQualifications] = useState(initial.qualifications);
  const [skills, setSkills] = useState(initial.skills.map((s) => s.name).join(", "));
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const missing = useMemo(() => {
    const gaps: string[] = [];
    if (!user.firstName || !user.lastName) gaps.push("Name");
    if (!user.email) gaps.push("Email");
    if (!user.city || !user.country) gaps.push("Location");
    if (!user.careerSummary) gaps.push("Career summary");
    if (initial.skills.length < 1 && !skills.trim()) gaps.push("Skills");
    if (!user.cvUrl) gaps.push("CV");
    return gaps;
  }, [user, initial.skills.length, skills]);

  async function token() {
    const value = await getToken();
    if (!value) throw new Error("Missing session token");
    return value;
  }

  return (
    <div className="space-y-10">
      <section className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
        <h2 className="font-semibold text-brand">Completion</h2>
        <p className="mt-2 text-sm text-[color:var(--foreground)]/75">
          {user.profileCompleted
            ? "Your profile is complete enough to apply for jobs."
            : `Still needed: ${missing.join(", ") || "save your updates"}`}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
          Basics
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <TextField
            label="First name"
            value={user.firstName ?? ""}
            onChange={(firstName) => setUser((u) => ({ ...u, firstName }))}
          />
          <TextField
            label="Last name"
            value={user.lastName ?? ""}
            onChange={(lastName) => setUser((u) => ({ ...u, lastName }))}
          />
          <TextField
            label="City"
            value={user.city ?? ""}
            onChange={(city) => setUser((u) => ({ ...u, city }))}
          />
          <TextField
            label="Country"
            value={user.country ?? ""}
            onChange={(country) => setUser((u) => ({ ...u, country }))}
          />
        </div>
        <TextArea
          label="Career summary"
          value={user.careerSummary ?? ""}
          onChange={(careerSummary) => setUser((u) => ({ ...u, careerSummary }))}
        />
        <TextArea
          label="Career gap narrative (optional)"
          value={user.careerGapNarrative ?? ""}
          onChange={(careerGapNarrative) =>
            setUser((u) => ({ ...u, careerGapNarrative }))
          }
        />
        <TextArea
          label="Cover letter template (optional)"
          value={user.coverLetterTemplate ?? ""}
          onChange={(coverLetterTemplate) =>
            setUser((u) => ({ ...u, coverLetterTemplate }))
          }
        />
        <button
          type="button"
          disabled={pending}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          onClick={() => {
            void (async () => {
              setPending(true);
              setError(null);
              setMessage(null);
              try {
                const updated = await updateCurrentUser(await token(), {
                  firstName: user.firstName,
                  lastName: user.lastName,
                  city: user.city,
                  country: user.country,
                  careerSummary: user.careerSummary,
                  careerGapNarrative: user.careerGapNarrative,
                  coverLetterTemplate: user.coverLetterTemplate,
                });
                setUser(updated);
                setMessage("Profile details saved.");
                router.refresh();
              } catch (err) {
                setError(messageFrom(err));
              } finally {
                setPending(false);
              }
            })();
          }}
        >
          Save basics
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
          Skills
        </h2>
        <TextField
          label="Skills (comma-separated)"
          value={skills}
          onChange={setSkills}
          placeholder="Project Management, Excel, Customer Service"
        />
        <button
          type="button"
          disabled={pending}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          onClick={() => {
            void (async () => {
              setPending(true);
              setError(null);
              try {
                const names = skills
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                const rows = await setSkillsByName(await token(), names);
                setSkills(rows.map((r) => r.name).join(", "));
                setMessage("Skills saved.");
                router.refresh();
              } catch (err) {
                setError(messageFrom(err));
              } finally {
                setPending(false);
              }
            })();
          }}
        >
          Save skills
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
          CV
        </h2>
        <p className="text-sm text-[color:var(--foreground)]/70">
          Current: {user.cvFileName ?? "No CV uploaded"} ({user.cvUrl ? "on file" : "missing"})
        </p>
        <input
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            void (async () => {
              setPending(true);
              setError(null);
              try {
                const result = await uploadCv(await token(), file);
                setUser(result.user);
                setMessage(`CV uploaded (${result.upload.storage}).`);
                router.refresh();
              } catch (err) {
                setError(messageFrom(err));
              } finally {
                setPending(false);
              }
            })();
          }}
        />
      </section>

      <ListSection
        title="Employment history"
        items={employment.map((row) => ({
          id: row.id,
          label: `${row.jobTitle} at ${row.employerName}`,
        }))}
        onDelete={(id) => {
          void (async () => {
            await deleteEmployment(await token(), id);
            setEmployment((rows) => rows.filter((row) => row.id !== id));
          })().catch((err) => setError(messageFrom(err)));
        }}
        onAdd={async (values) => {
          const row = await addEmployment(await token(), {
            employerName: values.a,
            jobTitle: values.b,
            startDate: values.start,
            endDate: values.end || null,
            currentlyWorking: !values.end,
            description: values.notes || null,
          });
          setEmployment((rows) => [...rows, row]);
        }}
        fields={{
          a: "Employer",
          b: "Job title",
          start: "Start date (YYYY-MM-DD)",
          end: "End date (optional)",
          notes: "Description",
        }}
      />

      <ListSection
        title="Education"
        items={education.map((row) => ({
          id: row.id,
          label: `${row.qualification} — ${row.institution}`,
        }))}
        onDelete={(id) => {
          void (async () => {
            await deleteEducation(await token(), id);
            setEducation((rows) => rows.filter((row) => row.id !== id));
          })().catch((err) => setError(messageFrom(err)));
        }}
        onAdd={async (values) => {
          const row = await addEducation(await token(), {
            institution: values.a,
            qualification: values.b,
            startDate: values.start,
            endDate: values.end || null,
            description: values.notes || null,
          });
          setEducation((rows) => [...rows, row]);
        }}
        fields={{
          a: "Institution",
          b: "Qualification",
          start: "Start date (YYYY-MM-DD)",
          end: "End date (optional)",
          notes: "Description",
        }}
      />

      <ListSection
        title="Qualifications"
        items={qualifications.map((row) => ({
          id: row.id,
          label: row.name,
        }))}
        onDelete={(id) => {
          void (async () => {
            await deleteQualification(await token(), id);
            setQualifications((rows) => rows.filter((row) => row.id !== id));
          })().catch((err) => setError(messageFrom(err)));
        }}
        onAdd={async (values) => {
          const row = await addQualification(await token(), {
            name: values.a,
            issuingBody: values.b || null,
            dateAwarded: values.start || null,
            description: values.notes || null,
          });
          setQualifications((rows) => [...rows, row]);
        }}
        fields={{
          a: "Name",
          b: "Issuing body",
          start: "Date awarded (YYYY-MM-DD)",
          end: "",
          notes: "Description",
        }}
      />

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-sm text-brand">{message}</p> : null}
    </div>
  );
}

function messageFrom(err: unknown) {
  return err instanceof ApiRequestError || err instanceof Error
    ? err.message
    : "Something went wrong.";
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-brand">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
      />
    </label>
  );
}

function TextArea({
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
      <textarea
        value={value}
        rows={4}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
      />
    </label>
  );
}

function ListSection({
  title,
  items,
  fields,
  onAdd,
  onDelete,
}: {
  title: string;
  items: Array<{ id: string; label: string }>;
  fields: { a: string; b: string; start: string; end: string; notes: string };
  onAdd: (values: {
    a: string;
    b: string;
    start: string;
    end: string;
    notes: string;
  }) => Promise<void>;
  onDelete: (id: string) => void;
}) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <section className="space-y-3">
      <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
        {title}
      </h2>
      <ul className="space-y-2 text-sm">
        {items.length === 0 ? (
          <li className="text-[color:var(--foreground)]/60">None added yet.</li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-md border border-[color:var(--line)] bg-white/70 px-3 py-2"
            >
              <span>{item.label}</span>
              <button
                type="button"
                className="text-red-700 underline"
                onClick={() => onDelete(item.id)}
              >
                Remove
              </button>
            </li>
          ))
        )}
      </ul>
      <div className="grid gap-2 md:grid-cols-2">
        <TextField label={fields.a} value={a} onChange={setA} />
        <TextField label={fields.b} value={b} onChange={setB} />
        {fields.start ? (
          <TextField label={fields.start} value={start} onChange={setStart} />
        ) : null}
        {fields.end ? (
          <TextField label={fields.end} value={end} onChange={setEnd} />
        ) : null}
      </div>
      {fields.notes ? (
        <TextArea label={fields.notes} value={notes} onChange={setNotes} />
      ) : null}
      <button
        type="button"
        disabled={
          pending || !a || !b || (fields.start.startsWith("Start date") && !start)
        }
        className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        onClick={() => {
          void (async () => {
            setPending(true);
            try {
              await onAdd({ a, b, start, end, notes });
              setA("");
              setB("");
              setStart("");
              setEnd("");
              setNotes("");
            } finally {
              setPending(false);
            }
          })();
        }}
      >
        Add
      </button>
    </section>
  );
}
