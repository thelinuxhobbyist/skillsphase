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
  AVAILABILITY_LABELS,
  AVAILABILITY_OPTIONS,
  REMOTE_TYPE_LABELS,
  REMOTE_TYPES,
} from "@horizon/shared";
import {
  ApiRequestError,
  addEducation,
  addEmployment,
  addQualification,
  createProject,
  deleteEducation,
  deleteEmployment,
  deleteProject,
  deleteQualification,
  mediaUrl,
  searchSkills,
  setSkillsByName,
  updateCandidateProfile,
  updateCurrentUser,
  updateEducation,
  updateEmployment,
  updateProject,
  updateQualification,
  uploadProjectMedia,
  type HorizonUser,
  type Project,
  type ProjectMediaItem,
  type ProfileBundle,
} from "@/lib/api";
import { formatUkDateLabel, isoToUk, normaliseUkDateInput, ukToIso } from "@/lib/dates";
import { SKILL_SUGGESTIONS } from "@/lib/skill-suggestions";

type StepId =
  | "about"
  | "skillProfile"
  | "skills"
  | "projects"
  | "employment"
  | "education"
  | "review";

const STEPS: Array<{ id: StepId; label: string }> = [
  { id: "about", label: "About you" },
  { id: "skillProfile", label: "Skill Profile" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
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
  const [projects, setProjects] = useState(initial.projects);
  const [employment, setEmployment] = useState(initial.employmentHistory);
  const [education, setEducation] = useState(initial.education);
  const [qualifications, setQualifications] = useState(initial.qualifications);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  const userRef = useRef(user);
  userRef.current = user;
  const skillListRef = useRef(skillList);
  skillListRef.current = skillList;

  const sections = useMemo(
    () =>
      buildSectionStatus({
        user,
        skillCount: skillList.length,
        projectCount: projects.length,
        employmentCount: employment.length,
        educationCount: education.length + qualifications.length,
      }),
    [
      user,
      skillList.length,
      projects.length,
      employment.length,
      education.length,
      qualifications.length,
    ],
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
      token,
      router,
    ],
    700,
  );

  useDebouncedEffect(
    () => {
      void (async () => {
        const snapshot = userRef.current;
        setSaveState("saving");
        setError(null);
        try {
          const updated = await updateCandidateProfile(await token(), {
            professionalTitle: snapshot.professionalTitle,
            remotePreference: snapshot.remotePreference,
            availability: snapshot.availability,
            yearsExperience: snapshot.yearsExperience,
            salaryMin: snapshot.salaryMin,
            salaryMax: snapshot.salaryMax,
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
      user.professionalTitle,
      user.remotePreference,
      user.availability,
      user.yearsExperience,
      user.salaryMin,
      user.salaryMax,
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
              <button
                type="button"
                onClick={() => setStep(item.id)}
                className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${
                  item.id === step
                    ? "bg-brand text-white"
                    : "bg-white/80 text-primary/70 ring-1 ring-[color:var(--line)]"
                }`}
              >
                {index + 1}. {item.label}
              </button>
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
        {step === "skillProfile" ? (
          <SkillProfileStep user={user} setUser={setUser} />
        ) : null}
        {step === "skills" ? (
          <SkillsStep skills={skillList} onChange={setSkillList} token={token} />
        ) : null}
        {step === "projects" ? (
          <ProjectsStep
            projects={projects}
            token={token}
            onError={setError}
            onCreate={async (body) => {
              const row = await createProject(await token(), body);
              setProjects((rows) => [...rows, row]);
              router.refresh();
            }}
            onUpdate={async (id, body) => {
              const row = await updateProject(await token(), id, body);
              setProjects((rows) => rows.map((p) => (p.id === id ? row : p)));
              router.refresh();
            }}
            onDelete={async (id) => {
              await deleteProject(await token(), id);
              setProjects((rows) => rows.filter((p) => p.id !== id));
              router.refresh();
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
            projectCount={projects.length}
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
          className="rounded-md border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-primary disabled:opacity-40"
          onClick={() => setStep(STEPS[Math.max(0, stepIndex - 1)]!.id)}
        >
          Back
        </button>
        {step === "review" ? (
          <Link
            href="/dashboard"
            className="btn-primary rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white"
          >
            {user.profileCompleted ? "Go to dashboard" : "Continue editing later"}
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
  if (!u.professionalTitle) return "skillProfile";
  if (initial.skills.length < 3) return "skills";
  if (initial.projects.length < 1) return "projects";
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
  projectCount: number;
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
      id: "skillProfile",
      label: "Skill Profile basics",
      done: Boolean(u.professionalTitle?.trim()),
    },
    { id: "skills", label: "Skills (min. 3)", done: input.skillCount >= 3 },
    {
      id: "projects",
      label: "Portfolio project",
      done: input.projectCount >= 1,
      optional: true,
    },
    {
      id: "employment",
      label: "Experience history",
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
          <h2 className="font-sans text-2xl text-primary">
            Skill Profile progress
          </h2>
          <p className="mt-1 text-sm text-[color:var(--foreground)]/70">
            {complete
              ? "You’re ready to be discovered by businesses."
              : "Complete the required sections to be shown in discovery."}
          </p>
        </div>
        <p className="text-sm font-semibold text-primary">{pct}% ready</p>
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
                  : "bg-white text-primary ring-1 ring-[color:var(--line)]"
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
      body="Businesses see your name and location when they view your Skill Profile."
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
      <TextArea
        label="Career summary (optional)"
        value={user.careerSummary ?? ""}
        onChange={(careerSummary) => setUser((u) => ({ ...u, careerSummary }))}
        rows={4}
        hint="A short line or two — your skills and projects do most of the talking."
      />
      <p className="text-sm text-[color:var(--foreground)]/60">
        Email on file: {user.email}
      </p>
    </StepShell>
  );
}

function SkillProfileStep({
  user,
  setUser,
}: {
  user: HorizonUser;
  setUser: React.Dispatch<React.SetStateAction<HorizonUser>>;
}) {
  return (
    <StepShell
      title="Skill Profile"
      body="These fields are the first thing businesses see: what you do, your availability, and your rate."
    >
      <Field
        label="Professional title"
        value={user.professionalTitle ?? ""}
        onChange={(professionalTitle) =>
          setUser((u) => ({ ...u, professionalTitle }))
        }
        required
        hint="e.g. Senior React Developer, Brand & Marketing Lead"
      />
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-primary">Remote preference</span>
          <select
            value={user.remotePreference ?? ""}
            onChange={(e) =>
              setUser((u) => ({
                ...u,
                remotePreference:
                  (e.target.value || null) as HorizonUser["remotePreference"],
              }))
            }
            className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
          >
            <option value="">Not specified</option>
            {REMOTE_TYPES.map((value) => (
              <option key={value} value={value}>
                {REMOTE_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-primary">Availability</span>
          <select
            value={user.availability ?? ""}
            onChange={(e) =>
              setUser((u) => ({
                ...u,
                availability:
                  (e.target.value || null) as HorizonUser["availability"],
              }))
            }
            className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
          >
            <option value="">Not specified</option>
            {AVAILABILITY_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {AVAILABILITY_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <Field
          label="Years of experience"
          value={user.yearsExperience != null ? String(user.yearsExperience) : ""}
          onChange={(value) =>
            setUser((u) => ({
              ...u,
              yearsExperience: value.trim() ? Number(value) : null,
            }))
          }
        />
      </div>
      <div>
        <p className="mb-1 text-sm font-medium text-primary">
          Salary / rate expectations (optional)
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Minimum"
            value={user.salaryMin ?? ""}
            onChange={(value) => setUser((u) => ({ ...u, salaryMin: value || null }))}
          />
          <Field
            label="Maximum"
            value={user.salaryMax ?? ""}
            onChange={(value) => setUser((u) => ({ ...u, salaryMax: value || null }))}
          />
        </div>
      </div>
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
      body="Skills are the first thing businesses see. Add at least 3 — React, Python, AWS, Figma, Marketing, Video Editing, anything demonstrable."
    >
      <div className="flex flex-wrap gap-2">
        {skills.length === 0 ? (
          <p className="text-sm text-[color:var(--foreground)]/55">
            No skills yet — add at least 3 to be discoverable.
          </p>
        ) : (
          skills.map((skill) => (
            <button
              key={skill}
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-brand/10 px-3 py-1.5 text-sm font-medium text-primary"
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
              className="rounded-md border border-dashed border-[color:var(--line)] bg-white px-3 py-1 text-xs font-medium text-primary"
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

function ProjectsStep({
  projects,
  token,
  onCreate,
  onUpdate,
  onDelete,
  onError,
}: {
  projects: Project[];
  token: () => Promise<string>;
  onCreate: (body: {
    title: string;
    description?: string | null;
    role?: string | null;
    projectUrl?: string | null;
    media?: ProjectMediaItem[];
  }) => Promise<void>;
  onUpdate: (
    id: string,
    body: Partial<{
      title: string;
      description: string | null;
      role: string | null;
      projectUrl: string | null;
      media: ProjectMediaItem[];
    }>,
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onError: (message: string | null) => void;
}) {
  const [draftId, setDraftId] = useState<string | "new" | null>(null);

  return (
    <StepShell
      title="Projects & portfolio"
      body="Show evidence of your work: projects completed, websites built, designs created, campaigns managed. Attach links, images, videos, or documents."
    >
      <ul className="space-y-3">
        {projects.length === 0 ? (
          <li className="text-sm text-[color:var(--foreground)]/55">
            No projects yet — add one to show real evidence of your ability.
          </li>
        ) : (
          projects.map((project) =>
            draftId === project.id ? (
              <li key={project.id}>
                <ProjectForm
                  initial={project}
                  token={token}
                  onCancel={() => setDraftId(null)}
                  onError={onError}
                  onSave={async (body) => {
                    await onUpdate(project.id, body);
                    setDraftId(null);
                  }}
                />
              </li>
            ) : (
              <li
                key={project.id}
                className="rounded-md border border-[color:var(--line)] bg-white px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-primary">{project.title}</p>
                    {project.role ? (
                      <p className="text-sm text-[color:var(--foreground)]/70">
                        {project.role}
                      </p>
                    ) : null}
                    {project.description ? (
                      <p className="mt-1 text-sm text-[color:var(--foreground)]/75">
                        {project.description}
                      </p>
                    ) : null}
                    {project.media.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        {project.media.map((item, index) => (
                          <a
                            key={`${item.url}-${index}`}
                            href={mediaUrl(item.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] px-2 py-1 text-primary underline"
                          >
                            {item.label || item.type}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <button
                      type="button"
                      className="text-sm font-semibold text-primary underline"
                      onClick={() => setDraftId(project.id)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-sm font-semibold text-red-800 underline"
                      onClick={() => void onDelete(project.id)}
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
        <ProjectForm
          token={token}
          onCancel={() => setDraftId(null)}
          onError={onError}
          onSave={async (body) => {
            await onCreate(body);
            setDraftId(null);
          }}
        />
      ) : (
        <button
          type="button"
          className="rounded-md border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-primary"
          onClick={() => setDraftId("new")}
        >
          Add project
        </button>
      )}
    </StepShell>
  );
}

function ProjectForm({
  initial,
  token,
  onSave,
  onCancel,
  onError,
}: {
  initial?: Project;
  token: () => Promise<string>;
  onSave: (body: {
    title: string;
    description?: string | null;
    role?: string | null;
    projectUrl?: string | null;
    media?: ProjectMediaItem[];
  }) => Promise<void>;
  onCancel: () => void;
  onError: (message: string | null) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [projectUrl, setProjectUrl] = useState(initial?.projectUrl ?? "");
  const [media, setMedia] = useState<ProjectMediaItem[]>(initial?.media ?? []);
  const [linkDraft, setLinkDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <form
      className="space-y-3 rounded-md border border-[color:var(--line)] bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        void (async () => {
          setLocalError(null);
          setPending(true);
          try {
            await onSave({
              title,
              description: description || null,
              role: role || null,
              projectUrl: projectUrl || null,
              media,
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
        <Field label="Project title" value={title} onChange={setTitle} required />
        <Field
          label="Your role (optional)"
          value={role}
          onChange={setRole}
          hint="e.g. Lead Developer, Designer"
        />
      </div>
      <TextArea
        label="Description (optional)"
        value={description}
        onChange={setDescription}
        rows={3}
        hint="What you built and the impact it had."
      />
      <Field
        label="Project URL (optional)"
        value={projectUrl}
        onChange={setProjectUrl}
        hint="Live site, repo, or case study link"
      />

      <div>
        <p className="mb-1 text-sm font-medium text-primary">Portfolio evidence</p>
        {media.length > 0 ? (
          <ul className="mb-2 flex flex-wrap gap-2">
            {media.map((item, index) => (
              <li
                key={`${item.url}-${index}`}
                className="flex items-center gap-2 rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] px-2.5 py-1.5 text-xs"
              >
                <span className="font-medium text-primary">
                  {item.label || item.type}
                </span>
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() =>
                    setMedia((rows) => rows.filter((_, i) => i !== index))
                  }
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={linkDraft}
            onChange={(e) => setLinkDraft(e.target.value)}
            placeholder="Paste a link and press Add"
            className="w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
          />
          <button
            type="button"
            className="rounded-md border border-[color:var(--line)] px-3 py-2 text-sm font-semibold text-primary"
            onClick={() => {
              if (!linkDraft.trim()) return;
              setMedia((rows) => [
                ...rows,
                { type: "link", url: linkDraft.trim(), label: linkDraft.trim() },
              ]);
              setLinkDraft("");
            }}
          >
            Add link
          </button>
          <button
            type="button"
            disabled={uploading}
            className="rounded-md border border-[color:var(--line)] px-3 py-2 text-sm font-semibold text-primary disabled:opacity-60"
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? "Uploading…" : "Upload file"}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*,application/pdf,.docx"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            void (async () => {
              setUploading(true);
              onError(null);
              try {
                const uploaded = await uploadProjectMedia(await token(), file);
                setMedia((rows) => [
                  ...rows,
                  { ...uploaded, label: uploaded.label ?? file.name },
                ]);
              } catch (err) {
                onError(messageFrom(err));
              } finally {
                setUploading(false);
              }
            })();
          }}
        />
        <p className="mt-1 text-xs text-[color:var(--foreground)]/55">
          Images, videos, or documents up to 10 MB.
        </p>
      </div>

      {localError ? (
        <p className="text-sm text-red-700" role="alert">
          {localError}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending || !title}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {initial ? "Update project" : "Save project"}
        </button>
        <button
          type="button"
          className="rounded-md border border-[color:var(--line)] px-4 py-2 text-sm font-semibold text-primary"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
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
      title="Experience"
      body="Add, edit, or delete roles anytime. Dates use DD/MM/YYYY (2-digit years like 23 become 2023)."
    >
      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="text-sm text-[color:var(--foreground)]/55">
            No roles added yet — optional, but helpful for businesses.
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
                    <p className="font-semibold text-primary">{row.jobTitle}</p>
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
                      className="text-sm font-semibold text-primary underline"
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
          className="rounded-md border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-primary"
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
          className="rounded-md border border-[color:var(--line)] px-4 py-2 text-sm font-semibold text-primary"
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
                  <p className="text-xs font-medium text-primary-accent">
                    Education
                  </p>
                  <p className="font-semibold text-primary">{row.qualification}</p>
                  <p className="text-sm">{row.institution}</p>
                  <p className="text-xs text-[color:var(--foreground)]/55">
                    {formatUkDateLabel(row.startDate)} –{" "}
                    {formatUkDateLabel(row.endDate)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="text-sm font-semibold text-primary underline"
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
                  <p className="text-xs font-medium text-primary-accent">
                    Certification
                  </p>
                  <p className="font-semibold text-primary">{row.name}</p>
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
                    className="text-sm font-semibold text-primary underline"
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
            Nothing added yet — optional.
          </li>
        ) : null}
      </ul>

      {draft === null ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-primary"
            onClick={() => setDraft({ kind: "education" })}
          >
            Add education
          </button>
          <button
            type="button"
            className="rounded-md border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-primary"
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
          className="rounded-md border border-[color:var(--line)] px-4 py-2 text-sm font-semibold text-primary"
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
          className="rounded-md border border-[color:var(--line)] px-4 py-2 text-sm font-semibold text-primary"
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
  projectCount,
  employmentCount,
  educationCount,
  onEditSection,
}: {
  user: HorizonUser;
  sections: SectionStatus[];
  skillCount: number;
  projectCount: number;
  employmentCount: number;
  educationCount: number;
  onEditSection: (step: StepId) => void;
}) {
  const incomplete = sections.filter((s) => !s.optional && !s.done);

  return (
    <StepShell
      title="Review"
      body="Tap any box below to edit that part of your Skill Profile."
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
          label="Professional title"
          value={user.professionalTitle?.trim() || "Not added"}
          onEdit={() => onEditSection("skillProfile")}
        />
        <ReviewItem
          label="Skills"
          value={`${skillCount}`}
          onEdit={() => onEditSection("skills")}
        />
        <ReviewItem
          label="Projects"
          value={`${projectCount}`}
          onEdit={() => onEditSection("projects")}
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
          Required Skill Profile sections look complete. Businesses can now discover you.
        </p>
      )}
      <p className="text-sm text-[color:var(--foreground)]/70">
        To permanently delete your account and profile data, go to{" "}
        <Link href="/settings" className="font-semibold text-primary underline">
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
          <span className="block text-xs font-medium text-primary-accent">
            {label}
          </span>
          <span className="mt-1 block font-medium text-primary">{value}</span>
        </span>
        <span className="shrink-0 text-xs font-semibold text-primary underline">
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
        <h2 className="font-sans text-2xl text-primary">
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
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-primary">{label}</span>
      <input
        required={required}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2 disabled:opacity-50"
      />
      {hint ? (
        <span className="mt-1 block text-xs text-[color:var(--foreground)]/55">
          {hint}
        </span>
      ) : null}
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
      <span className="font-medium text-primary">{label}</span>
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
      <span className="font-medium text-primary">{label}</span>
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
