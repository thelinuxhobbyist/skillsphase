import type { ReactNode } from "react";
import { AVAILABILITY_LABELS, REMOTE_TYPE_LABELS } from "@horizon/shared";
import type { CandidateDetail } from "@/lib/api";
import { mediaUrl } from "@/lib/api";
import { formatUkDateLabel } from "@/lib/dates";

/**
 * Shared profile layout for both the public taster view and the employer
 * discovery detail view. Skills and evidence come first — this is a
 * skills-first platform, not a CV. Written self-description (if any) is
 * optional and sits at the bottom.
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
  const recommendations = candidate.recommendations ?? [];
  const hasEvidence =
    candidate.projects.length > 0 ||
    candidate.qualifications.length > 0 ||
    recommendations.length > 0 ||
    candidate.education.length > 0;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-primary sm:text-4xl">
            {candidate.professionalTitle || name || fallbackTitle}
          </h1>
          <p className="mt-1 text-[color:var(--foreground)]/75">
            {name}
            {candidate.city ? ` · ${candidate.city}` : ""}
            {candidate.country ? `, ${candidate.country}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {candidate.availability ? (
            <span className="rounded-full bg-brand-accent/10 px-3 py-1 font-medium text-primary-accent">
              {AVAILABILITY_LABELS[candidate.availability]}
            </span>
          ) : null}
          {candidate.remotePreference ? (
            <span className="rounded-full bg-brand/10 px-3 py-1 font-medium text-primary">
              {REMOTE_TYPE_LABELS[candidate.remotePreference]}
            </span>
          ) : null}
        </div>
      </div>

      {actions ? <div className="mt-6">{actions}</div> : null}

      {/* Skills — the primary section. This is what employers should see first. */}
      {candidate.skills.length > 0 ? (
        <section className="mt-8 rounded-lg border border-brand/20 bg-[color:var(--surface)] p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-accent">
            What they can do
          </p>
          <h2 className="mt-1 font-display text-xl text-primary">
            Core Skills
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {candidate.skills.map((skill) => (
              <span
                key={skill.id}
                className="rounded-md border border-brand/30 bg-white px-3.5 py-2 text-sm font-semibold text-primary shadow-sm"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {/* Experience snapshot — directly beneath skills. */}
      {candidate.yearsExperience != null ||
      candidate.salaryMin ||
      candidate.salaryMax ? (
        <section className="mt-4 grid gap-3 sm:grid-cols-2">
          {candidate.yearsExperience != null ? (
            <div className="rounded-md border border-[color:var(--line)] bg-white p-4">
              <p className="text-2xl font-semibold text-primary">
                {candidate.yearsExperience}
                <span className="ml-1 text-sm font-medium text-[color:var(--foreground)]/60">
                  years experience
                </span>
              </p>
            </div>
          ) : null}
          {candidate.salaryMin || candidate.salaryMax ? (
            <div className="rounded-md border border-[color:var(--line)] bg-white p-4">
              <p className="text-sm font-semibold text-primary">Rate expectations</p>
              <p className="mt-1 text-sm text-[color:var(--foreground)]/75">
                {candidate.salaryCurrency} {candidate.salaryMin ?? "?"} –{" "}
                {candidate.salaryMax ?? "?"}
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Evidence — proof of ability, before employment history. */}
      {hasEvidence ? (
        <section className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-accent">
            Evidence
          </p>
          <h2 className="mt-1 font-display text-xl text-primary">
            Proof of Ability
          </h2>

          {candidate.projects.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {candidate.projects.map((project) => (
                <li
                  key={project.id}
                  className="rounded-lg border border-[color:var(--line)] bg-white p-4 shadow-sm"
                >
                  <p className="font-semibold text-primary">{project.title}</p>
                  {project.role ? (
                    <p className="text-sm text-[color:var(--foreground)]/70">
                      {project.role}
                    </p>
                  ) : null}
                  {project.description ? (
                    <p className="mt-2 text-sm text-[color:var(--foreground)]/80">
                      {project.description}
                    </p>
                  ) : null}
                  {project.projectUrl ? (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm font-semibold text-primary underline"
                    >
                      View project
                    </a>
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
                </li>
              ))}
            </ul>
          ) : null}

          {candidate.qualifications.length > 0 ? (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {candidate.qualifications.map((row) => (
                <li
                  key={row.id}
                  className="rounded-md border border-[color:var(--line)] bg-white p-3 text-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-accent">
                    Certificate
                  </p>
                  <p className="font-semibold text-primary">{row.name}</p>
                  {row.issuingBody ? (
                    <p className="text-[color:var(--foreground)]/75">{row.issuingBody}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          {recommendations.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {recommendations.map((row) => (
                <li
                  key={row.id}
                  className="rounded-lg border border-[color:var(--line)] bg-white p-4 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-accent">
                    Recommendation
                  </p>
                  <p className="font-semibold text-primary">{row.authorName}</p>
                  <p className="text-sm text-[color:var(--foreground)]/70">
                    {row.relationship}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-[color:var(--foreground)]/80">
                    {row.body}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}

          {candidate.education.length > 0 ? (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {candidate.education.map((row) => (
                <li
                  key={row.id}
                  className="rounded-md border border-[color:var(--line)] bg-white p-3 text-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-accent">
                    Education
                  </p>
                  <p className="font-semibold text-primary">{row.qualification}</p>
                  <p className="text-[color:var(--foreground)]/75">{row.institution}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {/* Work history — a simple timeline, no long descriptions. */}
      {candidate.employmentHistory.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-xl text-primary">
            Work history
          </h2>
          <ul className="mt-4 space-y-4 border-l border-[color:var(--line)] pl-4">
            {candidate.employmentHistory.map((role) => (
              <li key={role.id} className="relative text-sm">
                <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand" />
                <p className="font-semibold text-primary">{role.jobTitle}</p>
                <p className="text-[color:var(--foreground)]/75">{role.employerName}</p>
                <p className="text-xs text-[color:var(--foreground)]/55">
                  {formatUkDateLabel(role.startDate)} –{" "}
                  {role.currentlyWorking ? "Present" : formatUkDateLabel(role.endDate)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* About — optional written context, secondary, at the bottom. */}
      {candidate.careerSummary ? (
        <section className="mt-10 rounded-md border border-[color:var(--line)] bg-[color:var(--surface)]/60 p-4">
          <h2 className="text-sm font-semibold text-primary">About</h2>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--foreground)]/80">
            {candidate.careerSummary}
          </p>
        </section>
      ) : null}
    </>
  );
}
