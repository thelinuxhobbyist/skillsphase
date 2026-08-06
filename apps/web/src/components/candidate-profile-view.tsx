import type { ReactNode } from "react";
import { AVAILABILITY_LABELS, REMOTE_TYPE_LABELS } from "@horizon/shared";
import type { CandidateDetail, Capability, Project } from "@/lib/api";
import { mediaUrl } from "@/lib/api";
import { formatUkDateLabel } from "@/lib/dates";

/**
 * Shared profile layout for public and employer detail views.
 * Capability-first hierarchy with progressive trust (ADR 002).
 */
export function CandidateProfileView({
  candidate,
  name,
  fallbackTitle,
  actions,
}: {
  candidate: CandidateDetail;
  name: string;
  fallbackTitle: string;
  actions?: ReactNode;
}) {
  const capabilities = candidate.capabilities ?? [];
  const projects = candidate.projects ?? [];
  const recommendations = candidate.recommendations ?? [];
  const exhibitIds = new Map(
    projects.map((project, index) => [project.id, exhibitLetter(index)]),
  );
  const location = [candidate.city, candidate.country].filter(Boolean).join(", ");
  const personLine = [name, location].filter(Boolean).join(" · ");
  const primaryCapability =
    capabilities.find((cap) => cap.isPrimary) ?? capabilities[0] ?? null;
  const additionalCapabilities = capabilities.filter(
    (cap) => cap.id !== primaryCapability?.id,
  );
  const capabilityLead =
    primaryCapability?.label ||
    candidate.primaryCapability ||
    candidate.professionalTitle ||
    name ||
    fallbackTitle;
  const titleLine = candidate.professionalTitle
    ? [candidate.professionalTitle, personLine].filter(Boolean).join(" · ")
    : personLine;
  const hasCapabilities =
    capabilities.length > 0 ||
    Boolean(candidate.primaryCapability) ||
    candidate.skills.length > 0;
  const hasProof = projects.length > 0;
  const hasTrustSignals =
    candidate.qualifications.length > 0 || recommendations.length > 0;

  return (
    <div className="min-w-0">
      <header className="rounded-sm border border-[color:var(--line)] bg-white px-6 py-8 shadow-[0_1px_0_var(--line)] sm:px-12 sm:py-11">
        <h1 className="font-display text-[32px] font-semibold leading-[1.05] text-primary sm:text-[44px]">
          {capabilityLead}
        </h1>
        {titleLine ? (
          <p className="mt-2.5 text-base text-[color:var(--ink-soft)]">
            {titleLine}
          </p>
        ) : null}

        {(candidate.availability || candidate.remotePreference) && (
          <div className="mt-[22px] flex flex-wrap gap-2">
            {candidate.availability ? (
              <span className="rounded-sm border border-primary bg-primary px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-primary-foreground">
                {AVAILABILITY_LABELS[candidate.availability]}
              </span>
            ) : null}
            {candidate.remotePreference ? (
              <span className="rounded-sm border border-[color:var(--line)] px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-[color:var(--ink-soft)]">
                {REMOTE_TYPE_LABELS[candidate.remotePreference]}
              </span>
            ) : null}
          </div>
        )}
      </header>

      {actions ? (
        <div className="mt-6 flex flex-col items-start justify-between gap-6 rounded-sm border border-[color:var(--line)] bg-[color:var(--paper-warm)] px-7 py-[22px] sm:flex-row sm:items-center">
          {actions}
        </div>
      ) : null}

      {hasCapabilities ? (
        <section className="mt-16">
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--ink-soft)]">
            What they can do
          </p>
          <h2 className="mb-7 font-display text-[28px] font-semibold text-primary">
            Capabilities
          </h2>

          <div className="rounded-sm border border-[color:var(--line)] bg-white">
            {primaryCapability ? (
              <CapabilityLedgerRow
                capability={primaryCapability}
                exhibitIds={exhibitIds}
              />
            ) : candidate.primaryCapability ? (
              <div className="border-b border-[color:var(--line)] px-8 py-[26px] last:border-b-0">
                <span className="font-display text-[19px] font-semibold text-[color:var(--ink)]">
                  {candidate.primaryCapability}
                </span>
              </div>
            ) : null}

            {additionalCapabilities.map((capability) => (
              <div
                key={capability.id}
                className="border-b border-[color:var(--line)] px-8 py-5 font-display text-lg text-[color:var(--ink)] last:border-b-0"
              >
                {capability.label}
              </div>
            ))}

            {candidate.skills.length > 0 ? (
              <div className="px-8 py-[26px]">
                <span className="mb-3.5 block font-display text-[19px] font-semibold text-[color:var(--ink)]">
                  Skills
                </span>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-sm border border-[color:var(--line)] px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-[color:var(--ink-soft)]"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {hasProof ? (
        <section className="mt-16">
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--ink-soft)]">
            Evidence on file
          </p>
          <h2 className="mb-7 font-display text-[28px] font-semibold text-primary">
            Proof of Ability
          </h2>

          <div className="space-y-[18px]">
            {projects.map((project, index) => (
              <ExhibitCard
                key={project.id}
                project={project}
                letter={exhibitLetter(index)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {hasTrustSignals ? (
        <section className="mt-16">
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--ink-soft)]">
            Supporting trust signals
          </p>
          <h2 className="mb-3 font-display text-[28px] font-semibold text-primary">
            Certificates & recommendations
          </h2>
          <p className="mb-7 max-w-2xl text-sm text-[color:var(--ink-soft)]">
            Public summaries earn interest. Full certificates, reference letters,
            and other documents remain available upon request.
          </p>

          {candidate.qualifications.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {candidate.qualifications.map((row) => (
                <li
                  key={row.id}
                  className="rounded-sm border border-[color:var(--line)] bg-white px-5 py-4 text-sm"
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-soft)]">
                    Certificate
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold text-primary">
                    {row.name}
                  </p>
                  {row.issuingBody ? (
                    <p className="mt-0.5 text-[color:var(--ink-soft)]">
                      {row.issuingBody}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-[color:var(--ink-soft)]">
                    Full document — available upon request
                  </p>
                </li>
              ))}
            </ul>
          ) : null}

          {recommendations.length > 0 ? (
            <ul
              className={`space-y-[18px] ${
                candidate.qualifications.length > 0 ? "mt-6" : ""
              }`}
            >
              {recommendations.map((row) => (
                <li
                  key={row.id}
                  className="rounded-sm border border-[color:var(--line)] bg-white px-8 py-6"
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-soft)]">
                    Recommendation
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold text-primary">
                    {row.verificationStatus === "verified"
                      ? "Verified professional reference"
                      : "Professional reference"}
                  </p>
                  <p className="text-[13.5px] text-[color:var(--ink-soft)]">
                    {row.relationship}
                  </p>
                  {row.publicSummary ? (
                    <p className="mt-3 text-[14.5px] text-[color:var(--ink-soft)]">
                      <span className="font-semibold text-primary">Summary: </span>
                      {row.publicSummary}
                    </p>
                  ) : null}
                  {(row.keyThemes ?? []).length > 0 ? (
                    <ul className="mt-3 space-y-1 text-[13.5px] text-primary">
                      {row.keyThemes.map((theme) => (
                        <li key={`${row.id}-${theme}`}>✓ {theme}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {candidate.salaryMin || candidate.salaryMax ? (
        <section className="mt-16">
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--ink-soft)]">
            Supporting context
          </p>
          <h2 className="mb-5 font-display text-[22px] font-semibold text-primary">
            Rate expectations
          </h2>
          <div className="rounded-sm border border-[color:var(--line)] bg-white px-6 py-4 sm:max-w-sm">
            <p className="text-[14.5px] text-[color:var(--ink-soft)]">
              {candidate.salaryCurrency} {candidate.salaryMin ?? "?"} –{" "}
              {candidate.salaryMax ?? "?"}
            </p>
          </div>
        </section>
      ) : null}

      {candidate.employmentHistory.length > 0 ? (
        <section className="mt-16">
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--ink-soft)]">
            Supporting context
          </p>
          <h2 className="mb-5 font-display text-[22px] font-semibold text-primary">
            Work history
          </h2>
          <ul className="space-y-4 border-l border-[color:var(--line)] pl-4">
            {candidate.employmentHistory.map((role) => (
              <li key={role.id} className="relative text-sm">
                <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-primary" />
                <p className="font-semibold text-primary">{role.jobTitle}</p>
                <p className="text-[color:var(--ink-soft)]">{role.employerName}</p>
                <p className="text-xs text-[color:var(--ink-soft)]/80">
                  {formatUkDateLabel(role.startDate)} –{" "}
                  {role.currentlyWorking
                    ? "Present"
                    : formatUkDateLabel(role.endDate)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {candidate.education.length > 0 ? (
        <section className="mt-16">
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--ink-soft)]">
            Supporting context
          </p>
          <h2 className="mb-5 font-display text-[22px] font-semibold text-primary">
            Education
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {candidate.education.map((row) => (
              <li
                key={row.id}
                className="rounded-sm border border-[color:var(--line)] bg-white px-5 py-4 text-sm"
              >
                <p className="font-display text-lg font-semibold text-primary">
                  {row.qualification}
                </p>
                <p className="text-[color:var(--ink-soft)]">{row.institution}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {candidate.careerSummary ? (
        <section className="mt-16 rounded-sm border border-[color:var(--line)] bg-[color:var(--paper-warm)] px-8 py-[30px]">
          <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--ink-soft)]">
            About
          </p>
          <p className="font-display text-[19px] leading-[1.5] text-primary italic">
            “{candidate.careerSummary}”
          </p>
        </section>
      ) : null}
    </div>
  );
}

function CapabilityLedgerRow({
  capability,
  exhibitIds,
}: {
  capability: Capability;
  exhibitIds: Map<string, string>;
}) {
  return (
    <div className="border-b border-[color:var(--line)] px-8 py-[26px] last:border-b-0">
      <div className="mb-2 flex flex-wrap items-baseline gap-3">
        <span className="font-display text-[19px] font-semibold text-[color:var(--ink)]">
          {capability.label}
        </span>
        {capability.isPrimary ? (
          <span className="text-[12px] font-medium text-[color:var(--ink-soft)]">
            Primary
          </span>
        ) : null}
      </div>

      {capability.projects.length > 0 ? (
        <p className="mb-3 text-[13px] text-[color:var(--ink-soft)]">
          Supported by{" "}
          {capability.projects.map((project, index) => {
            const letter = exhibitIds.get(project.id);
            const href = letter ? `#exhibit-${letter.toLowerCase()}` : undefined;
            return (
              <span key={project.id}>
                {index > 0 ? ", " : null}
                {href ? (
                  <a
                    href={href}
                    className="text-primary no-underline [border-bottom:1px_dotted_currentColor]"
                  >
                    → Exhibit {letter}, {project.title}
                  </a>
                ) : (
                  project.title
                )}
              </span>
            );
          })}
        </p>
      ) : null}

      {capability.skillNames.length > 0 ? (
        <div className="mt-3.5 flex flex-wrap gap-2">
          {capability.skillNames.map((skill) => (
            <span
              key={`${capability.id}-${skill}`}
              className="rounded-sm border border-[color:var(--line)] px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-[color:var(--ink-soft)]"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : null}

      {capability.outcomes.map((outcome) => (
        <p
          key={`${capability.id}-${outcome}`}
          className="mt-3 border-l-2 border-primary/30 pl-3.5 text-[14.5px] text-primary"
        >
          {outcome}
        </p>
      ))}
    </div>
  );
}

function ExhibitCard({
  project,
  letter,
}: {
  project: Project;
  letter: string;
}) {
  const technologies = project.technologies ?? [];
  const hasLinks = Boolean(project.projectUrl) || project.media.length > 0;

  return (
    <article
      id={`exhibit-${letter.toLowerCase()}`}
      className="rounded-sm border border-[color:var(--line)] border-l-[3px] border-l-primary bg-white px-8 py-[30px]"
    >
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-soft)]">
        Exhibit {letter}
      </p>
      <h3 className="font-display text-[21px] font-semibold text-primary">
        {project.title}
      </h3>
      {project.role ? (
        <p className="mt-1 mb-4 text-[13.5px] text-[color:var(--ink-soft)]">
          {project.role}
        </p>
      ) : (
        <div className="mb-4" />
      )}

      {project.outcome ? (
        <p className="mb-2 text-[15px] font-semibold text-primary">
          {project.outcome}
        </p>
      ) : null}
      {project.description ? (
        <p className="mb-4 text-[14.5px] text-[color:var(--ink-soft)]">
          {project.description}
        </p>
      ) : null}

      {technologies.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <span
              key={`${project.id}-${tech}`}
              className="rounded-sm border border-[color:var(--line)] px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-[color:var(--ink-soft)]"
            >
              {tech}
            </span>
          ))}
        </div>
      ) : null}

      {hasLinks ? (
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {project.projectUrl ? (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary underline"
            >
              View project
            </a>
          ) : null}
          {project.media.map((item, index) => (
            <a
              key={`${item.url}-${index}`}
              href={mediaUrl(item.url)}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              {item.label || mediaLabel(item.type)}
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function mediaLabel(type: Project["media"][number]["type"]) {
  switch (type) {
    case "image":
      return "Screenshot";
    case "video":
      return "Video";
    case "document":
      return "Document";
    case "link":
      return "Link";
  }
}

function exhibitLetter(index: number) {
  return String.fromCharCode(65 + (index % 26));
}
