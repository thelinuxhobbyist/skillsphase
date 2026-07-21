import Link from "next/link";
import type { ReactNode } from "react";
import { ApplyForm } from "@/components/apply-form";
import {
  JobListingActions,
  SkillsMatchPanel,
} from "@/components/job-listing-actions";
import {
  listingFromDemo,
  remoteLabel,
  type JobListingViewModel,
  type SimilarJobCard,
} from "@/lib/job-listing";
import type { JobListingContent } from "@horizon/shared";
import { SiteHeader } from "@/components/site-header";

function SkillChips({
  title,
  skills,
  variant,
}: {
  title: string;
  skills: string[];
  variant: "essential" | "nice";
}) {
  if (skills.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-brand">{title}</h3>
      <ul className="mt-2 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <li
            key={skill}
            className={
              variant === "essential"
                ? "rounded-md bg-brand px-3 py-1.5 text-sm font-medium break-words text-white"
                : "rounded-md border border-[color:var(--line)] bg-white px-3 py-1.5 text-sm font-medium break-words text-brand"
            }
          >
            {skill}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-[color:var(--line)] pt-8">
      <h2 className="font-[family-name:var(--font-fraunces)] text-2xl break-words text-brand">
        {title}
      </h2>
      <div className="mt-4 min-w-0">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-[color:var(--foreground)]/80">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-relaxed">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
          <span className="min-w-0 break-words">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SidebarFacts({ listing }: { listing: JobListingViewModel }) {
  const facts: Array<[string, string]> = [
    ["Salary", listing.salaryLabel],
    ["Location", listing.location],
    ["Pattern", remoteLabel(listing.remoteType)],
    ["Type", listing.employmentType],
  ];
  if (listing.contractDetails) {
    facts.push(["Contract", listing.contractDetails]);
  }
  if (listing.industry) {
    facts.push(["Industry", listing.industry]);
  }

  return (
    <dl className="space-y-3 text-sm">
      {facts.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)]/55">
            {label}
          </dt>
          <dd className="mt-0.5 font-medium break-words text-brand">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function HorizonPromise() {
  return (
    <aside
      className="rounded-md border border-brand/25 bg-brand/5 p-4 sm:p-5"
      aria-label="Project Horizon Promise"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
        Project Horizon Promise
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--foreground)]/85">
        Applicants are assessed on skills — not employment gaps. Experience from
        paid work, freelancing, volunteering, or caring responsibilities all
        count.
      </p>
    </aside>
  );
}

function SimilarJobs({ jobs }: { jobs: SimilarJobCard[] }) {
  if (jobs.length === 0) return null;
  return (
    <section className="mt-12 border-t border-[color:var(--line)] pt-10">
      <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
        Similar jobs
      </h2>
      <p className="mt-2 text-sm text-[color:var(--foreground)]/70">
        Not quite right? Keep browsing roles that welcome returners.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <li key={job.href}>
            <Link
              href={job.href}
              className="block h-full rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4 transition hover:bg-white"
            >
              <p className="font-semibold break-words text-brand">{job.title}</p>
              <p className="mt-1 text-sm break-words text-[color:var(--foreground)]/70">
                {job.companyName}
              </p>
              <p className="mt-2 text-xs text-[color:var(--foreground)]/60">
                {job.location} · {remoteLabel(job.remoteType)}
                {job.isExample ? " · Example" : ""}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ListingSidebarCard({ listing }: { listing: JobListingViewModel }) {
  return (
    <div className="space-y-4 rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <div className="hidden lg:block">
        <JobListingActions
          jobId={listing.jobId}
          isExample={listing.isExample}
          title={listing.title}
          slug={listing.slug}
        />
      </div>
      <div className="lg:border-t lg:border-[color:var(--line)] lg:pt-4">
        <p className="text-sm font-semibold break-words text-brand">
          {listing.companyName}
        </p>
        {listing.companyAbout ? (
          <p className="mt-1 text-xs break-words text-[color:var(--foreground)]/65 line-clamp-4">
            {listing.companyAbout}
          </p>
        ) : null}
      </div>
      <div className="border-t border-[color:var(--line)] pt-4">
        <SidebarFacts listing={listing} />
      </div>
    </div>
  );
}

export function JobListingView({ listing }: { listing: JobListingViewModel }) {
  const essential = listing.skills
    .filter((s) => s.level === "essential")
    .map((s) => s.name);
  const nice = listing.skills
    .filter((s) => s.level === "nice_to_have")
    .map((s) => s.name);
  const allSkillNames = listing.skills.map((s) => s.name);
  const hasNice = nice.length > 0;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl min-w-0 px-4 py-8 sm:px-6 sm:py-10">
        <Link href={listing.backHref} className="text-sm text-brand underline">
          ← {listing.backLabel}
        </Link>

        {listing.isExample ? (
          <div
            className="mt-4 rounded-md border border-brand-accent/40 bg-brand-accent/10 px-4 py-3 text-sm text-brand"
            role="status"
          >
            Example listing — this is not a live vacancy.
          </div>
        ) : null}

        <header className="mt-6 border-b border-[color:var(--line)] pb-8">
          <p className="text-sm font-semibold break-words text-[color:var(--foreground)]/70">
            {listing.companyName}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-fraunces)] text-3xl break-words text-brand sm:text-4xl md:text-5xl">
            {listing.title}
          </h1>
          <p className="mt-3 break-words text-[color:var(--foreground)]/75">
            {listing.location} · {remoteLabel(listing.remoteType)} ·{" "}
            {listing.employmentType}
          </p>
          <p className="mt-2 text-lg font-semibold break-words text-brand">
            {listing.salaryLabel}
          </p>
          <p className="mt-1 text-sm text-[color:var(--foreground)]/60">
            {listing.postedLabel}
          </p>

          <div className="mt-6 max-w-md space-y-4 lg:hidden">
            <JobListingActions
              jobId={listing.jobId}
              isExample={listing.isExample}
              title={listing.title}
              slug={listing.slug}
            />
            <HorizonPromise />
          </div>
        </header>

        <div className="mt-8 grid min-w-0 gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
          <div className="order-2 min-w-0 space-y-8 lg:order-1 lg:space-y-10">
            {allSkillNames.length > 0 ? (
              <section>
                <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
                  Skills required
                </h2>
                <div className="mt-5 space-y-5">
                  {hasNice ? (
                    <>
                      <SkillChips
                        title="Essential skills"
                        skills={essential}
                        variant="essential"
                      />
                      <SkillChips
                        title="Nice to have"
                        skills={nice}
                        variant="nice"
                      />
                    </>
                  ) : (
                    <SkillChips
                      title="Skills"
                      skills={allSkillNames}
                      variant="essential"
                    />
                  )}
                </div>
              </section>
            ) : null}

            {listing.description.trim() ? (
              <Section title="About the role">
                <article className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[color:var(--foreground)]/85">
                  {listing.description}
                </article>
              </Section>
            ) : null}

            {listing.workingPatternDetail || listing.contractDetails ? (
              <Section title="Location & working pattern">
                {listing.workingPatternDetail ? (
                  <p className="break-words text-sm leading-relaxed text-[color:var(--foreground)]/85">
                    {listing.workingPatternDetail}
                  </p>
                ) : null}
                {listing.contractDetails ? (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-brand">
                      Contract details
                    </h3>
                    <p className="mt-1 break-words text-sm text-[color:var(--foreground)]/85">
                      {listing.contractDetails}
                    </p>
                  </div>
                ) : null}
              </Section>
            ) : null}

            {listing.benefits.length > 0 ? (
              <Section title="Benefits">
                <BulletList items={listing.benefits} />
              </Section>
            ) : null}

            {listing.whyReturners.length > 0 ? (
              <Section title="Why this role is returner-friendly">
                <BulletList items={listing.whyReturners} />
              </Section>
            ) : null}

            {listing.applicationProcess.length > 0 ? (
              <Section title="Application process">
                <ol className="space-y-3">
                  {listing.applicationProcess.map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <span className="min-w-0 break-words pt-0.5 text-[color:var(--foreground)]/85">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </Section>
            ) : null}

            {listing.companyAbout || listing.industry || listing.companySize ? (
              <Section title="About the company">
                {listing.companyAbout ? (
                  <p className="break-words text-sm leading-relaxed text-[color:var(--foreground)]/85">
                    {listing.companyAbout}
                  </p>
                ) : null}
                {(listing.industry || listing.companySize) && (
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    {listing.industry ? (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)]/55">
                          Industry
                        </dt>
                        <dd className="mt-0.5 font-medium break-words text-brand">
                          {listing.industry}
                        </dd>
                      </div>
                    ) : null}
                    {listing.companySize ? (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)]/55">
                          Organisation size
                        </dt>
                        <dd className="mt-0.5 font-medium break-words text-brand">
                          {listing.companySize}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                )}
              </Section>
            ) : null}

            <div className="lg:hidden">
              <HorizonPromise />
            </div>

            {!listing.isExample && listing.jobId != null ? (
              <section
                id="apply"
                className="rounded-md border border-brand/20 bg-brand/5 p-5 sm:p-6"
              >
                <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
                  Apply now
                </h2>
                <p className="mt-2 text-sm text-[color:var(--foreground)]/75">
                  Submit your application through Project Horizon.
                </p>
                <div className="mt-4">
                  <ApplyForm jobId={listing.jobId} />
                </div>
              </section>
            ) : (
              <section className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5 sm:p-6">
                <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
                  Apply now
                </h2>
                <p className="mt-2 text-sm text-[color:var(--foreground)]/75">
                  Applications are disabled on example listings.
                </p>
                <button
                  type="button"
                  disabled
                  className="mt-4 w-full max-w-sm cursor-not-allowed rounded-md bg-brand/40 px-4 py-3 text-sm font-semibold text-white"
                >
                  Apply (example listing)
                </button>
              </section>
            )}

            <SimilarJobs jobs={listing.similarJobs} />
          </div>

          <aside className="order-1 min-w-0 space-y-4 lg:sticky lg:top-6 lg:order-2 lg:self-start">
            <ListingSidebarCard listing={listing} />
            <div className="hidden lg:block">
              <HorizonPromise />
            </div>
            <SkillsMatchPanel requiredSkills={allSkillNames} />
          </aside>
        </div>
      </main>
    </>
  );
}

export function ExampleJobListingView({
  job,
  similarJobs,
}: {
  job: JobListingContent;
  similarJobs: SimilarJobCard[];
}) {
  return (
    <JobListingView listing={listingFromDemo(job, similarJobs)} />
  );
}
