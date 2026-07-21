import Link from "next/link";
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

function SidebarFacts({ listing }: { listing: JobListingViewModel }) {
  const facts: Array<[string, string]> = [
    ["Salary", listing.salaryLabel],
    ["Location", listing.location],
    ["Pattern", remoteLabel(listing.remoteType)],
    ["Type", listing.employmentType],
  ];
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
      </div>
      <div className="border-t border-[color:var(--line)] pt-4">
        <SidebarFacts listing={listing} />
      </div>
    </div>
  );
}

export function JobListingView({ listing }: { listing: JobListingViewModel }) {
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

          <div className="mt-6 max-w-md lg:hidden">
            <JobListingActions
              jobId={listing.jobId}
              isExample={listing.isExample}
              title={listing.title}
              slug={listing.slug}
            />
          </div>
        </header>

        <div className="mt-8 grid min-w-0 gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
          <div className="order-2 min-w-0 space-y-8 lg:order-1 lg:space-y-10">
            {listing.skills.length > 0 ? (
              <section>
                <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
                  Skills required
                </h2>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {listing.skills.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium break-words text-white"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {listing.description.trim() ? (
              <section className="border-t border-[color:var(--line)] pt-8">
                <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
                  About the role
                </h2>
                <article className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-[color:var(--foreground)]/85">
                  {listing.description}
                </article>
              </section>
            ) : null}

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

          <aside className="order-1 min-w-0 space-y-4 lg:sticky lg:top-6 lg:order-2 lg:self-start">
            <ListingSidebarCard listing={listing} />
            <SkillsMatchPanel requiredSkills={listing.skills} />
          </aside>
        </div>
      </main>
    </>
  );
}

export function ExampleJobListingView({ job }: { job: JobListingContent }) {
  return <JobListingView listing={listingFromDemo(job)} />;
}
