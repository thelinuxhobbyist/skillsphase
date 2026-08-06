import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { JobApplyForm } from "@/components/job-apply-form";
import {
  EMPLOYMENT_TYPE_LABELS,
  REMOTE_TYPE_LABELS,
  type EmploymentType,
  type RemoteType,
} from "@horizon/shared";
import { ApiRequestError, getJobBySlug } from "@/lib/api";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let job;
  try {
    job = await getJobBySlug(slug);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/jobs"
          className="text-sm font-medium text-primary underline"
        >
          ← All jobs
        </Link>

        <p className="mt-6 text-sm font-medium text-primary">{job.companyName}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[color:var(--ink)] sm:text-4xl">
          {job.title}
        </h1>
        <p className="mt-3 text-sm text-[color:var(--ink-soft)]">
          {job.location} ·{" "}
          {REMOTE_TYPE_LABELS[job.remoteType as RemoteType] ?? job.remoteType} ·{" "}
          {EMPLOYMENT_TYPE_LABELS[job.employmentType as EmploymentType] ??
            job.employmentType}{" "}
          · {job.industry}
        </p>
        {(job.salaryMin || job.salaryMax) && (
          <p className="mt-2 text-base font-semibold text-primary">
            {job.salaryCurrency} {job.salaryMin ?? "?"} – {job.salaryMax ?? "?"}
          </p>
        )}

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-[color:var(--ink)]">
            Role description
          </h2>
          <div className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-[color:var(--ink-soft)]">
            {job.description}
          </div>
        </section>

        {job.skills.length > 0 ? (
          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold text-[color:var(--ink)]">
              Skills for this role
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-md border border-[color:var(--line)] px-2.5 py-1 text-sm"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-10">
          <JobApplyForm jobId={job.id} jobTitle={job.title} />
        </section>
      </main>
    </>
  );
}
