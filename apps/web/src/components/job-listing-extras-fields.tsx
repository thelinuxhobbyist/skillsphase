"use client";

export type JobListingExtrasState = {
  niceToHaveSkills: string;
  companyAbout: string;
  companySize: string;
  benefits: string;
  whyReturners: string;
  applicationProcess: string;
  workingPatternDetail: string;
  contractDetails: string;
};

export const emptyJobListingExtras = (): JobListingExtrasState => ({
  niceToHaveSkills: "",
  companyAbout: "",
  companySize: "",
  benefits: "",
  whyReturners: "",
  applicationProcess: "",
  workingPatternDetail: "",
  contractDetails: "",
});

/** Split textarea / comma lists into trimmed non-empty lines or tokens. */
export function parseListField(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function JobListingExtrasFields({
  value,
  onChange,
}: {
  value: JobListingExtrasState;
  onChange: (next: JobListingExtrasState) => void;
}) {
  function set<K extends keyof JobListingExtrasState>(
    key: K,
    next: JobListingExtrasState[K],
  ) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="space-y-4 rounded-md border border-[color:var(--line)] bg-white/60 p-4">
      <div>
        <h3 className="font-semibold text-brand">Listing details</h3>
        <p className="mt-1 text-sm text-[color:var(--foreground)]/70">
          Optional — these appear on the public job page. Leave blank to hide a
          section.
        </p>
      </div>

      <label className="block text-sm">
        <span className="font-medium text-brand">Nice-to-have skills</span>
        <input
          value={value.niceToHaveSkills}
          onChange={(e) => set("niceToHaveSkills", e.target.value)}
          placeholder="e.g. SaaS experience, Change management"
          className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
        />
        <p className="mt-1 text-xs text-[color:var(--foreground)]/60">
          Comma-separated. Essential skills are the required list above.
        </p>
      </label>

      <label className="block text-sm">
        <span className="font-medium text-brand">Location &amp; working pattern detail</span>
        <textarea
          rows={3}
          value={value.workingPatternDetail}
          onChange={(e) => set("workingPatternDetail", e.target.value)}
          placeholder="e.g. Hybrid — 2 days in Leeds office, flexible hours within 08:00–18:00"
          className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-brand">Contract details</span>
        <input
          value={value.contractDetails}
          onChange={(e) => set("contractDetails", e.target.value)}
          placeholder="e.g. Permanent · Full-time · 37.5 hours per week"
          className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-brand">Benefits</span>
        <textarea
          rows={4}
          value={value.benefits}
          onChange={(e) => set("benefits", e.target.value)}
          placeholder={"One per line, e.g.\nHybrid working\nPension contribution\nLearning budget"}
          className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-brand">
          Why this role is returner-friendly
        </span>
        <textarea
          rows={4}
          value={value.whyReturners}
          onChange={(e) => set("whyReturners", e.target.value)}
          placeholder={"One per line, e.g.\nCareer breaks welcomed\nPhased return options\nStructured onboarding"}
          className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-brand">Application process</span>
        <textarea
          rows={4}
          value={value.applicationProcess}
          onChange={(e) => set("applicationProcess", e.target.value)}
          placeholder={"One step per line, e.g.\nApply via Project Horizon\nSkills review\nInterview\nDecision within two weeks"}
          className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-brand">About the company</span>
        <textarea
          rows={4}
          value={value.companyAbout}
          onChange={(e) => set("companyAbout", e.target.value)}
          placeholder="Short description of what the employer does"
          className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-brand">Organisation size</span>
        <input
          value={value.companySize}
          onChange={(e) => set("companySize", e.target.value)}
          placeholder="e.g. 50–150 employees"
          className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
        />
      </label>
    </div>
  );
}

export function extrasPayload(value: JobListingExtrasState) {
  return {
    niceToHaveSkillNames: parseListField(value.niceToHaveSkills),
    companyAbout: value.companyAbout.trim() || null,
    companySize: value.companySize.trim() || null,
    benefits: parseListField(value.benefits),
    whyReturners: parseListField(value.whyReturners),
    applicationProcess: parseListField(value.applicationProcess),
    workingPatternDetail: value.workingPatternDetail.trim() || null,
    contractDetails: value.contractDetails.trim() || null,
  };
}
