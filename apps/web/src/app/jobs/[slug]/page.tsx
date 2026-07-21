import { ApplyForm } from "@/components/apply-form";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobBySlug } from "@/lib/api";
import { formatUkDateLabel } from "@/lib/dates";
import { SiteHeader } from "@/components/site-header";

type Params = Promise<{ slug: string }>;

export default async function JobDetailPage({ params }: { params: Params }) {
  const { slug } = await params;

  let job;
  try {
    job = await getJobBySlug(slug);
  } catch {
    notFound();
  }

  const salary =
    job.salaryMin || job.salaryMax
      ? `${job.salaryCurrency} ${job.salaryMin ?? "?"} – ${job.salaryMax ?? "?"}`
      : "Salary not specified";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/jobs" className="text-sm text-brand underline">
          ← Back to jobs
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
          {job.title}
        </h1>
        <p className="mt-2 text-[color:var(--foreground)]/75">
          {job.companyName} · {job.location} · {job.remoteType.replace("_", "-")} ·{" "}
          {job.employmentType}
        </p>
        <p className="mt-2 text-sm text-[color:var(--foreground)]/65">
          {salary}
          {job.closingDate
            ? ` · Closes ${formatUkDateLabel(job.closingDate)}`
            : ""}
        </p>

        <section className="mt-8">
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
            Skills required
          </h2>
          <p className="mt-1 text-sm text-[color:var(--foreground)]/70">
            We ask employers to lead with the abilities this role needs.
          </p>
          {job.skills.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2 text-sm">
              {job.skills.map((skill) => (
                <li
                  key={skill.id}
                  className="rounded-md border border-[color:var(--line)] bg-white px-3 py-1.5 font-medium text-brand"
                >
                  {skill.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-[color:var(--foreground)]/70">
              Skills for this role will appear here.
            </p>
          )}
        </section>

        <article className="prose mt-8 max-w-none whitespace-pre-wrap text-[color:var(--foreground)]/85">
          {job.description}
        </article>

        <ApplyForm jobId={job.id} />
      </main>
    </>
  );
}
