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
  const industry = typeof params.industry === "string" ? params.industry : "";

  let jobs: Awaited<ReturnType<typeof listPublishedJobs>>["jobs"] = [];
  let total = 0;
  let error: string | null = null;

  try {
    const result = await listPublishedJobs({
      keyword,
      location,
      remoteType,
      industry,
      page: 1,
      pageSize: 20,
    });
    jobs = result.jobs;
    total = result.meta.total;
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load jobs.";
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-[family-name:var(--font-fraunces)] text-4xl text-brand">
        Browse jobs
      </h1>
      <p className="mt-2 text-[color:var(--foreground)]/75">
        Roles from verified UK employers welcoming career returners.
      </p>

      <form className="mt-8 grid gap-3 md:grid-cols-4" method="get">
        <input
          name="keyword"
          defaultValue={keyword}
          placeholder="Keyword"
          className="rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
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
        </>
      )}
    </main>
  );
}
