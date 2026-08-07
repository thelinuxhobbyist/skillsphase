import type { ReactNode } from "react";

/** Shared example SkillsPhase profile fields for homepage product demos. */
export const PROFILE_EXAMPLE_FIELDS = [
  {
    id: 1,
    label: "Capabilities",
    title: "Helps GCSE students improve confidence and exam performance",
  },
  {
    id: 2,
    label: "Evidence",
    title: "Lesson plans · Student outcomes · Parent testimonials",
  },
  {
    id: 3,
    label: "Impact",
    title: "Raised cohort pass rate from 62% to 84% over two years",
  },
  {
    id: 4,
    label: "Skills",
    chips: ["Lesson planning", "Assessment design", "Classroom leadership"],
  },
  {
    id: 5,
    label: "Trust signals",
    title: "DBS Check — Available upon request",
  },
  {
    id: 6,
    label: "Availability",
    title: "Ready to apply · Open to full-time roles",
  },
] as const;

export function ProfileShell({
  activeCount = PROFILE_EXAMPLE_FIELDS.length,
  tilted = false,
}: {
  activeCount?: number;
  tilted?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={`relative rounded-[18px] border border-[color:var(--line)] bg-white p-[26px] shadow-[0_20px_50px_-20px_rgba(11,23,18,0.25)] ${
        tilted ? "rotate-[0.6deg]" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[18px] [mask-composite:exclude] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [padding:1px] [background:linear-gradient(135deg,color-mix(in_oklch,var(--primary)_35%,transparent),transparent_40%)]" />

      <div className="mb-[18px] flex gap-1.5">
        <span className="size-2 rounded-full bg-[color:var(--line)]" />
        <span className="size-2 rounded-full bg-[color:var(--line)]" />
        <span className="size-2 rounded-full bg-[color:var(--line)]" />
      </div>

      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[21px] font-semibold text-[color:var(--ink)]">
            Helps GCSE students improve exam performance
          </p>
          <p className="mt-[3px] text-[13px] text-[color:var(--ink-soft)]">
            Teacher · Leeds · Example application profile
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_oklch,var(--primary)_18%,white)] px-2.5 py-1.5 text-[11.5px] font-bold tracking-[0.02em] text-[color:var(--stamp-dark,var(--primary))]">
          <span className="size-1.5 rounded-full bg-primary" />
          Available
        </span>
      </div>

      {PROFILE_EXAMPLE_FIELDS.map((field, index) => {
        const active = index < activeCount;
        return (
          <div
            key={field.id}
            className={`border-t border-[color:var(--line)] py-4 transition-[opacity,filter,transform] duration-500 ease-out ${
              active
                ? "translate-y-0 opacity-100 grayscale-0"
                : "translate-y-1 opacity-[0.28] grayscale-[0.4]"
            }`}
          >
            <p className="mb-2 flex items-center gap-[7px] font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--stamp-dark,var(--primary))]">
              <span className="inline-flex size-[15px] shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {field.id}
              </span>
              {field.label}
            </p>
            {"chips" in field && field.chips ? (
              <div className="flex flex-wrap gap-[7px]">
                {field.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-lg border border-[color:var(--line)] bg-[color:var(--paper-warm)] px-2.5 py-[5px] text-[12.5px] font-medium text-[color:var(--ink)]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            ) : "title" in field && field.title ? (
              <p className="text-[15px] font-semibold text-[color:var(--ink)]">
                {field.title}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function DiscoverySearchMock() {
  return (
    <div
      aria-hidden
      className="rounded-[18px] border border-[color:var(--line)] bg-white p-[22px] shadow-[0_20px_50px_-20px_rgba(11,23,18,0.25)]"
    >
      <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-[color:var(--line)] px-4 py-3.5 text-[14.5px] text-[color:var(--ink-soft)]">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="shrink-0"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <span className="flex-1">Warehouse, teaching, electrical, nursing, software…</span>
        <span className="rounded-md bg-[color:var(--paper-warm)] px-2.5 py-1 text-xs text-[color:var(--ink-soft)]">
          Available now
        </span>
      </div>

      <ul className="space-y-1">
        {[
          {
            initials: "PR",
            name: "Priya R.",
            role: "Teacher · Improves GCSE exam performance & confidence",
            skill: "Lesson Planning",
            tone: "bg-primary",
          },
          {
            initials: "MT",
            name: "Marcus T.",
            role: "Warehouse Operative · FLT license & inventory control",
            skill: "Forklift Driver",
            tone: "bg-emerald-700",
          },
          {
            initials: "JM",
            name: "Jordan M.",
            role: "Electrician · Commercial wiring & 18th edition testing",
            skill: "18th Edition",
            tone: "bg-slate-700",
          },
          {
            initials: "SK",
            name: "Sarah K.",
            role: "Registered Nurse · Patient care & acute clinical triage",
            skill: "NMC Registered",
            tone: "bg-teal-700",
          },
          {
            initials: "AL",
            name: "Aisha L.",
            role: "Designer · Creates brand identities that convert",
            skill: "Brand Design",
            tone: "bg-amber-700",
          },
        ].map((row, index) => (
          <li
            key={row.name}
            className={`flex items-center gap-3.5 px-1.5 py-3 ${
              index === 0 ? "" : "border-t border-[color:var(--line)]"
            }`}
          >
            <span
              className={`inline-flex size-[42px] shrink-0 items-center justify-center rounded-full font-display text-[15px] font-semibold text-white ${row.tone}`}
            >
              {row.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-[color:var(--ink)]">
                {row.name}
              </p>
              <p className="truncate text-[12.5px] text-[color:var(--ink-soft)]">
                {row.role}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-[color:var(--ink-soft)]">
                Top skill
              </p>
              <p className="text-[13.5px] font-semibold text-[color:var(--stamp-dark,var(--primary))]">
                {row.skill}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

}

export function StepIcon({ index }: { index: number }) {
  const icons = [
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </>,
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>,
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </>,
  ];
  return (
    <span className="relative z-[2] mx-auto inline-flex size-[58px] items-center justify-center rounded-full border-[1.5px] border-[color-mix(in_oklch,var(--primary)_40%,var(--line))] bg-white text-primary">
      <svg
        viewBox="0 0 24 24"
        className="size-[22px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {icons[index] ?? icons[0]}
      </svg>
    </span>
  );
}

/** Kept for optional admin previews; journey section now uses text pills. */
export function JourneyIcon({
  name,
  compact = false,
}: {
  name: string;
  compact?: boolean;
}) {
  void name;
  return (
    <span
      className={
        compact
          ? "inline-flex size-7 shrink-0 items-center justify-center text-primary"
          : "inline-flex size-10 items-center justify-center rounded-lg border border-[color:var(--line)] bg-[color:var(--paper-warm)] text-primary"
      }
    >
      <svg
        viewBox="0 0 24 24"
        className={compact ? "size-4" : "size-5"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="7" />
      </svg>
    </span>
  );
}

export type JourneyIconName = string;
export type JourneyPaths = Record<string, ReactNode>;
