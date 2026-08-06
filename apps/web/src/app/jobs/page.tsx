import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import {
  EMPLOYMENT_TYPE_LABELS,
  REMOTE_TYPE_LABELS,
  type EmploymentType,
  type RemoteType,
} from "@horizon/shared";
import { listPublishedJobs } from "@/lib/api";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; location?: string; remoteType?: string }>;
}) {
  const params = await searchParams;
  let jobs: Awaited<ReturnType<typeof listPublishedJobs>>["jobs"] = [];
  let total = 0;
  let error: string | null = null;

  try {
    const result = await listPublishedJobs({
      q: params.q,
      location: params.location,
      remoteType: params.remoteType,
      pageSize: 30,
    });
    jobs = result.jobs;
    // meta may be absent depending on client wrapper — count from list
    total = jobs.length;
  } catch {
    error = "Jobs are temporarily unavailable. Please try again shortly.";
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm font-medium text-primary">Jobs</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[color:var(--ink)] sm:text-4xl">
          Find roles. Apply with proof.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[color:var(--ink-soft)]">
          Search jobs as you would on any job board — then apply with your
          SkillsPhase profile instead of uploading a CV. Employers see what you
          can do first; supporting documents stay available upon request.
        </p>

        <form className="mt-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]" method="get">
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Role, skill, or company"
            className="rounded-md border border-[color:var(--line)] bg-white px-3 py-2.5 text-sm"
          />
          <input
            name="location"
            defaultValue={params.location ?? ""}
            placeholder="Location"
            className="rounded-md border border-[color:var(--line)] bg-white px-3 py-2.5 text-sm"
          />
          <button
            type="submit"
            className="btn-primary rounded-md px-5 py-2.5 text-sm font-semibold"
          >
            Search
          </button>
        </form>

        {error ? (
          <p className="mt-10 text-sm text-[color:var(--ink-soft)]">{error}</p>
        ) : jobs.length === 0 ? (
          <div className="mt-12 rounded-md border border-[color:var(--line)] bg-[color:var(--paper-warm)] px-6 py-10 text-center">
            <p className="font-display text-xl font-semibold text-[color:var(--ink)]">
              No open roles yet
            </p>
            <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
              Create your SkillsPhase profile now so you&apos;re ready when roles
              appear — or browse candidate examples while employers post jobs.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/register?as=candidate"
                className="btn-primary rounded-md px-4 py-2.5 text-sm font-semibold"
              >
                Create your profile
              </Link>
              <Link
                href="/discover-talent"
                className="rounded-md border border-[color:var(--line)] px-4 py-2.5 text-sm font-semibold"
              >
                Browse talent
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-10 divide-y divide-[color:var(--line)] border-t border-[color:var(--line)]">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/jobs/${job.slug}`}
                  className="block py-5 transition hover:bg-[color:var(--paper-warm)]/60"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-display text-xl font-semibold text-[color:var(--ink)]">
                      {job.title}
                    </h2>
                    <p className="text-sm text-[color:var(--ink-soft)]">
                      {job.companyName}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
                    {job.location} ·{" "}
                    {REMOTE_TYPE_LABELS[job.remoteType as RemoteType] ??
                      job.remoteType}{" "}
                    ·{" "}
                    {EMPLOYMENT_TYPE_LABELS[
                      job.employmentType as EmploymentType
                    ] ?? job.employmentType}
                  </p>
                  {(job.salaryMin || job.salaryMax) && (
                    <p className="mt-1 text-sm font-medium text-primary">
                      {job.salaryCurrency} {job.salaryMin ?? "?"} –{" "}
                      {job.salaryMax ?? "?"}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {total > 0 ? (
          <p className="mt-6 text-xs text-[color:var(--ink-soft)]">
            Showing {total} role{total === 1 ? "" : "s"}
          </p>
        ) : null}
      </main>
    </>
  );
}
