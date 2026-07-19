import { ApplyForm } from "@/components/apply-form";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, getJobBySlug } from "@/lib/api";

type Params = Promise<{ slug: string }>;

export default async function JobDetailPage({ params }: { params: Params }) {
  const { slug } = await params;

  let job;
  try {
    job = await getJobBySlug(slug);
  } catch {
    notFound();
  }

  let defaultCoverLetter: string | null = null;
  const { userId, getToken } = await auth();
  if (userId) {
    const token = await getToken();
    if (token) {
      try {
        const user = await getCurrentUser(token);
        if (user.role === "job_seeker") {
          defaultCoverLetter = user.coverLetterTemplate;
        }
      } catch {
        // ignore — apply form still works
      }
    }
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

      <ApplyForm jobId={job.id} defaultCoverLetter={defaultCoverLetter} />
    </main>
  );
}
