import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { listPublishedJobs } from "@/lib/api";

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
            {total} role{total === 1 ? "" : "s"} found
          </p>
          <ul className="mt-4 space-y-4">
            {jobs.length === 0 ? (
              <li className="text-[color:var(--foreground)]/70">
                No published jobs yet.
              </li>
            ) : (
              jobs.map((job) => (
                <li key={job.id}>
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="block rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5 transition hover:bg-white"
                  >
                    <h2 className="font-semibold text-brand">{job.title}</h2>
                    <p className="mt-1 text-sm text-[color:var(--foreground)]/70">
                      {job.companyName} · {job.location} ·{" "}
                      {job.remoteType.replace("_", "-")}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-[color:var(--foreground)]/80">
                      {job.description}
                    </p>
                  </Link>
                </li>
              ))
            )}
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
