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
  const qualifications = candidate.qualifications ?? [];
  const employmentHistory = candidate.employmentHistory ?? [];
  const education = candidate.education ?? [];
  const skills = candidate.skills ?? [];

  const location = [candidate.city, candidate.country].filter(Boolean).join(", ");
  const candidateName =
    name.trim() ||
    [candidate.firstName, candidate.lastName].filter(Boolean).join(" ") ||
    "Candidate";

  const primaryCapability =
    capabilities.find((cap) => cap.isPrimary) ?? capabilities[0] ?? null;

  const capabilityLead =
    candidate.professionalTitle ||
    primaryCapability?.label ||
    candidate.primaryCapability ||
    fallbackTitle;

  // Assign consistent exhibit letters across all projects
  const exhibitMap = new Map<string, string>();
  const projectById = new Map<string, Project>();

  projects.forEach((proj, idx) => {
    exhibitMap.set(proj.id, exhibitLetter(idx));
    projectById.set(proj.id, proj);
  });

  const renderedProjectIds = new Set<string>();

  const hasHighlights =
    capabilities.length > 0 ||
    Boolean(candidate.primaryCapability) ||
    projects.length > 0;

  const hasTrustSignals =
    qualifications.length > 0 || recommendations.length > 0;

  const hasSupportingContext =
    employmentHistory.length > 0 ||
    education.length > 0 ||
    Boolean(candidate.salaryMin || candidate.salaryMax);

  return (
    <div className="min-w-0 space-y-12">
      {/* 1. Introduction: Hero & Professional Summary */}
      <section className="rounded-sm border border-[color:var(--line)] bg-white p-8 sm:p-11 shadow-[0_1px_0_var(--line)]">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--ink-soft)] font-medium">
            Candidate Profile
          </p>
          <h1 className="font-display text-3xl font-bold leading-[1.1] text-primary sm:text-4xl">
            {candidateName}
          </h1>
          <p className="text-xl font-semibold text-[color:var(--ink)]">
            {capabilityLead}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[color:var(--ink-soft)]">
            {location ? (
              <span className="flex items-center gap-1">
                <span className="text-[13px]">📍</span> {location}
              </span>
            ) : null}
            {candidate.availability ? (
              <span className="rounded-sm border border-primary bg-primary px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.05em] text-primary-foreground font-medium">
                {AVAILABILITY_LABELS[candidate.availability]}
              </span>
            ) : null}
            {candidate.remotePreference ? (
              <span className="rounded-sm border border-[color:var(--line)] bg-[color:var(--paper-warm)] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.05em] text-[color:var(--ink-soft)] font-medium">
                {REMOTE_TYPE_LABELS[candidate.remotePreference]}
              </span>
            ) : null}
          </div>
        </div>

        {/* Profile / Career Summary */}
        {candidate.careerSummary ? (
          <div className="mt-8 border-t border-[color:var(--line)] pt-7">
            <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--ink-soft)] font-medium">
              Professional Summary
            </p>
            <p className="font-display text-[18px] leading-[1.65] text-primary italic">
              “{candidate.careerSummary}”
            </p>
          </div>
        ) : null}
      </section>

      {/* 2. Skills */}
      {skills.length > 0 ? (
        <section className="rounded-sm border border-[color:var(--line)] bg-white p-8 sm:p-10 shadow-[0_1px_0_var(--line)]">
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--ink-soft)] font-medium">
            What they can do
          </p>
          <h2 className="mb-2 font-display text-2xl font-semibold text-primary">
            Skills & Core Strengths
          </h2>
          <p className="mb-6 text-sm text-[color:var(--ink-soft)]">
            Technical competencies, domain expertise, and core skills.
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="rounded-sm border border-[color:var(--line)] bg-[color:var(--paper-warm)] px-3 py-1.5 font-mono text-[11.5px] font-medium uppercase tracking-[0.04em] text-primary"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {/* 3. Highlights (Capabilities + Proof of Ability merged) */}
      {hasHighlights ? (
        <section className="rounded-sm border border-[color:var(--line)] bg-white p-8 sm:p-10 shadow-[0_1px_0_var(--line)]">
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--ink-soft)] font-medium">
            Why should I interview them?
          </p>
          <h2 className="mb-2 font-display text-2xl font-semibold text-primary">
            Highlights & Proof of Ability
          </h2>
          <p className="mb-8 text-sm text-[color:var(--ink-soft)]">
            Capability claims paired directly with supporting evidence and project exhibits.
          </p>

          <div className="space-y-8">
            {capabilities.map((capability) => {
              const capProjects = (capability.projects ?? [])
                .map((p) => projectById.get(p.id))
                .filter((p): p is Project => Boolean(p));

              capProjects.forEach((p) => renderedProjectIds.add(p.id));

              return (
                <div
                  key={capability.id}
                  className="rounded-sm border border-[color:var(--line)] bg-white p-6 sm:p-7 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-xl font-semibold text-primary">
                      {capability.label}
                    </h3>
                    {capability.isPrimary ? (
                      <span className="rounded-sm bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] font-semibold text-primary">
                        Primary Capability
                      </span>
                    ) : null}
                  </div>

                  {/* Outcomes / Achievements */}
                  {capability.outcomes.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-soft)] font-medium">
                        Key Achievements & Impact
                      </p>
                      <ul className="space-y-2">
                        {capability.outcomes.map((outcome) => (
                          <li
                            key={`${capability.id}-${outcome}`}
                            className="flex items-start gap-2.5 text-[15px] text-primary"
                          >
                            <span className="mt-1 text-xs text-primary font-bold">✓</span>
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {/* Skills tagged to capability */}
                  {capability.skillNames.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {capability.skillNames.map((skill) => (
                        <span
                          key={`${capability.id}-${skill}`}
                          className="rounded-sm border border-[color:var(--line)] bg-[color:var(--paper-warm)] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--ink-soft)]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {/* Inline Supporting Evidence / Exhibit cards */}
                  {capProjects.length > 0 ? (
                    <div className="mt-6 border-t border-[color:var(--line)] pt-5 space-y-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-soft)] font-medium">
                        Supporting Evidence ({capProjects.length})
                      </p>
                      <div className="space-y-4">
                        {capProjects.map((project) => (
                          <ExhibitCard
                            key={project.id}
                            project={project}
                            letter={exhibitMap.get(project.id) ?? "A"}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}

            {/* Standalone primary capability if no capability objects exist */}
            {capabilities.length === 0 && candidate.primaryCapability ? (
              <div className="rounded-sm border border-[color:var(--line)] p-6 bg-white">
                <h3 className="font-display text-xl font-semibold text-primary">
                  {candidate.primaryCapability}
                </h3>
              </div>
            ) : null}

            {/* Standalone projects not attached to a capability */}
            {projects.filter((p) => !renderedProjectIds.has(p.id)).length > 0 ? (
              <div className="pt-4 space-y-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--ink-soft)] font-medium">
                  Additional Proof of Ability
                </p>
                <div className="space-y-4">
                  {projects
                    .filter((p) => !renderedProjectIds.has(p.id))
                    .map((project) => (
                      <ExhibitCard
                        key={project.id}
                        project={project}
                        letter={exhibitMap.get(project.id) ?? "A"}
                      />
                    ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* 4. Trust (Certificates & Recommendations) */}
      {hasTrustSignals ? (
        <section className="rounded-sm border border-[color:var(--line)] bg-white p-8 sm:p-10 shadow-[0_1px_0_var(--line)]">
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--ink-soft)] font-medium">
            Can I trust them?
          </p>
          <h2 className="mb-2 font-display text-2xl font-semibold text-primary">
            Trust & Verification
          </h2>
          <p className="mb-7 max-w-2xl text-sm text-[color:var(--ink-soft)]">
            Certificates, professional registrations, and verified references on file.
          </p>

          <div className="space-y-7">
            {qualifications.length > 0 ? (
              <div>
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-soft)] font-medium">
                  Certificates & Qualifications ({qualifications.length})
                </p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {qualifications.map((row) => (
                    <li
                      key={row.id}
                      className="rounded-sm border border-[color:var(--line)] bg-[color:var(--paper-warm)] px-5 py-4 text-sm"
                    >
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--ink-soft)]">
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
                      <p className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.05em] text-[color:var(--ink-soft)]">
                        Full document — available upon request
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {recommendations.length > 0 ? (
              <div
                className={
                  qualifications.length > 0
                    ? "pt-6 border-t border-[color:var(--line)]"
                    : ""
                }
              >
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-soft)] font-medium">
                  References & Recommendations ({recommendations.length})
                </p>
                <ul className="space-y-4">
                  {recommendations.map((row) => (
                    <li
                      key={row.id}
                      className="rounded-sm border border-[color:var(--line)] bg-white px-7 py-6"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-display text-lg font-semibold text-primary">
                          {row.verificationStatus === "verified"
                            ? "Verified Professional Reference"
                            : "Professional Reference"}
                        </p>
                        {row.verificationStatus === "verified" ? (
                          <span className="rounded-sm bg-emerald-100 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] font-semibold text-emerald-800">
                            Verified ✓
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-sm text-[color:var(--ink-soft)]">
                        {row.relationship}
                      </p>
                      {row.publicSummary ? (
                        <p className="mt-3 text-[14.5px] text-[color:var(--ink-soft)] leading-relaxed">
                          <span className="font-semibold text-primary">
                            Summary:{" "}
                          </span>
                          “{row.publicSummary}”
                        </p>
                      ) : null}
                      {(row.keyThemes ?? []).length > 0 ? (
                        <ul className="mt-3.5 flex flex-wrap gap-2 text-xs">
                          {row.keyThemes.map((theme) => (
                            <li
                              key={`${row.id}-${theme}`}
                              className="rounded-sm border border-[color:var(--line)] bg-[color:var(--paper-warm)] px-2.5 py-1 text-primary"
                            >
                              ✓ {theme}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* 5. Supporting Context */}
      {hasSupportingContext ? (
        <section className="rounded-sm border border-[color:var(--line)] bg-white p-8 sm:p-10 shadow-[0_1px_0_var(--line)]">
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--ink-soft)] font-medium">
            Anything else I should know?
          </p>
          <h2 className="mb-2 font-display text-2xl font-semibold text-primary">
            Supporting Context
          </h2>
          <p className="mb-7 text-sm text-[color:var(--ink-soft)]">
            Background timeline, education, and rate expectations.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Work History */}
            {employmentHistory.length > 0 ? (
              <div className="space-y-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-soft)] font-medium">
                  Work History
                </p>
                <ul className="space-y-4 border-l border-[color:var(--line)] pl-4">
                  {employmentHistory.map((role) => (
                    <li key={role.id} className="relative text-sm">
                      <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-primary" />
                      <p className="font-semibold text-primary">
                        {role.jobTitle}
                      </p>
                      <p className="text-[color:var(--ink-soft)]">
                        {role.employerName}
                      </p>
                      <p className="text-xs text-[color:var(--ink-soft)]/80">
                        {formatUkDateLabel(role.startDate)} –{" "}
                        {role.currentlyWorking
                          ? "Present"
                          : formatUkDateLabel(role.endDate)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Education & Rate Expectations */}
            <div className="space-y-6">
              {education.length > 0 ? (
                <div className="space-y-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-soft)] font-medium">
                    Education
                  </p>
                  <ul className="space-y-3">
                    {education.map((row) => (
                      <li
                        key={row.id}
                        className="rounded-sm border border-[color:var(--line)] bg-[color:var(--paper-warm)] px-4 py-3 text-sm"
                      >
                        <p className="font-display font-semibold text-primary">
                          {row.qualification}
                        </p>
                        <p className="text-[13px] text-[color:var(--ink-soft)]">
                          {row.institution}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {candidate.salaryMin || candidate.salaryMax ? (
                <div className="space-y-2">
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-soft)] font-medium">
                    Rate Expectations
                  </p>
                  <div className="rounded-sm border border-[color:var(--line)] bg-[color:var(--paper-warm)] px-4 py-3 text-sm">
                    <p className="font-semibold text-primary">
                      {candidate.salaryCurrency} {candidate.salaryMin ?? "?"} –{" "}
                      {candidate.salaryMax ?? "?"}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* 6. Action Call to Action (at the very bottom of the story) */}
      {actions ? (
        <section className="rounded-sm border border-[color:var(--line)] bg-[color:var(--paper-warm)] p-8 sm:p-10 shadow-[0_1px_0_var(--line)]">
          {actions}
        </section>
      ) : null}
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
      className="rounded-sm border border-[color:var(--line)] border-l-[3px] border-l-primary bg-white p-6 sm:p-7 space-y-3"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-soft)] font-medium">
          Exhibit {letter}
        </p>
        {project.role ? (
          <span className="text-xs text-[color:var(--ink-soft)] font-medium">
            Role: {project.role}
          </span>
        ) : null}
      </div>

      <h4 className="font-display text-lg font-semibold text-primary">
        {project.title}
      </h4>

      {project.outcome ? (
        <p className="text-[14.5px] font-semibold text-primary">
          {project.outcome}
        </p>
      ) : null}
      {project.description ? (
        <p className="text-sm text-[color:var(--ink-soft)] leading-relaxed">
          {project.description}
        </p>
      ) : null}

      {technologies.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {technologies.map((tech) => (
            <span
              key={`${project.id}-${tech}`}
              className="rounded-sm border border-[color:var(--line)] bg-[color:var(--paper-warm)] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--ink-soft)]"
            >
              {tech}
            </span>
          ))}
        </div>
      ) : null}

      {hasLinks ? (
        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 text-xs">
          {project.projectUrl ? (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary underline hover:text-primary/80"
            >
              View project ↗
            </a>
          ) : null}
          {project.media.map((item, index) => (
            <a
              key={`${item.url}-${index}`}
              href={mediaUrl(item.url)}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline hover:text-primary/80"
            >
              {item.label || mediaLabel(item.type)} ↗
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

