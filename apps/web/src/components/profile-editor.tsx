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
  addRecommendation,
  createProject,
  deleteEducation,
  deleteEmployment,
  deleteProject,
  deleteQualification,
  deleteRecommendation,
  mediaUrl,
  searchSkills,
  setCapabilities,
  setSkillsByName,
  updateCandidateProfile,
  updateCurrentUser,
  updateEducation,
  updateEmployment,
  updateProject,
  updateQualification,
  updateRecommendation,
  uploadProjectMedia,
  type Capability,
  type CapabilityInput,
  type HorizonUser,
  type Project,
  type ProjectMediaItem,
  type ProfileBundle,
} from "@/lib/api";
import { isClerkConfigured } from "@/lib/clerk-config";
import { formatUkDateLabel, isoToUk, normaliseUkDateInput, ukToIso } from "@/lib/dates";
import { SKILL_SUGGESTIONS } from "@/lib/skill-suggestions";
import { CapabilityStatementGuide } from "@/components/capability-statement-guide";

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
  { id: "skillProfile", label: "SkillsPhase profile" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Evidence" },
  { id: "employment", label: "Work History" },
  { id: "education", label: "Education" },
  { id: "review", label: "Review" },
];

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
  const [capabilities, setCapabilitiesState] = useState<Capability[]>(() =>
    initialCapabilities(initial),
  );
  const [projects, setProjects] = useState(initial.projects);
  const [employment, setEmployment] = useState(initial.employmentHistory);
  const [education, setEducation] = useState(initial.education);
  const [qualifications, setQualifications] = useState(initial.qualifications);
  const [recommendations, setRecommendations] = useState(
    initial.recommendations ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  const userRef = useRef(user);
  userRef.current = user;
  const skillListRef = useRef(skillList);
  skillListRef.current = skillList;
  const capabilitiesRef = useRef(capabilities);
  capabilitiesRef.current = capabilities;

  const sections = useMemo(
    () =>
      buildSectionStatus({
        user,
        skillCount: skillList.length,
        projectCount: projects.length,
        qualificationCount: qualifications.length,
        recommendationCount: recommendations.length,
        employmentCount: employment.length,
        educationCount: education.length,
      }),
    [
      user,
      skillList.length,
      projects.length,
      qualifications.length,
      recommendations.length,
      employment.length,
      education.length,
    ],
  );

  const token = useCallback(async () => {
    const value = await getToken();
    if (!value) throw new Error("Missing session token");
    return value;
  }, [getToken]);

  function applyProfileCompleted(updated: HorizonUser) {
    setUser((current) =>
      current.profileCompleted === updated.profileCompleted
        ? current
        : { ...current, profileCompleted: updated.profileCompleted },
    );
  }

  function toOptionalNumber(value: string | null | undefined): number | null {
    if (value === null || value === undefined || value.trim() === "") {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

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
          // Never replace the whole user object — an in-flight save can
          // overwrite newer keystrokes (e.g. professional title).
          applyProfileCompleted(updated);
          setSaveState("saved");
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
            primaryCapability: snapshot.primaryCapability,
            remotePreference: snapshot.remotePreference,
            availability: snapshot.availability,
            yearsExperience: snapshot.yearsExperience,
            salaryMin: toOptionalNumber(snapshot.salaryMin),
            salaryMax: toOptionalNumber(snapshot.salaryMax),
          });
          applyProfileCompleted(updated);
          setSaveState("saved");
        } catch (err) {
          setSaveState("error");
          setError(messageFrom(err));
        }
      })();
    },
    [
      user.professionalTitle,
      user.primaryCapability,
      user.remotePreference,
      user.availability,
      user.yearsExperience,
      user.salaryMin,
      user.salaryMax,
      token,
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
          // Only sync if the user hasn't kept editing skills meanwhile.
          const latest = skillListRef.current;
          const same =
            latest.length === names.length &&
            latest.every((name, index) => name === names[index]);
          if (same) {
            setSkillList(rows.map((r) => r.name));
          }
          setSaveState("saved");
        } catch (err) {
          setSaveState("error");
          setError(messageFrom(err));
        }
      })();
    },
    [skillList.join("\u0001"), token],
    700,
  );

  useDebouncedEffect(
    () => {
      void (async () => {
        const snapshot = capabilitiesRef.current;
        const saveKey = capabilitySaveKey(snapshot);
        setSaveState("saving");
        setError(null);
        try {
          const rows = await setCapabilities(
            await token(),
            toCapabilityInputs(snapshot),
          );
          // Ignore stale responses if the user kept editing capabilities.
          if (capabilitySaveKey(capabilitiesRef.current) !== saveKey) {
            setSaveState("saved");
            return;
          }
          setCapabilitiesState((current) => {
            const emptyDrafts = current.filter((row) => !row.label.trim());
            return [...rows, ...emptyDrafts];
          });
          const primary =
            rows.find((row) => row.isPrimary)?.label ?? rows[0]?.label ?? null;
          setUser((current) =>
            current.primaryCapability === primary
              ? current
              : { ...current, primaryCapability: primary },
          );
          setSaveState("saved");
        } catch (err) {
          setSaveState("error");
          setError(messageFrom(err));
        }
      })();
    },
    [capabilitySaveKey(capabilities), token],
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
          <SkillProfileStep
            user={user}
            setUser={setUser}
            capabilities={capabilities}
            onCapabilitiesChange={setCapabilitiesState}
            skillNames={skillList}
            projects={projects}
          />
        ) : null}
        {step === "skills" ? (
          <SkillsStep
            skills={skillList}
            primaryCapability={user.primaryCapability}
            onChange={setSkillList}
            token={token}
          />
        ) : null}
        {step === "projects" ? (
          <ProjectsStep
            projects={projects}
            qualifications={qualifications}
            recommendations={recommendations}
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
              setCapabilitiesState((rows) =>
                rows.map((cap) => ({
                  ...cap,
                  projectIds: cap.projectIds.filter((projectId) => projectId !== id),
                  projects: cap.projects.filter((project) => project.id !== id),
                })),
              );
              router.refresh();
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
            onSaveRecommendation={async (body, id) => {
              setError(null);
              try {
                if (id) {
                  const row = await updateRecommendation(await token(), id, body);
                  setRecommendations((rows) =>
                    rows.map((item) => (item.id === id ? row : item)),
                  );
                } else {
                  const row = await addRecommendation(await token(), body);
                  setRecommendations((rows) => [...rows, row]);
                }
                router.refresh();
              } catch (err) {
                setError(messageFrom(err));
                throw err;
              }
            }}
            onDeleteRecommendation={async (id) => {
              try {
                await deleteRecommendation(await token(), id);
                setRecommendations((rows) =>
                  rows.filter((row) => row.id !== id),
                );
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
          />
        ) : null}
        {step === "review" ? (
          <ReviewStep
            user={user}
            sections={sections}
            skillCount={skillList.length}
            projectCount={projects.length}
            qualificationCount={qualifications.length}
            recommendationCount={recommendations.length}
            employmentCount={employment.length}
            educationCount={education.length}
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

function initialCapabilities(initial: ProfileBundle): Capability[] {
  if (initial.capabilities?.length) return initial.capabilities;
  if (initial.user.primaryCapability?.trim()) {
    return [
      {
        id: `draft-${crypto.randomUUID()}`,
        label: initial.user.primaryCapability.trim(),
        isPrimary: true,
        sortOrder: 0,
        skillNames: [],
        projectIds: [],
        projects: [],
        outcomes: [],
        confidence: null,
        lastDemonstratedAt: null,
        verificationStatus: null,
      },
    ];
  }
  return [];
}

function toCapabilityInputs(capabilities: Capability[]): CapabilityInput[] {
  return capabilities
    .map((capability, index) => ({
      label: capability.label.trim(),
      isPrimary: capability.isPrimary,
      sortOrder: index,
      skillNames: capability.skillNames,
      projectIds: capability.projectIds,
    }))
    .filter((capability) => capability.label.length > 0);
}

function capabilitySaveKey(capabilities: Capability[]) {
  return capabilities
    .map(
      (capability) =>
        [
          capability.id,
          capability.label,
          capability.isPrimary ? "1" : "0",
          capability.skillNames.join(","),
          capability.projectIds.join(","),
        ].join("|"),
    )
    .join("\u0001");
}

function firstIncompleteStep(initial: ProfileBundle): StepId {
  const u = initial.user;
  if (!u.firstName || !u.lastName || !u.city) return "about";
  if (!u.professionalTitle) return "skillProfile";
  if (initial.skills.length < 3) return "skills";
  if (initial.projects.length < 1) return "projects";
  if (initial.education.length < 1) return "education";
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
  qualificationCount: number;
  recommendationCount: number;
  employmentCount: number;
  educationCount: number;
}): SectionStatus[] {
  const u = input.user;
  const proofCount =
    input.projectCount + input.qualificationCount + input.recommendationCount;
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
    { id: "skills", label: "Technical Skills (min. 3)", done: input.skillCount >= 3 },
    {
      id: "projects",
      label: "Proof of Ability",
      done: proofCount >= 1,
      optional: true,
    },
    {
      id: "employment",
      label: "Work History",
      done: input.employmentCount >= 1,
      optional: true,
    },
    {
      id: "education",
      label: "Education",
      done: input.educationCount >= 1,
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
          <h2 className="font-display text-2xl text-primary">
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
      body="Basic details employers need. Your capability statement comes next — we'll help you write it."
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

function SkillProfileStep({
  user,
  setUser,
  capabilities,
  onCapabilitiesChange,
  skillNames,
  projects,
}: {
  user: HorizonUser;
  setUser: React.Dispatch<React.SetStateAction<HorizonUser>>;
  capabilities: Capability[];
  onCapabilitiesChange: React.Dispatch<React.SetStateAction<Capability[]>>;
  skillNames: string[];
  projects: Project[];
}) {
  function applyCapabilityStatement(statement: string) {
    const trimmed = statement.trim();
    setUser((u) => ({
      ...u,
      primaryCapability: trimmed.slice(0, 120),
      careerSummary: trimmed.slice(0, 3000),
    }));
    onCapabilitiesChange((rows) => {
      if (rows.length === 0) {
        return [
          {
            id: `draft-${crypto.randomUUID()}`,
            label: trimmed.slice(0, 120),
            isPrimary: true,
            sortOrder: 0,
            skillNames: [],
            projectIds: [],
            projects: [],
            outcomes: [],
            confidence: null,
            lastDemonstratedAt: null,
            verificationStatus: null,
          },
        ];
      }
      return rows.map((row) =>
        row.isPrimary ? { ...row, label: trimmed.slice(0, 120) } : row,
      );
    });
  }

  return (
    <StepShell
      title="SkillsPhase profile"
      body="Lead with what you can do. We'll help you draft a capability statement employers can understand in seconds."
    >
      <Field
        label="Professional title"
        value={user.professionalTitle ?? ""}
        onChange={(professionalTitle) =>
          setUser((u) => ({ ...u, professionalTitle }))
        }
        required
        autoComplete="organization-title"
        hint="Supporting context only — e.g. Secondary Teacher, Electrician, Graphic Designer"
      />

      <CapabilityStatementGuide
        value={user.careerSummary ?? user.primaryCapability ?? ""}
        onChange={(statement) =>
          setUser((u) => ({
            ...u,
            careerSummary: statement,
            primaryCapability: statement.slice(0, 120),
          }))
        }
        onApplyPrimary={applyCapabilityStatement}
      />

      <CapabilitiesEditor
        capabilities={capabilities}
        onChange={onCapabilitiesChange}
        skillNames={skillNames}
        projects={projects}
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

function CapabilitiesEditor({
  capabilities,
  onChange,
  skillNames,
  projects,
}: {
  capabilities: Capability[];
  onChange: React.Dispatch<React.SetStateAction<Capability[]>>;
  skillNames: string[];
  projects: Project[];
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-primary">Capabilities</p>
        <p className="mt-0.5 text-xs text-[color:var(--foreground)]/65">
          What you can do. Browse cards show your primary capability plus one
          more — the full list appears on your profile (max 8).
        </p>
      </div>

      <ul className="space-y-3">
        {capabilities.map((capability, index) => (
          <li
            key={capability.id}
            className="rounded-md border border-[color:var(--line)] bg-white p-3"
          >
            <div className="flex flex-wrap items-start gap-2">
              <div className="min-w-0 flex-1">
                <Field
                  label={capability.isPrimary ? "Primary capability" : "Capability"}
                  value={capability.label}
                  onChange={(label) =>
                    onChange((rows) =>
                      rows.map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, label: label.slice(0, 120) }
                          : row,
                      ),
                    )
                  }
                  hint="e.g. Helps GCSE students improve exam performance"
                />
              </div>
              <button
                type="button"
                className="mt-6 text-sm font-semibold text-red-800 underline"
                onClick={() =>
                  onChange((rows) => {
                    const next = rows.filter((_, rowIndex) => rowIndex !== index);
                    if (next.length > 0 && !next.some((row) => row.isPrimary)) {
                      next[0] = { ...next[0]!, isPrimary: true };
                    }
                    return next;
                  })
                }
              >
                Remove
              </button>
            </div>

            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="primary-capability"
                checked={capability.isPrimary}
                onChange={() =>
                  onChange((rows) =>
                    rows.map((row, rowIndex) => ({
                      ...row,
                      isPrimary: rowIndex === index,
                    })),
                  )
                }
              />
              <span className="text-[color:var(--foreground)]/80">
                Set as primary
              </span>
            </label>

            {skillNames.length > 0 ? (
              <div className="mt-3">
                <p className="mb-1 text-xs font-medium text-primary">
                  Linked skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {skillNames.map((skill) => {
                    const checked = capability.skillNames.includes(skill);
                    return (
                      <label
                        key={`${capability.id}-${skill}`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] px-2 py-1 text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            onChange((rows) =>
                              rows.map((row, rowIndex) => {
                                if (rowIndex !== index) return row;
                                const skillNamesNext = checked
                                  ? row.skillNames.filter((name) => name !== skill)
                                  : [...row.skillNames, skill];
                                return { ...row, skillNames: skillNamesNext };
                              }),
                            )
                          }
                        />
                        {skill}
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs text-[color:var(--foreground)]/55">
                Add technical skills in the next step to link them here.
              </p>
            )}

            {projects.length > 0 ? (
              <div className="mt-3">
                <p className="mb-1 text-xs font-medium text-primary">
                  Supported by (Proof of Ability)
                </p>
                <div className="flex flex-wrap gap-2">
                  {projects.map((project) => {
                    const checked = capability.projectIds.includes(project.id);
                    return (
                      <label
                        key={`${capability.id}-${project.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] px-2 py-1 text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            onChange((rows) =>
                              rows.map((row, rowIndex) => {
                                if (rowIndex !== index) return row;
                                const projectIds = checked
                                  ? row.projectIds.filter((id) => id !== project.id)
                                  : [...row.projectIds, project.id];
                                const linkedProjects = projects
                                  .filter((item) => projectIds.includes(item.id))
                                  .map((item) => ({
                                    id: item.id,
                                    title: item.title,
                                    outcome: item.outcome,
                                  }));
                                return {
                                  ...row,
                                  projectIds,
                                  projects: linkedProjects,
                                  outcomes: linkedProjects
                                    .map((item) => item.outcome?.trim())
                                    .filter((value): value is string => Boolean(value)),
                                };
                              }),
                            )
                          }
                        />
                        {project.title}
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs text-[color:var(--foreground)]/55">
                Add Proof of Ability projects later, then link them here.
              </p>
            )}
          </li>
        ))}
      </ul>

      {capabilities.length < 8 ? (
        <button
          type="button"
          className="rounded-md border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-primary"
          onClick={() =>
            onChange((rows) => [
              ...rows,
              {
                id: `draft-${crypto.randomUUID()}`,
                label: "",
                isPrimary: rows.length === 0,
                sortOrder: rows.length,
                skillNames: [],
                projectIds: [],
                projects: [],
                outcomes: [],
                confidence: null,
                lastDemonstratedAt: null,
                verificationStatus: null,
              },
            ])
          }
        >
          Add capability
        </button>
      ) : null}
    </div>
  );
}

function SkillsStep({
  skills,
  primaryCapability,
  onChange,
  token,
}: {
  skills: string[];
  primaryCapability: string | null;
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
      body="Add at least 3 searchable skills — lesson planning, commercial installs, brand identity, food costing, React… whatever proves your capability."
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
      {primaryCapability ? (
        <p className="text-sm text-[color:var(--foreground)]/70">
          Primary capability: {primaryCapability}
        </p>
      ) : null}
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
  qualifications,
  recommendations,
  token,
  onCreate,
  onUpdate,
  onDelete,
  onSaveQualification,
  onDeleteQualification,
  onSaveRecommendation,
  onDeleteRecommendation,
  onError,
}: {
  projects: Project[];
  qualifications: ProfileBundle["qualifications"];
  recommendations: ProfileBundle["recommendations"];
  token: () => Promise<string>;
  onCreate: (body: {
    title: string;
    description?: string | null;
    outcome?: string | null;
    role?: string | null;
    projectUrl?: string | null;
    technologies?: string[];
    media?: ProjectMediaItem[];
    featured?: boolean;
  }) => Promise<void>;
  onUpdate: (
    id: string,
    body: Partial<{
      title: string;
      description: string | null;
      outcome: string | null;
      role: string | null;
      projectUrl: string | null;
      technologies: string[];
      media: ProjectMediaItem[];
      featured: boolean;
    }>,
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
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
  onSaveRecommendation: (
    body: {
      authorName?: string | null;
      relationship: string;
      publicSummary: string;
      keyThemes?: string[];
      body?: string | null;
    },
    id?: string,
  ) => Promise<void>;
  onDeleteRecommendation: (id: string) => Promise<void>;
  onError: (message: string | null) => void;
}) {
  const [draft, setDraft] = useState<
    | null
    | { kind: "project"; id?: string }
    | { kind: "cert"; id?: string }
    | { kind: "recommendation"; id?: string }
  >(null);

  return (
    <StepShell
      title="Proof of Ability"
      body="Add evidence of what you can do: projects you’ve delivered, certificates you’ve earned, and professional recommendations. Recommendation summaries are public; referee names stay private."
    >
      <ul className="space-y-3">
        {projects.map((project) =>
          draft?.kind === "project" && draft.id === project.id ? (
            <li key={project.id}>
              <ProjectForm
                initial={project}
                token={token}
                onCancel={() => setDraft(null)}
                onError={onError}
                onSave={async (body) => {
                  await onUpdate(project.id, body);
                  setDraft(null);
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
                  <p className="text-xs font-medium text-primary-accent">
                    {project.featured ? "Featured project" : "Project"}
                  </p>
                  <p className="font-semibold text-primary">{project.title}</p>
                  {project.role ? (
                    <p className="text-sm text-[color:var(--foreground)]/70">
                      {project.role}
                    </p>
                  ) : null}
                  {project.outcome ? (
                    <p className="mt-1 text-sm font-medium text-primary">
                      {project.outcome}
                    </p>
                  ) : null}
                  {project.description ? (
                    <p className="mt-1 text-sm text-[color:var(--foreground)]/75">
                      {project.description}
                    </p>
                  ) : null}
                  {(project.technologies ?? []).length > 0 ? (
                    <p className="mt-1 text-xs text-[color:var(--foreground)]/65">
                      {(project.technologies ?? []).join(" · ")}
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
                    onClick={() => setDraft({ kind: "project", id: project.id })}
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
                    Certificate
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

        {recommendations.map((row) =>
          draft?.kind === "recommendation" && draft.id === row.id ? (
            <li key={row.id}>
              <RecommendationForm
                initial={row}
                onCancel={() => setDraft(null)}
                onSave={async (body) => {
                  await onSaveRecommendation(body, row.id);
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
                    Recommendation
                  </p>
                  <p className="font-semibold text-primary">
                    {row.relationship}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--foreground)]/75">
                    {row.publicSummary}
                  </p>
                  {row.authorName ? (
                    <p className="mt-1 text-xs text-[color:var(--foreground)]/55">
                      Referee (private): {row.authorName}
                    </p>
                  ) : null}
                  {(row.keyThemes ?? []).length > 0 ? (
                    <p className="mt-1 text-xs text-[color:var(--foreground)]/65">
                      Themes: {row.keyThemes.join(" · ")}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="text-sm font-semibold text-primary underline"
                    onClick={() =>
                      setDraft({ kind: "recommendation", id: row.id })
                    }
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-sm font-semibold text-red-800 underline"
                    onClick={() => void onDeleteRecommendation(row.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ),
        )}

        {projects.length === 0 &&
        qualifications.length === 0 &&
        recommendations.length === 0 ? (
          <li className="text-sm text-[color:var(--foreground)]/55">
            No evidence yet — add a project, certificate, or recommendation.
          </li>
        ) : null}
      </ul>

      {draft === null ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-primary"
            onClick={() => setDraft({ kind: "project" })}
          >
            Add project
          </button>
          <button
            type="button"
            className="rounded-md border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-primary"
            onClick={() => setDraft({ kind: "cert" })}
          >
            Add certificate
          </button>
          <button
            type="button"
            className="rounded-md border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-primary"
            onClick={() => setDraft({ kind: "recommendation" })}
          >
            Add recommendation
          </button>
        </div>
      ) : null}

      {draft?.kind === "project" && !draft.id ? (
        <ProjectForm
          token={token}
          onCancel={() => setDraft(null)}
          onError={onError}
          onSave={async (body) => {
            await onCreate(body);
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
      {draft?.kind === "recommendation" && !draft.id ? (
        <RecommendationForm
          onCancel={() => setDraft(null)}
          onSave={async (body) => {
            await onSaveRecommendation(body);
            setDraft(null);
          }}
        />
      ) : null}
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
    outcome?: string | null;
    role?: string | null;
    projectUrl?: string | null;
    technologies?: string[];
    media?: ProjectMediaItem[];
    featured?: boolean;
  }) => Promise<void>;
  onCancel: () => void;
  onError: (message: string | null) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [outcome, setOutcome] = useState(initial?.outcome ?? "");
  const [technologies, setTechnologies] = useState(
    (initial?.technologies ?? []).join(", "),
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);
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
              outcome: outcome.trim().slice(0, 500) || null,
              role: role || null,
              projectUrl: projectUrl || null,
              technologies: technologies
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean)
                .slice(0, 20),
              media,
              featured,
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
        hint="What you built."
      />
      <TextArea
        label="Outcome (optional)"
        value={outcome}
        onChange={(value) => setOutcome(value.slice(0, 500))}
        rows={2}
        hint="What changed because of your work? e.g. Reduced warehouse lookup times by 80%"
      />
      <Field
        label="Technologies used (optional)"
        value={technologies}
        onChange={setTechnologies}
        hint="Comma-separated — e.g. React, TypeScript, PostgreSQL"
      />
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="mt-1"
        />
        <span>
          <span className="font-medium text-primary">
            Feature as Proof of Ability
          </span>
          <span className="mt-0.5 block text-[color:var(--foreground)]/65">
            Shown first on your profile and on the browse card. Only one project
            can be featured.
          </span>
        </span>
      </label>
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
      title="Work History"
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
  onSaveEducation,
  onDeleteEducation,
}: {
  education: ProfileBundle["education"];
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
}) {
  const [draftId, setDraftId] = useState<string | "new" | null>(null);

  return (
    <StepShell
      title="Education"
      body="Add at least one school, degree, or course. This is required for discovery. Certificates and recommendations live under Proof of Ability."
    >
      <ul className="space-y-3">
        {education.length === 0 ? (
          <li className="text-sm text-[color:var(--foreground)]/55">
            No education added yet — required for your Skill Profile to appear in discovery.
          </li>
        ) : (
          education.map((row) =>
            draftId === row.id ? (
              <li key={row.id}>
                <EducationForm
                  initial={row}
                  onCancel={() => setDraftId(null)}
                  onSave={async (body) => {
                    await onSaveEducation(body, row.id);
                    setDraftId(null);
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
                      onClick={() => setDraftId(row.id)}
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
          )
        )}
      </ul>

      {draftId === "new" ? (
        <EducationForm
          onCancel={() => setDraftId(null)}
          onSave={async (body) => {
            await onSaveEducation(body);
            setDraftId(null);
          }}
        />
      ) : draftId === null ? (
        <button
          type="button"
          className="rounded-md border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-primary"
          onClick={() => setDraftId("new")}
        >
          Add education
        </button>
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
        <Field label="Certificate name" value={name} onChange={setName} required />
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
          {initial ? "Update certificate" : "Save certificate"}
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

function RecommendationForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: ProfileBundle["recommendations"][number];
  onSave: (body: {
    authorName?: string | null;
    relationship: string;
    publicSummary: string;
    keyThemes?: string[];
    body?: string | null;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [authorName, setAuthorName] = useState(initial?.authorName ?? "");
  const [relationship, setRelationship] = useState(initial?.relationship ?? "");
  const [publicSummary, setPublicSummary] = useState(
    initial?.publicSummary ?? "",
  );
  const [keyThemes, setKeyThemes] = useState(
    (initial?.keyThemes ?? []).join(", "),
  );
  const [body, setBody] = useState(initial?.body ?? "");
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

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
              authorName: authorName.trim() || null,
              relationship,
              publicSummary: publicSummary.trim().slice(0, 400),
              keyThemes: keyThemes
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean)
                .slice(0, 8),
              body: body.trim() || null,
            });
          } catch (err) {
            setLocalError(messageFrom(err));
          } finally {
            setPending(false);
          }
        })();
      }}
    >
      <Field
        label="Relationship / role"
        value={relationship}
        onChange={setRelationship}
        required
        hint="Shown publicly — e.g. Former engineering manager"
      />
      <TextArea
        label="Public summary"
        value={publicSummary}
        onChange={(value) => setPublicSummary(value.slice(0, 400))}
        rows={3}
        hint="Short extract shown on your profile (max 400 characters). Not the full letter."
      />
      <Field
        label="Key themes (optional)"
        value={keyThemes}
        onChange={setKeyThemes}
        hint="Comma-separated — e.g. Technical leadership, Product delivery, Collaboration"
      />
      <Field
        label="Referee name (private)"
        value={authorName}
        onChange={setAuthorName}
        hint="Never shown publicly. Kept for your records and future controlled access."
      />
      <TextArea
        label="Full reference text (private, optional)"
        value={body}
        onChange={setBody}
        rows={4}
        hint="Private full letter or notes. Not shown on your public profile. Document upload comes later."
      />
      {localError ? (
        <p className="text-sm text-red-700" role="alert">
          {localError}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending || !relationship || !publicSummary.trim()}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {initial ? "Update recommendation" : "Save recommendation"}
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
  qualificationCount,
  recommendationCount,
  employmentCount,
  educationCount,
  onEditSection,
}: {
  user: HorizonUser;
  sections: SectionStatus[];
  skillCount: number;
  projectCount: number;
  qualificationCount: number;
  recommendationCount: number;
  employmentCount: number;
  educationCount: number;
  onEditSection: (step: StepId) => void;
}) {
  const incomplete = sections.filter((s) => !s.optional && !s.done);
  const proofCount = projectCount + qualificationCount + recommendationCount;

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
          label="Capabilities"
          value={user.primaryCapability?.trim() || "Not added"}
          onEdit={() => onEditSection("skillProfile")}
        />
        <ReviewItem
          label="Technical Skills"
          value={`${skillCount}`}
          onEdit={() => onEditSection("skills")}
        />
        <ReviewItem
          label="Proof of Ability"
          value={`${proofCount} (${projectCount} projects, ${qualificationCount} certificates, ${recommendationCount} recommendations)`}
          onEdit={() => onEditSection("projects")}
        />
        <ReviewItem
          label="Work History"
          value={`${employmentCount}`}
          onEdit={() => onEditSection("employment")}
        />
        <ReviewItem
          label="Education"
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
          Required profile sections look complete. You can apply for jobs with
          this SkillsPhase profile — supporting documents stay available upon
          request.
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
        <h2 className="font-display text-2xl text-primary">
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
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-primary">{label}</span>
      <input
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
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
