import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobBySlug } from "@/lib/api";

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
        {job.closingDate ? ` · Closes ${job.closingDate}` : ""}
      </p>

      <article className="prose mt-8 max-w-none whitespace-pre-wrap text-[color:var(--foreground)]/85">
        {job.description}
      </article>

      {job.skills.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-semibold text-brand">Skills</h2>
          <ul className="mt-2 flex flex-wrap gap-2 text-sm">
            {job.skills.map((skill) => (
              <li
                key={skill.id}
                className="rounded-md border border-[color:var(--line)] bg-white px-2 py-1"
              >
                {skill.name}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-10">
        <Link
          href="/login"
          className="inline-block rounded-md bg-brand-accent px-5 py-3 text-sm font-semibold text-white"
        >
          Apply (sign in required)
        </Link>
        <p className="mt-2 text-sm text-[color:var(--foreground)]/65">
          Applications open in the next phase. You can prepare your profile now.
        </p>
      </div>
    </main>
  );
}
