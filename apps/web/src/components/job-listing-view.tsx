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
                ? "rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-md border border-[color:var(--line)] bg-white px-3 py-1.5 text-sm font-medium text-brand"
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
      <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-[color:var(--foreground)]/80">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-relaxed">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SidebarFacts({ listing }: { listing: JobListingViewModel }) {
  const facts = [
    ["Salary", listing.salaryLabel],
    ["Location", listing.location],
    ["Pattern", remoteLabel(listing.remoteType)],
    ["Type", listing.employmentType],
    ["Industry", listing.industry],
  ] as const;

  return (
    <dl className="space-y-3 text-sm">
      {facts.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)]/55">
            {label}
          </dt>
          <dd className="mt-0.5 font-medium text-brand">{value}</dd>
        </div>
      ))}
    </dl>
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

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link href={listing.backHref} className="text-sm text-brand underline">
          ← {listing.backLabel}
        </Link>

        {listing.isExample ? (
          <div
            className="mt-4 rounded-md border border-brand-accent/40 bg-brand-accent/10 px-4 py-3 text-sm text-brand"
            role="status"
          >
            Example listing — this is not a live vacancy. It shows how a real
            Project Horizon job post looks.
          </div>
        ) : null}

        <header className="mt-6 border-b border-[color:var(--line)] pb-8">
          <p className="text-sm font-semibold text-[color:var(--foreground)]/70">
            {listing.companyName}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-fraunces)] text-4xl text-brand md:text-5xl">
            {listing.title}
          </h1>
          <p className="mt-3 text-[color:var(--foreground)]/75">
            {listing.location} · {remoteLabel(listing.remoteType)} ·{" "}
            {listing.employmentType}
          </p>
          <p className="mt-2 text-lg font-semibold text-brand">
            {listing.salaryLabel}
          </p>
          <p className="mt-1 text-sm text-[color:var(--foreground)]/60">
            {listing.postedLabel}
          </p>

          <div className="mt-6 max-w-md lg:hidden">
            <JobListingActions
              jobId={listing.jobId}
              isExample={listing.isExample}
              title={listing.title}
              slug={listing.slug}
            />
          </div>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-10">
            <section>
              <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
                Skills required
              </h2>
              <p className="mt-2 text-sm text-[color:var(--foreground)]/70">
                Project Horizon asks employers to lead with abilities — not years
                in post or unbroken timelines.
              </p>
              <div className="mt-5 space-y-5">
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
              </div>
            </section>

            <Section title="You might be a good fit if…">
              <BulletList items={listing.goodFitIf} />
            </Section>

            <Section title="About the role">
              <article className="whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--foreground)]/85">
                {listing.aboutRole}
              </article>
            </Section>

            <Section title="Benefits">
              <BulletList items={listing.benefits} />
            </Section>

            <Section title="Inclusive hiring">
              <p className="text-sm leading-relaxed text-[color:var(--foreground)]/85">
                {listing.inclusiveHiring}
              </p>
            </Section>

            <Section title="Application process">
              <ol className="space-y-3">
                {listing.applicationProcess.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <span className="pt-0.5 text-[color:var(--foreground)]/85">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </Section>

            <Section title="About the company">
              <p className="text-sm leading-relaxed text-[color:var(--foreground)]/85">
                {listing.companyAbout}
              </p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)]/55">
                    Industry
                  </dt>
                  <dd className="mt-0.5 font-medium text-brand">
                    {listing.industry}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)]/55">
                    Organisation size
                  </dt>
                  <dd className="mt-0.5 font-medium text-brand">
                    {listing.companySize}
                  </dd>
                </div>
              </dl>
            </Section>

            <Section title="Why this role suits returners">
              <BulletList items={listing.whyReturners} />
            </Section>

            {!listing.isExample && listing.jobId != null ? (
              <section
                id="apply"
                className="border-t border-[color:var(--line)] pt-8"
              >
                <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
                  Apply for this role
                </h2>
                <ApplyForm jobId={listing.jobId} />
              </section>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="space-y-4 rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
              <div className="hidden lg:block">
                <JobListingActions
                  jobId={listing.jobId}
                  isExample={listing.isExample}
                  title={listing.title}
                  slug={listing.slug}
                />
              </div>
              <div className="border-t border-[color:var(--line)] pt-4">
                <p className="text-sm font-semibold text-brand">
                  {listing.companyName}
                </p>
                <p className="mt-1 text-xs text-[color:var(--foreground)]/65 line-clamp-3">
                  {listing.companyAbout}
                </p>
              </div>
              <div className="border-t border-[color:var(--line)] pt-4">
                <SidebarFacts listing={listing} />
              </div>
            </div>
            <div className="mt-4">
              <SkillsMatchPanel requiredSkills={allSkillNames} />
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

export function ExampleJobListingView({ job }: { job: JobListingContent }) {
  return <JobListingView listing={listingFromDemo(job)} />;
}
