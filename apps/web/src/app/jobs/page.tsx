import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { listPublishedJobs } from "@/lib/api";
import { HOMEPAGE_DEMO_JOBS } from "@horizon/shared";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function JobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const keyword = typeof params.keyword === "string" ? params.keyword : "";
  const location = typeof params.location === "string" ? params.location : "";
  const remoteType =
    typeof params.remoteType === "string" ? params.remoteType : "";
  const employmentType =
    typeof params.employmentType === "string" ? params.employmentType : "";
  const industry = typeof params.industry === "string" ? params.industry : "";
  const page = Math.max(1, Number(params.page) || 1);

  let jobs: Awaited<ReturnType<typeof listPublishedJobs>>["jobs"] = [];
  let total = 0;
  let pageSize = 20;
  let error: string | null = null;

  try {
    const result = await listPublishedJobs({
      keyword,
      location,
      remoteType,
      employmentType,
      industry,
      page,
      pageSize: 20,
    });
    jobs = result.jobs;
    total = result.meta.total;
    pageSize = result.meta.pageSize;
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load jobs.";
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const queryBase = new URLSearchParams();
  if (keyword) queryBase.set("keyword", keyword);
  if (location) queryBase.set("location", location);
  if (remoteType) queryBase.set("remoteType", remoteType);
  if (employmentType) queryBase.set("employmentType", employmentType);
  if (industry) queryBase.set("industry", industry);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl min-w-0 px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand sm:text-4xl">
        Browse jobs
      </h1>
      <p className="mt-2 text-[color:var(--foreground)]/75">
        Roles from verified UK employers welcoming career returners.
      </p>

      <form className="mt-8 grid gap-3 md:grid-cols-3 lg:grid-cols-6" method="get">
        <input
          name="keyword"
          defaultValue={keyword}
          placeholder="Keyword"
          className="rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm lg:col-span-2"
        />
        <input
          name="location"
          defaultValue={location}
          placeholder="Location"
          className="rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
        />
        <select
          name="remoteType"
          defaultValue={remoteType}
          className="rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
        >
          <option value="">Remote type</option>
          <option value="on_site">On-site</option>
          <option value="hybrid">Hybrid</option>
          <option value="remote">Remote</option>
        </select>
        <select
          name="employmentType"
          defaultValue={employmentType}
          className="rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
        >
          <option value="">Employment type</option>
          <option value="full_time">Full time</option>
          <option value="part_time">Part time</option>
          <option value="contract">Contract</option>
          <option value="temporary">Temporary</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
        >
          Search
        </button>
      </form>

      {error ? (
        <p className="mt-8 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : (
        <>
          <p className="mt-6 text-sm text-[color:var(--foreground)]/65">
            {jobs.length > 0
              ? `${total} role${total === 1 ? "" : "s"} found`
              : `Showing ${HOMEPAGE_DEMO_JOBS.length} example roles (no live published vacancies yet)`}
          </p>
          <ul className="mt-4 space-y-4">
            {jobs.length === 0
              ? HOMEPAGE_DEMO_JOBS.map((job) => (
                  <li key={job.slug}>
                    <Link
                      href={`/jobs/examples/${job.slug}`}
                      className="group block w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--surface)] p-5 sm:p-6 transition-all duration-200 hover:border-brand hover:bg-white hover:shadow-md cursor-pointer"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h2 className="font-semibold text-lg text-brand group-hover:text-brand-accent transition-colors">
                          {job.title}
                        </h2>
                        <span className="rounded-full bg-brand-accent/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-accent">
                          Example listing
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-[color:var(--foreground)]/70">
                        {job.companyName} · {job.location} ·{" "}
                        {job.remoteType.replace("_", "-")}
                      </p>
                      {job.skills.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {job.skills.slice(0, 5).map((skill) => (
                            <span
                              key={skill.name}
                              className="rounded-md border border-[color:var(--line)] bg-white px-2.5 py-1 text-brand font-medium pointer-events-none"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[color:var(--foreground)]/80">
                        {job.blurb}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-[color:var(--line)]/60 pt-3">
                        <span className="text-sm font-semibold text-brand group-hover:text-brand-accent group-hover:underline inline-flex items-center gap-1">
                          Read full example listing <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                        </span>
                      </div>
                    </Link>
                  </li>
                ))
              : jobs.map((job) => (
                  <li key={job.id}>
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="group block w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--surface)] p-5 sm:p-6 transition-all duration-200 hover:border-brand hover:bg-white hover:shadow-md cursor-pointer"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h2 className="font-semibold text-lg text-brand group-hover:text-brand-accent transition-colors">
                          {job.title}
                        </h2>
                        <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
                          {job.remoteType.replace("_", "-")}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-[color:var(--foreground)]/70">
                        {job.companyName} · {job.location}
                      </p>
                      {job.skills.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {job.skills.slice(0, 5).map((skill) => (
                            <span
                              key={skill.id}
                              className="rounded-md border border-[color:var(--line)] bg-white px-2.5 py-1 text-brand font-medium pointer-events-none"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[color:var(--foreground)]/80">
                        {job.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-[color:var(--line)]/60 pt-3">
                        <span className="text-sm font-semibold text-brand group-hover:text-brand-accent group-hover:underline inline-flex items-center gap-1">
                          View role details <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
          </ul>
          {totalPages > 1 ? (
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              {page > 1 ? (
                <Link
                  href={`/jobs?${new URLSearchParams({
                    ...Object.fromEntries(queryBase),
                    page: String(page - 1),
                  }).toString()}`}
                  className="text-brand underline"
                >
                  Previous
                </Link>
              ) : null}
              <span className="text-[color:var(--foreground)]/65">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={`/jobs?${new URLSearchParams({
                    ...Object.fromEntries(queryBase),
                    page: String(page + 1),
                  }).toString()}`}
                  className="text-brand underline"
                >
                  Next
                </Link>
              ) : null}
            </div>
          ) : null}
        </>
      )}
      </main>
    </>
  );
}
