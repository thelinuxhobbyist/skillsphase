"use client";

import { useMemo, useState } from "react";

export type GuidedProfileAnswers = {
  workType: string;
  strongestSkills: string;
  enjoyWork: string;
  employerNotes: string;
};

const EXAMPLES: Array<{
  label: string;
  answers: GuidedProfileAnswers;
}> = [
  {
    label: "Warehouse Operative",
    answers: {
      workType: "Warehouse & Logistics roles",
      strongestSkills: "Forklift operation (FLT license), inventory management, goods in/out",
      enjoyWork: "Fast-paced environment, keeping stock organised and team safety",
      employerNotes: "Reliable, punctual, with 5+ years of warehouse experience and a safety-first mindset.",
    },
  },
  {
    label: "Teacher",
    answers: {
      workType: "Secondary Science Teaching (GCSE/A-Level)",
      strongestSkills: "Classroom management, exam preparation, interactive lesson planning",
      enjoyWork: "Helping students build confidence and overcome learning obstacles",
      employerNotes: "QTS certified teacher dedicated to creating inclusive, engaging classroom environments.",
    },
  },
  {
    label: "Electrician",
    answers: {
      workType: "Commercial & Industrial Electrical Installation",
      strongestSkills: "18th Edition wiring, inspection & testing, fault finding, conduit installation",
      enjoyWork: "Problem-solving on complex site installations and ensuring strict compliance",
      employerNotes: "Fully qualified NVQ Level 3 electrician with CSCS gold card and clean driving licence.",
    },
  },
  {
    label: "Software Developer",
    answers: {
      workType: "Full Stack Web Development",
      strongestSkills: "React, TypeScript, Node.js, REST APIs, database architecture",
      enjoyWork: "Building intuitive user interfaces and solving technical challenges with clean code",
      employerNotes: "Self-motivated developer focused on delivering reliable, maintainable web applications.",
    },
  },
  {
    label: "Nurse / Care",
    answers: {
      workType: "Registered General Nurse (Band 5/6) / Healthcare",
      strongestSkills: "Patient assessment, medication administration, care planning, wound care",
      enjoyWork: "Providing compassionate, high-quality care and supporting patients' recovery",
      employerNotes: "Active NMC registration with extensive acute care experience and strong teamwork skills.",
    },
  },
];

export function draftAboutMeStatement(answers: GuidedProfileAnswers): string {
  const workType = answers.workType.trim();
  const skills = answers.strongestSkills.trim();
  const enjoy = answers.enjoyWork.trim();
  const notes = answers.employerNotes.trim();

  const parts: string[] = [];

  if (workType) {
    parts.push(`Seeking ${workType.replace(/^seeking\s+/i, "")}.`);
  }
  if (skills) {
    parts.push(`Key strengths include ${skills.replace(/^key strengths include\s+/i, "")}.`);
  }
  if (enjoy) {
    parts.push(`Enjoys ${enjoy.replace(/^(enjoys|enjoying)\s+/i, "")}.`);
  }
  if (notes) {
    parts.push(ensurePeriod(notes));
  }

  return parts.join(" ");
}

function ensurePeriod(value: string): string {
  const trimmed = value.trim().replace(/\.+$/, "");
  return trimmed ? `${trimmed}.` : "";
}

/**
 * Guided questions that produce an editable About Me / Profile Summary draft.
 * Solves the issue where most candidates find writing about themselves difficult.
 * (SkillsPhase Vision & Profile Direction).
 */
export function CapabilityStatementGuide({
  value,
  onChange,
  onApplyPrimary,
}: {
  value: string;
  onChange: (next: string) => void;
  /** When the user accepts a draft, also push it as the primary capability label. */
  onApplyPrimary?: (statement: string) => void;
}) {
  const [workType, setWorkType] = useState("");
  const [strongestSkills, setStrongestSkills] = useState("");
  const [enjoyWork, setEnjoyWork] = useState("");
  const [employerNotes, setEmployerNotes] = useState("");

  const generated = useMemo(
    () => draftAboutMeStatement({ workType, strongestSkills, enjoyWork, employerNotes }),
    [workType, strongestSkills, enjoyWork, employerNotes],
  );

  function applyExample(answers: GuidedProfileAnswers) {
    setWorkType(answers.workType);
    setStrongestSkills(answers.strongestSkills);
    setEnjoyWork(answers.enjoyWork);
    setEmployerNotes(answers.employerNotes);
  }

  function useDraft() {
    if (!generated) return;
    onChange(generated);
    if (workType) {
      onApplyPrimary?.(`Seeking ${workType}`);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-[color:var(--line)] bg-[color:var(--paper-warm)]/70 p-5">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            ?
          </span>
          <p className="text-base font-semibold text-primary">
            Help me write my profile summary
          </p>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[color:var(--foreground)]/70">
          Most people find writing about themselves difficult. Answer these 4 simple questions and we'll craft a strong, professional summary you can edit.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="self-center text-xs text-[color:var(--ink-soft)] font-medium">Examples:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example.label}
            type="button"
            className="rounded-full border border-[color:var(--line)] bg-white px-3 py-1 text-xs font-medium text-primary hover:border-primary hover:bg-primary/5 transition-colors"
            onClick={() => applyExample(example.answers)}
          >
            {example.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block text-sm">
          <span className="font-medium text-primary">
            1. What type of work are you looking for?
          </span>
          <input
            value={workType}
            onChange={(e) => setWorkType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
            placeholder="e.g. Warehouse operative, Teaching, Commercial electrician"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-primary">
            2. What are your strongest skills?
          </span>
          <input
            value={strongestSkills}
            onChange={(e) => setStrongestSkills(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
            placeholder="e.g. FLT licence, team leadership, customer service, wiring"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-primary">
            3. What kind of work do you enjoy?
          </span>
          <input
            value={enjoyWork}
            onChange={(e) => setEnjoyWork(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
            placeholder="e.g. Hands-on problem solving, helping students, fast-paced environment"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-primary">
            4. What would you like employers to know about you?
          </span>
          <input
            value={employerNotes}
            onChange={(e) => setEmployerNotes(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
            placeholder="e.g. Reliable, punctual, keen to learn, 5 years experience"
          />
        </label>
      </div>

      <div className="rounded-xl border border-dashed border-primary/30 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-primary font-bold">
            Generated Draft
          </p>
          {generated && (
            <span className="text-[11px] text-emerald-600 font-medium">Ready to use</span>
          )}
        </div>
        <p className="mt-2 text-sm font-medium leading-relaxed text-[color:var(--ink)]">
          {generated || "Fill in the questions above to generate your profile summary draft."}
        </p>
        <button
          type="button"
          disabled={!generated}
          onClick={useDraft}
          className="btn-primary mt-3 rounded-lg px-4 py-2 text-xs font-semibold disabled:opacity-50 transition-all"
        >
          Use this draft for my profile
        </button>
      </div>

      <label className="block text-sm">
        <span className="font-medium text-primary">
          Your About Me / Professional Summary
        </span>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, 800))}
          rows={4}
          className="mt-1 w-full rounded-lg border border-[color:var(--line)] bg-white p-3 text-sm focus:border-primary focus:outline-none"
          placeholder="Edit freely after generating a draft or write your own summary here…"
        />
        <span className="mt-1 block text-xs text-[color:var(--foreground)]/60">
          This introduces you through your skills and strengths before focusing on career timeline.
        </span>
      </label>
    </div>
  );
}
