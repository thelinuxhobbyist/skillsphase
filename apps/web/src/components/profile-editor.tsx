"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ApiRequestError,
  addEducation,
  addEmployment,
  addQualification,
  deleteCv,
  deleteEducation,
  deleteEmployment,
  deleteQualification,
  searchSkills,
  setSkillsByName,
  updateCurrentUser,
  updateEducation,
  updateEmployment,
  updateQualification,
  uploadCv,
  type HorizonUser,
  type ProfileBundle,
} from "@/lib/api";
import { formatUkDateLabel, isoToUk, normaliseUkDateInput, ukToIso } from "@/lib/dates";
import { SKILL_SUGGESTIONS } from "@/lib/skill-suggestions";

type StepId =
  | "about"
  | "summary"
  | "skills"
  | "cv"
  | "employment"
  | "education"
  | "review";

const STEPS: Array<{ id: StepId; label: string }> = [
  { id: "about", label: "About you" },
  { id: "summary", label: "Summary" },
  { id: "skills", label: "Skills" },
  { id: "cv", label: "CV" },
  { id: "employment", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "review", label: "Review" },
];

import { isClerkConfigured } from "@/lib/clerk-config";

export function ProfileEditor({ initial }: { initial: ProfileBundle }) {
  if (!isClerkConfigured()) {
    return (
      <div className="p-6 text-center text-[color:var(--foreground)]/70">
        Clerk authentication is not configured.
      </div>
    );
  }
  return <ConfiguredProfileEditor initial={initial} />;
}

function ConfiguredProfileEditor({ initial }: { initial: ProfileBundle }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<StepId>(() => firstIncompleteStep(initial));
  const [user, setUser] = useState(initial.user);
  const [skillList, setSkillList] = useState(initial.skills.map((s) => s.name));
  const [employment, setEmployment] = useState(initial.employmentHistory);
  const [education, setEducation] = useState(initial.education);
  const [qualifications, setQualifications] = useState(initial.qualifications);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [cvProgress, setCvProgress] = useState<number | null>(null);

  const userRef = useRef(user);
  userRef.current = user;
  const skillListRef = useRef(skillList);
  skillListRef.current = skillList;

  const sections = useMemo(
    () =>
      buildSectionStatus({
        user,
        skillCount: skillList.length,
        employmentCount: employment.length,
        educationCount: education.length + qualifications.length,
      }),
    [user, skillList.length, employment.length, education.length, qualifications.length],
  );

  const token = useCallback(async () => {
    const value = await getToken();
    if (!value) throw new Error("Missing session token");
    return value;
  }, [getToken]);

  useDebouncedEffect(
    () => {
      void (async () => {
        const snapshot = userRef.current;
        setSaveState("saving");
        setError(null);
        try {
          const updated = await updateCurrentUser(await token(), {
            firstName: snapshot.firstName,
            lastName: snapshot.lastName,
            city: snapshot.city,
            country: snapshot.country || "United Kingdom",
            careerSummary: snapshot.careerSummary,
            careerGapNarrative: snapshot.careerGapNarrative,
          });
          setUser(updated);
          setSaveState("saved");
          router.refresh();
        } catch (err) {
          setSaveState("error");
          setError(messageFrom(err));
        }
      })();
    },
    [
      user.firstName,
      user.lastName,
      user.city,
      user.country,
      user.careerSummary,
      user.careerGapNarrative,
      token,
      router,
    ],
    700,
  );

  useDebouncedEffect(
    () => {
      void (async () => {
        const names = skillListRef.current;
        setSaveState("saving");
        setError(null);
        try {
          const rows = await setSkillsByName(await token(), names);
          setSkillList(rows.map((r) => r.name));
          setSaveState("saved");
          router.refresh();
        } catch (err) {
          setSaveState("error");
          setError(messageFrom(err));
        }
      })();
    },
    [skillList.join("\u0001"), token, router],
    700,
  );

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="space-y-8">
      <ProfileProgress sections={sections} complete={user.profileCompleted} />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-[color:var(--foreground)]/65" aria-live="polite">
          {saveState === "saving"
            ? "Saving…"
            : saveState === "saved"
              ? "All changes saved"
              : saveState === "error"
                ? "Couldn’t save — check the message below"
                : "Changes save automatically"}
        </p>
        <ol className="flex flex-wrap gap-2" aria-label="Profile steps">
          {STEPS.map((item, index) => (
            <li key={item.id}>
              <span
                className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${
                  item.id === step
                    ? "bg-brand text-white"
                    : "bg-white/80 text-brand/70 ring-1 ring-[color:var(--line)]"
                }`}
              >
                {index + 1}. {item.label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <div className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5 md:p-7">
        {step === "about" ? (
          <AboutStep user={user} setUser={setUser} />
        ) : null}
        {step === "summary" ? (
          <SummaryStep user={user} setUser={setUser} />
        ) : null}
        {step === "skills" ? (
          <SkillsStep skills={skillList} onChange={setSkillList} token={token} />
        ) : null}
        {step === "cv" ? (
          <CvStep
            user={user}
            progress={cvProgress}
            onUpload={async (file) => {
              setError(null);
              setCvProgress(10);
              try {
                setCvProgress(55);
                const result = await uploadCv(await token(), file);
                setUser(result.user);
                setCvProgress(100);
                setSaveState("saved");
                router.refresh();
              } catch (err) {
                setError(messageFrom(err));
                setSaveState("error");
              } finally {
                window.setTimeout(() => setCvProgress(null), 600);
              }
            }}
            onRemove={async () => {
              setError(null);
              try {
                const result = await deleteCv(await token());
                setUser(result.user);
                setSaveState("saved");
                router.refresh();
              } catch (err) {
                setError(messageFrom(err));
              }
            }}
          />
        ) : null}
        {step === "employment" ? (
          <EmploymentStep
            items={employment}
            onSave={async (body, id) => {
              setError(null);
              try {
                if (id) {
                  const row = await updateEmployment(await token(), id, body);
                  setEmployment((rows) =>
                    rows.map((item) => (item.id === id ? row : item)),
                  );
                } else {
                  const row = await addEmployment(await token(), body);
                  setEmployment((rows) => [...rows, row]);
                }
                router.refresh();
              } catch (err) {
                setError(messageFrom(err));
                throw err;
              }
            }}
            onDelete={async (id) => {
              setError(null);
              try {
                await deleteEmployment(await token(), id);
                setEmployment((rows) => rows.filter((row) => row.id !== id));
                router.refresh();
              } catch (err) {
                setError(messageFrom(err));
              }
            }}
          />
        ) : null}
        {step === "education" ? (
          <EducationStep
            education={education}
            qualifications={qualifications}
            onSaveEducation={async (body, id) => {
              setError(null);
              try {
                if (id) {
                  const row = await updateEducation(await token(), id, body);
                  setEducation((rows) =>
                    rows.map((item) => (item.id === id ? row : item)),
                  );
                } else {
                  const row = await addEducation(await token(), body);
                  setEducation((rows) => [...rows, row]);
                }
                router.refresh();
              } catch (err) {
                setError(messageFrom(err));
                throw err;
              }
            }}
            onDeleteEducation={async (id) => {
              try {
                await deleteEducation(await token(), id);
                setEducation((rows) => rows.filter((row) => row.id !== id));
                router.refresh();
              } catch (err) {
                setError(messageFrom(err));
              }
            }}
            onSaveQualification={async (body, id) => {
              setError(null);
              try {
                if (id) {
                  const row = await updateQualification(await token(), id, body);
                  setQualifications((rows) =>
                    rows.map((item) => (item.id === id ? row : item)),
                  );
                } else {
                  const row = await addQualification(await token(), body);
                  setQualifications((rows) => [...rows, row]);
                }
                router.refresh();
              } catch (err) {
                setError(messageFrom(err));
                throw err;
              }
            }}
            onDeleteQualification={async (id) => {
              try {
                await deleteQualification(await token(), id);
                setQualifications((rows) => rows.filter((row) => row.id !== id));
                router.refresh();
              } catch (err) {
                setError(messageFrom(err));
              }
            }}
          />
        ) : null}
        {step === "review" ? (
          <ReviewStep
            user={user}
            sections={sections}
            skillCount={skillList.length}
            employmentCount={employment.length}
            educationCount={education.length + qualifications.length}
            onEditSection={setStep}
          />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={stepIndex <= 0}
          className="rounded-md border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-brand disabled:opacity-40"
          onClick={() => setStep(STEPS[Math.max(0, stepIndex - 1)]!.id)}
        >
          Back
        </button>
        {step === "review" ? (
          <Link
            href="/jobs"
            className="btn-primary rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white"
          >
            {user.profileCompleted ? "Browse jobs" : "Continue browsing jobs"}
          </Link>
        ) : (
          <button
            type="button"
            className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white"
            onClick={() =>
              setStep(STEPS[Math.min(STEPS.length - 1, stepIndex + 1)]!.id)
            }
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

function firstIncompleteStep(initial: ProfileBundle): StepId {
  const u = initial.user;
  if (!u.firstName || !u.lastName || !u.city) return "about";
  if (!u.careerSummary) return "summary";
  if (initial.skills.length < 1) return "skills";
  if (!u.cvUrl) return "cv";
  if (initial.employmentHistory.length < 1) return "employment";
  return "review";
}

type SectionStatus = {
  id: string;
  label: string;
  done: boolean;
  optional?: boolean;
};

function buildSectionStatus(input: {
  user: HorizonUser;
  skillCount: number;
  employmentCount: number;
  educationCount: number;
}): SectionStatus[] {
  const u = input.user;
  return [
    {
      id: "about",
      label: "About you",
      done: Boolean(u.firstName?.trim() && u.lastName?.trim() && u.city?.trim() && u.country?.trim()),
    },
    {
      id: "summary",
      label: "Professional summary",
      done: Boolean(u.careerSummary?.trim()),
    },
    {
      id: "break",
      label: "Career break explanation",
      done: Boolean(u.careerGapNarrative?.trim()),
      optional: true,
    },
    { id: "skills", label: "Skills", done: input.skillCount >= 1 },
    { id: "cv", label: "CV uploaded", done: Boolean(u.cvUrl) },
    {
      id: "employment",
      label: "Employment history",
      done: input.employmentCount >= 1,
      optional: true,
    },
    {
      id: "education",
      label: "Education & certifications",
      done: input.educationCount >= 1,
      optional: true,
    },
  ];
}

function ProfileProgress({
  sections,
  complete,
}: {
  sections: SectionStatus[];
  complete: boolean;
}) {
  const required = sections.filter((s) => !s.optional);
  const doneRequired = required.filter((s) => s.done).length;
  const pct = Math.round((doneRequired / Math.max(required.length, 1)) * 100);

  return (
    <section className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
            Profile progress
          </h2>
          <p className="mt-1 text-sm text-[color:var(--foreground)]/70">
            {complete
              ? "You’re ready to apply for jobs."
              : "Complete the required sections to unlock applications."}
          </p>
        </div>
        <p className="text-sm font-semibold text-brand">{pct}% ready</p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/80 ring-1 ring-[color:var(--line)]">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {sections.map((section) => (
          <li
            key={section.id}
            className="flex items-center gap-2 text-sm text-[color:var(--foreground)]/80"
          >
            <span
              aria-hidden
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                section.done
                  ? "bg-brand text-white"
                  : "bg-white text-brand ring-1 ring-[color:var(--line)]"
              }`}
            >
              {section.done ? "✓" : "·"}
            </span>
            <span>
              {section.label}
              {section.optional ? (
                <span className="text-[color:var(--foreground)]/45"> (optional)</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AboutStep({
  user,
  setUser,
}: {
  user: HorizonUser;
  setUser: React.Dispatch<React.SetStateAction<HorizonUser>>;
}) {
  return (
    <StepShell
      title="About you"
      body="Employers see your name and location on applications."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="First name"
          value={user.firstName ?? ""}
          onChange={(firstName) => setUser((u) => ({ ...u, firstName }))}
        />
        <Field
          label="Last name"
          value={user.lastName ?? ""}
          onChange={(lastName) => setUser((u) => ({ ...u, lastName }))}
        />
        <Field
          label="City / town"
          value={user.city ?? ""}
          onChange={(city) => setUser((u) => ({ ...u, city }))}
        />
        <Field
          label="Country"
          value={user.country ?? "United Kingdom"}
          onChange={(country) => setUser((u) => ({ ...u, country }))}
        />
      </div>
      <p className="text-sm text-[color:var(--foreground)]/60">
        Email on file: {user.email}
      </p>
    </StepShell>
  );
}

function SummaryStep({
  user,
  setUser,
}: {
  user: HorizonUser;
  setUser: React.Dispatch<React.SetStateAction<HorizonUser>>;
}) {
  return (
    <StepShell
      title="Professional summary"
      body="A short overview of your experience and what you’re looking for next. Cover letters stay with each application — not here."
    >
      <TextArea
        label="Professional summary"
        value={user.careerSummary ?? ""}
        onChange={(careerSummary) => setUser((u) => ({ ...u, careerSummary }))}
        rows={5}
        hint="2–5 sentences works well."
      />
      <TextArea
        label="Career break explanation (optional)"
        value={user.careerGapNarrative ?? ""}
        onChange={(careerGapNarrative) =>
          setUser((u) => ({ ...u, careerGapNarrative }))
        }
        rows={4}
        hint="Caring, health, travel, redundancy — share only what you’re comfortable with."
      />
    </StepShell>
  );
}

function SkillsStep({
  skills,
  onChange,
  token,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
  token: () => Promise<string>;
}) {
  const [draft, setDraft] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const q = draft.trim().toLowerCase();
    if (!q) {
      setSuggestions(
        SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 8),
      );
      return;
    }
    const local = SKILL_SUGGESTIONS.filter(
      (s) => s.toLowerCase().includes(q) && !skills.includes(s),
    ).slice(0, 6);
    setSuggestions(local);

    const handle = window.setTimeout(() => {
      void (async () => {
        try {
          const rows = await searchSkills(await token(), draft.trim());
          const names = rows
            .map((r) => r.name)
            .filter((name) => !skills.includes(name));
          setSuggestions((prev) =>
            Array.from(new Set([...names, ...prev])).slice(0, 8),
          );
        } catch {
          // local suggestions are enough
        }
      })();
    }, 250);
    return () => window.clearTimeout(handle);
  }, [draft, skills, token]);

  function addSkill(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...skills, trimmed]);
    setDraft("");
  }

  return (
    <StepShell
      title="Skills"
      body="Add skills one at a time. Pick a suggestion or type your own."
    >
      <div className="flex flex-wrap gap-2">
        {skills.length === 0 ? (
          <p className="text-sm text-[color:var(--foreground)]/55">
            No skills yet — add at least one to apply for jobs.
          </p>
        ) : (
          skills.map((skill) => (
            <button
              key={skill}
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand"
              onClick={() => onChange(skills.filter((s) => s !== skill))}
              aria-label={`Remove ${skill}`}
            >
              {skill}
              <span aria-hidden>×</span>
            </button>
          ))
        )}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill(draft);
            }
          }}
          placeholder="Type a skill, then Enter"
          className="w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
        />
        <button
          type="button"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
          onClick={() => addSkill(draft)}
        >
          Add
        </button>
      </div>
      {suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="rounded-md border border-dashed border-[color:var(--line)] bg-white px-3 py-1 text-xs font-medium text-brand"
              onClick={() => addSkill(suggestion)}
            >
              + {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </StepShell>
  );
}

function CvStep({
  user,
  progress,
  onUpload,
  onRemove,
}: {
  user: HorizonUser;
  progress: number | null;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);

  return (
    <StepShell
      title="CV"
      body="Upload a PDF or DOCX (max 5 MB). Choosing a file uploads it straight away."
    >
      {user.cvUrl ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[color:var(--line)] bg-white px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-brand">
              {user.cvFileName ?? "CV on file"}
            </p>
            <p className="text-xs text-[color:var(--foreground)]/60">
              Uploaded and ready for applications
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md border border-[color:var(--line)] bg-white px-3 py-1.5 text-sm font-semibold text-brand"
              onClick={() => inputRef.current?.click()}
              disabled={pending}
            >
              Replace
            </button>
            <button
              type="button"
              className="rounded-md bg-red-800 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
              disabled={pending}
              onClick={() => {
                void (async () => {
                  setPending(true);
                  try {
                    await onRemove();
                  } finally {
                    setPending(false);
                  }
                })();
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="w-full rounded-md border border-dashed border-brand/40 bg-white px-4 py-8 text-sm font-semibold text-brand"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
        >
          Choose CV file
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          void (async () => {
            setPending(true);
            try {
              await onUpload(file);
            } finally {
              setPending(false);
            }
          })();
        }}
      />
      {progress !== null ? (
        <div className="space-y-1">
          <p className="text-xs font-medium text-brand">Uploading… {progress}%</p>
          <div className="h-2 overflow-hidden rounded-full bg-white ring-1 ring-[color:var(--line)]">
            <div
              className="h-full bg-brand-accent transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}
    </StepShell>
  );
}

function EmploymentStep({
  items,
  onSave,
  onDelete,
}: {
  items: ProfileBundle["employmentHistory"];
  onSave: (
    body: {
      employerName: string;
      jobTitle: string;
      startDate: string;
      endDate?: string | null;
      currentlyWorking: boolean;
      description?: string | null;
    },
    id?: string,
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [draftId, setDraftId] = useState<string | "new" | null>(null);
  const editing = draftId && draftId !== "new"
    ? items.find((row) => row.id === draftId) ?? null
    : null;

  return (
    <StepShell
      title="Employment history"
      body="Add, edit, or delete roles anytime. Dates use DD/MM/YYYY (2-digit years like 23 become 2023)."
    >
      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="text-sm text-[color:var(--foreground)]/55">
            No roles added yet — optional, but helpful for employers.
          </li>
        ) : (
          items.map((row) =>
            draftId === row.id ? (
              <li key={row.id}>
                <EmploymentForm
                  initial={row}
                  onCancel={() => setDraftId(null)}
                  onSave={async (body) => {
                    await onSave(body, row.id);
                    setDraftId(null);
                  }}
                />
              </li>
            ) : (
              <li
                key={row.id}
                className="rounded-md border border-[color:var(--line)] bg-white px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-brand">{row.jobTitle}</p>
                    <p className="text-sm text-[color:var(--foreground)]/75">
                      {row.employerName}
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--foreground)]/55">
                      {formatUkDateLabel(row.startDate)} –{" "}
                      {row.currentlyWorking
                        ? "Present"
                        : formatUkDateLabel(row.endDate)}
                    </p>
                    {row.description ? (
                      <p className="mt-2 text-sm text-[color:var(--foreground)]/75">
                        {row.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="text-sm font-semibold text-brand underline"
                      onClick={() => setDraftId(row.id)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-sm font-semibold text-red-800 underline"
                      onClick={() => void onDelete(row.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ),
          )
        )}
      </ul>

      {draftId === "new" ? (
        <EmploymentForm
          onCancel={() => setDraftId(null)}
          onSave={async (body) => {
            await onSave(body);
            setDraftId(null);
          }}
        />
      ) : draftId === null && !editing ? (
        <button
          type="button"
          className="rounded-md border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-brand"
          onClick={() => setDraftId("new")}
        >
          Add role
        </button>
      ) : null}
    </StepShell>
  );
}

function EmploymentForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: ProfileBundle["employmentHistory"][number];
  onSave: (body: {
    employerName: string;
    jobTitle: string;
    startDate: string;
    endDate?: string | null;
    currentlyWorking: boolean;
    description?: string | null;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [employerName, setEmployerName] = useState(initial?.employerName ?? "");
  const [jobTitle, setJobTitle] = useState(initial?.jobTitle ?? "");
  const [startUk, setStartUk] = useState(isoToUk(initial?.startDate) || "");
  const [endUk, setEndUk] = useState(isoToUk(initial?.endDate) || "");
  const [current, setCurrent] = useState(initial?.currentlyWorking ?? false);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  return (
    <form
      className="space-y-3 rounded-md border border-[color:var(--line)] bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        void (async () => {
          setLocalError(null);
          const startDate = ukToIso(startUk);
          if (!startDate) {
            setLocalError("Enter start date as DD/MM/YYYY or DD/MM/YY.");
            return;
          }
          let endDate: string | null = null;
          if (!current && endUk.trim()) {
            endDate = ukToIso(endUk);
            if (!endDate) {
              setLocalError("Enter end date as DD/MM/YYYY or DD/MM/YY.");
              return;
            }
          }
          setPending(true);
          try {
            await onSave({
              employerName,
              jobTitle,
              startDate,
              endDate,
              currentlyWorking: current || !endDate,
              description: description || null,
            });
          } catch (err) {
            setLocalError(messageFrom(err));
          } finally {
            setPending(false);
          }
        })();
      }}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Employer" value={employerName} onChange={setEmployerName} required />
        <Field label="Job title" value={jobTitle} onChange={setJobTitle} required />
        <UkDateField label="Start date" value={startUk} onChange={setStartUk} required />
        <UkDateField
          label="End date"
          value={endUk}
          onChange={setEndUk}
          disabled={current}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={current}
          onChange={(e) => {
            setCurrent(e.target.checked);
            if (e.target.checked) setEndUk("");
          }}
        />
        I currently work here
      </label>
      <TextArea label="Description (optional)" value={description} onChange={setDescription} rows={3} />
      {localError ? (
        <p className="text-sm text-red-700" role="alert">
          {localError}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending || !employerName || !jobTitle}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {initial ? "Update role" : "Save role"}
        </button>
        <button
          type="button"
          className="rounded-md border border-[color:var(--line)] px-4 py-2 text-sm font-semibold text-brand"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function EducationStep({
  education,
  qualifications,
  onSaveEducation,
  onDeleteEducation,
  onSaveQualification,
  onDeleteQualification,
}: {
  education: ProfileBundle["education"];
  qualifications: ProfileBundle["qualifications"];
  onSaveEducation: (
    body: {
      institution: string;
      qualification: string;
      startDate: string;
      endDate?: string | null;
      description?: string | null;
    },
    id?: string,
  ) => Promise<void>;
  onDeleteEducation: (id: string) => Promise<void>;
  onSaveQualification: (
    body: {
      name: string;
      issuingBody?: string | null;
      dateAwarded?: string | null;
      description?: string | null;
    },
    id?: string,
  ) => Promise<void>;
  onDeleteQualification: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<
    | null
    | { kind: "education"; id?: string }
    | { kind: "cert"; id?: string }
  >(null);

  return (
    <StepShell
      title="Education & certifications"
      body="Add, edit, or delete entries anytime. Short years like 23 become 2023."
    >
      <ul className="space-y-3">
        {education.map((row) =>
          draft?.kind === "education" && draft.id === row.id ? (
            <li key={row.id}>
              <EducationForm
                initial={row}
                onCancel={() => setDraft(null)}
                onSave={async (body) => {
                  await onSaveEducation(body, row.id);
                  setDraft(null);
                }}
              />
            </li>
          ) : (
            <li
              key={row.id}
              className="rounded-md border border-[color:var(--line)] bg-white px-4 py-3"
            >
              <div className="flex justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-accent">
                    Education
                  </p>
                  <p className="font-semibold text-brand">{row.qualification}</p>
                  <p className="text-sm">{row.institution}</p>
                  <p className="text-xs text-[color:var(--foreground)]/55">
                    {formatUkDateLabel(row.startDate)} –{" "}
                    {formatUkDateLabel(row.endDate)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="text-sm font-semibold text-brand underline"
                    onClick={() => setDraft({ kind: "education", id: row.id })}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-sm font-semibold text-red-800 underline"
                    onClick={() => void onDeleteEducation(row.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ),
        )}
        {qualifications.map((row) =>
          draft?.kind === "cert" && draft.id === row.id ? (
            <li key={row.id}>
              <CertificationForm
                initial={row}
                onCancel={() => setDraft(null)}
                onSave={async (body) => {
                  await onSaveQualification(body, row.id);
                  setDraft(null);
                }}
              />
            </li>
          ) : (
            <li
              key={row.id}
              className="rounded-md border border-[color:var(--line)] bg-white px-4 py-3"
            >
              <div className="flex justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-accent">
                    Certification
                  </p>
                  <p className="font-semibold text-brand">{row.name}</p>
                  {row.issuingBody ? (
                    <p className="text-sm">{row.issuingBody}</p>
                  ) : null}
                  <p className="text-xs text-[color:var(--foreground)]/55">
                    {formatUkDateLabel(row.dateAwarded)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="text-sm font-semibold text-brand underline"
                    onClick={() => setDraft({ kind: "cert", id: row.id })}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-sm font-semibold text-red-800 underline"
                    onClick={() => void onDeleteQualification(row.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ),
        )}
        {education.length === 0 && qualifications.length === 0 ? (
          <li className="text-sm text-[color:var(--foreground)]/55">
            Nothing added yet — optional for applying.
          </li>
        ) : null}
      </ul>

      {draft === null ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-brand"
            onClick={() => setDraft({ kind: "education" })}
          >
            Add education
          </button>
          <button
            type="button"
            className="rounded-md border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-brand"
            onClick={() => setDraft({ kind: "cert" })}
          >
            Add certification
          </button>
        </div>
      ) : null}

      {draft?.kind === "education" && !draft.id ? (
        <EducationForm
          onCancel={() => setDraft(null)}
          onSave={async (body) => {
            await onSaveEducation(body);
            setDraft(null);
          }}
        />
      ) : null}
      {draft?.kind === "cert" && !draft.id ? (
        <CertificationForm
          onCancel={() => setDraft(null)}
          onSave={async (body) => {
            await onSaveQualification(body);
            setDraft(null);
          }}
        />
      ) : null}
    </StepShell>
  );
}

function EducationForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: ProfileBundle["education"][number];
  onSave: (body: {
    institution: string;
    qualification: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [institution, setInstitution] = useState(initial?.institution ?? "");
  const [qualification, setQualification] = useState(initial?.qualification ?? "");
  const [startUk, setStartUk] = useState(isoToUk(initial?.startDate) || "");
  const [endUk, setEndUk] = useState(isoToUk(initial?.endDate) || "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  return (
    <form
      className="space-y-3 rounded-md border border-[color:var(--line)] bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        void (async () => {
          setLocalError(null);
          const startDate = ukToIso(startUk);
          if (!startDate) {
            setLocalError("Enter start date as DD/MM/YYYY or DD/MM/YY.");
            return;
          }
          let endDate: string | null = null;
          if (endUk.trim()) {
            endDate = ukToIso(endUk);
            if (!endDate) {
              setLocalError("Enter end date as DD/MM/YYYY or DD/MM/YY.");
              return;
            }
          }
          setPending(true);
          try {
            await onSave({
              institution,
              qualification,
              startDate,
              endDate,
              description: description || null,
            });
          } catch (err) {
            setLocalError(messageFrom(err));
          } finally {
            setPending(false);
          }
        })();
      }}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Institution" value={institution} onChange={setInstitution} required />
        <Field
          label="Qualification"
          value={qualification}
          onChange={setQualification}
          required
        />
        <UkDateField label="Start date" value={startUk} onChange={setStartUk} required />
        <UkDateField label="End date (optional)" value={endUk} onChange={setEndUk} />
      </div>
      <TextArea label="Notes (optional)" value={description} onChange={setDescription} rows={3} />
      {localError ? (
        <p className="text-sm text-red-700" role="alert">
          {localError}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {initial ? "Update education" : "Save education"}
        </button>
        <button
          type="button"
          className="rounded-md border border-[color:var(--line)] px-4 py-2 text-sm font-semibold text-brand"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function CertificationForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: ProfileBundle["qualifications"][number];
  onSave: (body: {
    name: string;
    issuingBody?: string | null;
    dateAwarded?: string | null;
    description?: string | null;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [issuingBody, setIssuingBody] = useState(initial?.issuingBody ?? "");
  const [dateUk, setDateUk] = useState(isoToUk(initial?.dateAwarded) || "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  return (
    <form
      className="space-y-3 rounded-md border border-[color:var(--line)] bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        void (async () => {
          setLocalError(null);
          let dateAwarded: string | null = null;
          if (dateUk.trim()) {
            dateAwarded = ukToIso(dateUk);
            if (!dateAwarded) {
              setLocalError("Enter date as DD/MM/YYYY or DD/MM/YY.");
              return;
            }
          }
          setPending(true);
          try {
            await onSave({
              name,
              issuingBody: issuingBody || null,
              dateAwarded,
              description: description || null,
            });
          } catch (err) {
            setLocalError(messageFrom(err));
          } finally {
            setPending(false);
          }
        })();
      }}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Certification name" value={name} onChange={setName} required />
        <Field label="Issuing body" value={issuingBody} onChange={setIssuingBody} />
        <UkDateField label="Date awarded" value={dateUk} onChange={setDateUk} />
      </div>
      <TextArea label="Notes (optional)" value={description} onChange={setDescription} rows={3} />
      {localError ? (
        <p className="text-sm text-red-700" role="alert">
          {localError}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending || !name}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {initial ? "Update certification" : "Save certification"}
        </button>
        <button
          type="button"
          className="rounded-md border border-[color:var(--line)] px-4 py-2 text-sm font-semibold text-brand"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ReviewStep({
  user,
  sections,
  skillCount,
  employmentCount,
  educationCount,
  onEditSection,
}: {
  user: HorizonUser;
  sections: SectionStatus[];
  skillCount: number;
  employmentCount: number;
  educationCount: number;
  onEditSection: (step: StepId) => void;
}) {
  const incomplete = sections.filter((s) => !s.optional && !s.done);

  return (
    <StepShell
      title="Review"
      body="Tap any box below to edit that part of your profile."
    >
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <ReviewItem
          label="Name"
          value={`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—"}
          onEdit={() => onEditSection("about")}
        />
        <ReviewItem
          label="Location"
          value={[user.city, user.country].filter(Boolean).join(", ") || "—"}
          onEdit={() => onEditSection("about")}
        />
        <ReviewItem
          label="Professional summary"
          value={user.careerSummary?.trim() ? "Added" : "Not added"}
          onEdit={() => onEditSection("summary")}
        />
        <ReviewItem
          label="Skills"
          value={`${skillCount}`}
          onEdit={() => onEditSection("skills")}
        />
        <ReviewItem
          label="CV"
          value={user.cvFileName ?? "Not uploaded"}
          onEdit={() => onEditSection("cv")}
        />
        <ReviewItem
          label="Roles"
          value={`${employmentCount}`}
          onEdit={() => onEditSection("employment")}
        />
        <ReviewItem
          label="Education items"
          value={`${educationCount}`}
          onEdit={() => onEditSection("education")}
        />
      </dl>
      {incomplete.length > 0 ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Still needed: {incomplete.map((s) => s.label).join(", ")}.
        </p>
      ) : (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Required profile sections look complete. Come back anytime to update them.
        </p>
      )}
      <p className="text-sm text-[color:var(--foreground)]/70">
        To permanently delete your account and profile data, go to{" "}
        <Link href="/settings" className="font-semibold text-brand underline">
          Account settings
        </Link>
        .
      </p>
    </StepShell>
  );
}

function ReviewItem({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-md border border-[color:var(--line)] bg-white">
      <button
        type="button"
        onClick={onEdit}
        className="flex w-full items-start justify-between gap-3 px-3 py-3 text-left transition hover:bg-brand/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <span>
          <span className="block text-xs font-semibold uppercase tracking-wide text-brand-accent">
            {label}
          </span>
          <span className="mt-1 block font-medium text-brand">{value}</span>
        </span>
        <span className="shrink-0 text-xs font-semibold text-brand underline">
          Edit
        </span>
      </button>
    </div>
  );
}

function StepShell({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
          {title}
        </h2>
        <p className="mt-1 text-sm text-[color:var(--foreground)]/70">{body}</p>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-brand">{label}</span>
      <input
        required={required}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2 disabled:opacity-50"
      />
    </label>
  );
}

function UkDateField({
  label,
  value,
  onChange,
  required,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-brand">{label}</span>
      <input
        required={required}
        disabled={disabled}
        inputMode="numeric"
        placeholder="DD/MM/YYYY or DD/MM/YY"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => onChange(normaliseUkDateInput(value))}
        className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2 disabled:opacity-50"
      />
      <span className="mt-1 block text-xs text-[color:var(--foreground)]/55">
        Example: 12/05/23 becomes 12/05/2023
      </span>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-brand">{label}</span>
      <textarea
        value={value}
        rows={rows}
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

function messageFrom(err: unknown) {
  return err instanceof ApiRequestError || err instanceof Error
    ? err.message
    : "Something went wrong.";
}

function useDebouncedEffect(
  effect: () => void,
  deps: unknown[],
  delayMs: number,
) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = window.setTimeout(effect, delayMs);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional debounce deps
  }, deps);
}