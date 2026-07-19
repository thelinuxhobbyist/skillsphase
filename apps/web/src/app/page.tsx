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
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg, rgba(15,76,92,0.94), rgba(15,76,92,0.55)), url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22 viewBox=%220 0 160 160%22%3E%3Cpath fill=%22%23ffffff14%22 d=%22M0 80h160M80 0v160%22/%3E%3C/svg%3E')",
              backgroundSize: "cover, 48px 48px",
            }}
          />
          <div className="absolute inset-0 animate-[horizon-pan_18s_ease-in-out_infinite_alternate] bg-[radial-gradient(circle_at_25%_35%,rgba(227,100,20,0.35),transparent_45%)]" />
          <div className="relative mx-auto flex min-h-[calc(100vh-4.5rem)] w-full max-w-6xl flex-col justify-center px-6 py-16 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/85">
              Career Return Platform
            </p>
            <h1 className="mt-4 max-w-2xl font-[family-name:var(--font-fraunces)] text-5xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
              Project Horizon
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">
              A trusted place where verified UK employers meet skilled people
              returning to work after a career break.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="btn-primary rounded-md bg-brand-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Find your next role
              </Link>
              <Link
                href="/jobs"
                className="rounded-md border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Browse jobs
              </Link>
            </div>

            <form
              action="/jobs"
              method="get"
              className="mt-10 max-w-2xl"
              aria-label="Search open roles"
            >
              <p className="mb-3 text-sm text-white/80">
                Search verified UK roles by keyword or location.
              </p>
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  name="keyword"
                  placeholder="Keyword or skill"
                  className="rounded-md border border-white/25 bg-white px-3 py-3 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--foreground)]/50"
                />
                <input
                  name="location"
                  placeholder="Location"
                  className="rounded-md border border-white/25 bg-white px-3 py-3 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--foreground)]/50"
                />
                <button
                  type="submit"
                  className="btn-primary rounded-md bg-brand-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="border-y border-[color:var(--line)] bg-[color:var(--surface)]/60 py-16">
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
                title: "Verified UK employers",
                body: "Companies House checks plus manual approval before jobs go live.",
              },
              {
                title: "Career gaps welcomed",
                body: "Profiles make space for returners — not a stigma to hide.",
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

        <section className="border-t border-[color:var(--line)] bg-[color:var(--surface)]/60 py-16">
          <div className="mx-auto max-w-6xl px-6">
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
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
            Ready to return — or to hire returners?
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="rounded-md bg-brand-accent px-5 py-3 text-sm font-semibold text-white"
            >
              Create an account
            </Link>
            <Link
              href="/about"
              className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-3 text-sm font-semibold text-brand"
            >
              About Horizon
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
