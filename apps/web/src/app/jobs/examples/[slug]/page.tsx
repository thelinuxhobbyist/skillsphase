import Link from "next/link";
import { notFound } from "next/navigation";
import { findHomepageDemoJob, HOMEPAGE_DEMO_JOBS } from "@horizon/shared";
import { SiteHeader } from "@/components/site-header";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return HOMEPAGE_DEMO_JOBS.map((job) => ({ slug: job.slug }));
}

export default async function ExampleJobPage({ params }: { params: Params }) {
  const { slug } = await params;
  const job = findHomepageDemoJob(slug);
  if (!job) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/#jobs" className="text-sm text-brand underline">
          ← Back to featured jobs
        </Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-brand-accent">
          Example listing — not a live vacancy
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
          {job.title}
        </h1>
        <p className="mt-2 text-[color:var(--foreground)]/75">
          {job.companyName} · {job.location} ·{" "}
          {job.remoteType.replace("_", "-")} · {job.employmentType}
        </p>

        <section className="mt-8">
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
            Skills required
          </h2>
          <p className="mt-1 text-sm text-[color:var(--foreground)]/70">
            Project Horizon asks employers to lead with abilities — not years in
            post or unbroken employment history.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2 text-sm">
            {job.skills.map((skill) => (
              <li
                key={skill}
                className="rounded-md border border-[color:var(--line)] bg-white px-3 py-1.5 font-medium text-brand"
              >
                {skill}
              </li>
            ))}
          </ul>
        </section>

        <article className="prose mt-8 max-w-none whitespace-pre-wrap text-[color:var(--foreground)]/85">
          {job.description}
        </article>

        <div className="mt-10 rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
          <p className="text-sm text-[color:var(--foreground)]/75">
            This page shows how a real job post will look on Project Horizon —
            skills first, then context about the role. When employers publish
            live roles, you can apply from the job page.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
            >
              Browse live jobs
            </Link>
            <Link
              href="/register?as=seeker"
              className="rounded-md border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-brand"
            >
              Register as a returner
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
