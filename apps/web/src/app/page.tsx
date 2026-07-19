import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { listPublishedJobs } from "@/lib/api";

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof listPublishedJobs>>["jobs"] = [];
  try {
    const result = await listPublishedJobs({ page: 1, pageSize: 3 });
    featured = result.jobs;
  } catch {
    featured = [];
  }

  return (
    <div>
      <SiteHeader />

      <main>
        <section className="relative min-h-[70vh] overflow-hidden md:min-h-[78vh]">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(165deg, #0a3a47 0%, #0f4c5c 42%, #1a5f6e 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 80% 60% at 70% 40%, rgba(227,100,20,0.45), transparent 55%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08), transparent 40%)",
            }}
          />
          <div className="absolute inset-0 animate-[horizon-pan_22s_ease-in-out_infinite_alternate] bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22 viewBox=%220 0 80 80%22%3E%3Cpath fill=%22%23ffffff08%22 d=%22M0 40h80M40 0v80%22/%3E%3C/svg%3E')] bg-[length:64px_64px]" />

          <div className="relative mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col justify-end px-6 pb-16 pt-28 md:min-h-[78vh] md:pb-20 md:pt-32">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Career Return Platform
            </p>
            <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-fraunces)] text-5xl leading-[1.02] font-semibold tracking-tight text-white md:text-7xl">
              Project Horizon
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/80 md:text-lg">
              Restart, return, and move forward — with employers who value
              experience over perfect timelines.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/register?as=seeker"
                className="btn-primary rounded-md bg-brand-accent px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Register as a returner
              </Link>
              <Link
                href="/register?as=employer"
                className="rounded-md border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Register as an employer
              </Link>
            </div>
          </div>
        </section>

        <section className="border-b border-[color:var(--line)] bg-white/80 py-6">
          <form
            action="/jobs"
            method="get"
            className="mx-auto grid w-full max-w-6xl gap-3 px-6 sm:grid-cols-[1fr_1fr_auto]"
            aria-label="Search open roles"
          >
            <input
              name="keyword"
              placeholder="Keyword or skill"
              className="rounded-md border border-[color:var(--line)] bg-white px-3 py-3 text-sm"
            />
            <input
              name="location"
              placeholder="Location"
              className="rounded-md border border-[color:var(--line)] bg-white px-3 py-3 text-sm"
            />
            <button
              type="submit"
              className="btn-primary rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Search jobs
            </button>
          </form>
        </section>

        <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]/60 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
              How it works
            </h2>
            <ol className="mt-8 grid gap-8 md:grid-cols-3">
              {[
                {
                  title: "Build your profile",
                  body: "Tell your story, including career gaps, skills, and a CV — once.",
                },
                {
                  title: "Apply with confidence",
                  body: "Apply to verified UK employers. Your CV is snapshotted at submit time.",
                },
                {
                  title: "Track every step",
                  body: "Follow applications from applied through interview, offer, or hire.",
                },
              ].map((step, index) => (
                <li key={step.title}>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-accent">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-2 font-semibold text-brand">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--foreground)]/75">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
            Why Horizon
          </h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Gap-friendly employers",
                body: "Browse companies that explicitly welcome non-linear careers and return-to-work journeys.",
              },
              {
                title: "Verified UK employers",
                body: "Companies House checks plus manual approval before jobs go live.",
              },
              {
                title: "Simple and secure",
                body: "Essential emails only, GDPR export/delete, and role-based access.",
              },
            ].map((item) => (
              <li key={item.title}>
                <h3 className="font-semibold text-brand">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--foreground)]/75">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-y border-[color:var(--line)] bg-[color:var(--surface)]/60 py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand md:text-4xl">
              Untapped talent is still talent.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[color:var(--foreground)]/80">
              Hire skills-first. Build loyalty. Reach experienced candidates
              other platforms overlook. Project Horizon connects you with
              professionals ready to bring depth, perspective, and commitment to
              your team.
            </p>
            <Link
              href="/register?as=employer"
              className="btn-primary mt-8 inline-block rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Register as an employer
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
              Featured jobs
            </h2>
            <Link href="/jobs" className="text-sm font-semibold text-brand underline">
              View all
            </Link>
          </div>
          <ul className="mt-8 space-y-4">
            {featured.length === 0 ? (
              <li className="text-[color:var(--foreground)]/70">
                Published roles will appear here once employers are approved.
              </li>
            ) : (
              featured.map((job) => (
                <li key={job.id}>
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="block rounded-md border border-[color:var(--line)] bg-white/70 p-5 transition hover:bg-white"
                  >
                    <h3 className="font-semibold text-brand">{job.title}</h3>
                    <p className="mt-1 text-sm text-[color:var(--foreground)]/70">
                      {job.companyName} · {job.location}
                    </p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="border-t border-[color:var(--line)] bg-[color:var(--surface)]/60 py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand md:text-4xl">
              A better way back into work.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[color:var(--foreground)]/80">
              Whatever your story, your next chapter starts here. It&apos;s free
              to join, and there&apos;s no pressure to move at anyone&apos;s pace
              but your own.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/register?as=seeker"
                className="btn-primary rounded-md bg-brand-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Register as a returner
              </Link>
              <Link
                href="/register?as=employer"
                className="rounded-md border border-[color:var(--line)] bg-white/70 px-5 py-3 text-sm font-semibold text-brand transition hover:bg-white"
              >
                Register as an employer
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
