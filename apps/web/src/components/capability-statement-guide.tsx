"use client";

import { useMemo, useState } from "react";

export type CapabilityDraftAnswers = {
  who: string;
  achieve: string;
  method: string;
};

const EXAMPLES: Array<{
  label: string;
  answers: CapabilityDraftAnswers;
}> = [
  {
    label: "Teacher",
    answers: {
      who: "GCSE students",
      achieve: "improve confidence and exam performance",
      method: "structured lesson plans and calm classroom leadership",
    },
  },
  {
    label: "Electrician",
    answers: {
      who: "commercial clients",
      achieve: "keep electrical systems safe and reliable",
      method: "installs, testing, and clear handover packs",
    },
  },
  {
    label: "Designer",
    answers: {
      who: "growing businesses",
      achieve: "stand out with memorable brands",
      method: "identity systems and launch assets",
    },
  },
  {
    label: "Chef",
    answers: {
      who: "restaurant guests",
      achieve: "keep coming back for seasonal menus",
      method: "flavour-led cooking and kitchen organisation",
    },
  },
];

export function draftCapabilityStatement(answers: CapabilityDraftAnswers): string {
  const who = answers.who.trim();
  const achieve = answers.achieve.trim().replace(/^\.?/, "");
  const method = answers.method.trim();
  if (!who || !achieve) return "";

  const achieveClause = achieve.replace(/^(to|who|that)\s+/i, "");
  const base = `Helps ${who} ${achieveClause}`.replace(/\s+/g, " ").trim();
  if (!method) {
    return ensurePeriod(base);
  }
  return ensurePeriod(`${base} through ${method}`);
}

function ensurePeriod(value: string): string {
  const trimmed = value.trim().replace(/\.+$/, "");
  return `${trimmed}.`;
}

/**
 * Guided questions that produce an editable capability statement draft.
 * Replaces a blank "About / capability" field so candidates aren't left
 * staring at an empty box (ADR 002).
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
  const [who, setWho] = useState("");
  const [achieve, setAchieve] = useState("");
  const [method, setMethod] = useState("");

  const generated = useMemo(
    () => draftCapabilityStatement({ who, achieve, method }),
    [who, achieve, method],
  );

  function applyExample(answers: CapabilityDraftAnswers) {
    setWho(answers.who);
    setAchieve(answers.achieve);
    setMethod(answers.method);
  }

  function useDraft() {
    if (!generated) return;
    onChange(generated);
    onApplyPrimary?.(generated);
  }

  return (
    <div className="space-y-4 rounded-md border border-[color:var(--line)] bg-[color:var(--paper-warm)]/70 p-4">
      <div>
        <p className="text-sm font-semibold text-primary">
          Build your capability statement
        </p>
        <p className="mt-1 text-xs leading-relaxed text-[color:var(--foreground)]/70">
          Employers should see what you help people achieve — not just a job
          title. Answer a few prompts, then edit the draft.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example.label}
            type="button"
            className="rounded-full border border-[color:var(--line)] bg-white px-3 py-1 text-xs font-medium text-primary"
            onClick={() => applyExample(example.answers)}
          >
            Try {example.label} example
          </button>
        ))}
      </div>

      <label className="block text-sm">
        <span className="font-medium text-primary">Who do you help?</span>
        <input
          value={who}
          onChange={(e) => setWho(e.target.value)}
          className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
          placeholder="e.g. GCSE students, small businesses, commercial clients"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-primary">
          What do you help them achieve?
        </span>
        <input
          value={achieve}
          onChange={(e) => setAchieve(e.target.value)}
          className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
          placeholder="e.g. improve exam confidence, stand out with branding"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-primary">
          How do you usually do that? (optional)
        </span>
        <input
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
          placeholder="e.g. lesson plans, commercial installs, brand identity work"
        />
      </label>

      <div className="rounded-md border border-dashed border-[color:var(--line)] bg-white px-3 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--ink-soft)]">
          Draft
        </p>
        <p className="mt-1 text-sm font-medium text-[color:var(--ink)]">
          {generated || "Answer the questions above to generate a first draft."}
        </p>
        <button
          type="button"
          disabled={!generated}
          onClick={useDraft}
          className="btn-primary mt-3 rounded-md px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
        >
          Use this draft
        </button>
      </div>

      <label className="block text-sm">
        <span className="font-medium text-primary">
          Your capability statement
        </span>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, 300))}
          rows={3}
          className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
          placeholder="Edit freely after generating a draft…"
        />
        <span className="mt-1 block text-xs text-[color:var(--foreground)]/60">
          This becomes the first thing employers see on your profile and
          applications.
        </span>
      </label>
    </div>
  );
}
