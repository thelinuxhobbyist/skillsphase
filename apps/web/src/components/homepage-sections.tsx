import Link from "next/link";
import type { HomepageSection } from "@horizon/shared";
import { HOMEPAGE_DEMO_JOBS } from "@horizon/shared";
import type { HorizonJob } from "@/lib/api";

function str(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function arr<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function demoJobSlug(job: {
  slug?: string;
  title: string;
}): string {
  if (job.slug) return job.slug;
  const fromCanon = HOMEPAGE_DEMO_JOBS.find(
    (j) => j.title === job.title || j.title === job.title.replace(/ — .+$/, ""),
  );
  if (fromCanon) return fromCanon.slug;
  return job.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function HomepageSections({
  sections,
  featuredJobs,
}: {
  sections: HomepageSection[];
  featuredJobs: HorizonJob[];
}) {
  return (
    <>
      {sections.map((section) => (
        <HomepageSectionBlock
          key={section.id}
          section={section}
          featuredJobs={featuredJobs}
        />
      ))}
    </>
  );
}

function HomepageSectionBlock({
  section,
  featuredJobs,
}: {
  section: HomepageSection;
  featuredJobs: HorizonJob[];
}) {
  const c = section.content;

  switch (section.type) {
    case "hero":
      return (
        <section className="relative min-h-[70vh] overflow-hidden md:min-h-[76vh]">
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
          <div className="relative mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col justify-end px-4 pb-12 pt-24 sm:px-6 sm:pb-14 sm:pt-28 md:min-h-[76vh] md:pb-16 md:pt-32">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              {str(c.eyebrow, "Career Return Platform")}
            </p>
            <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-fraunces)] text-4xl leading-[1.05] font-semibold tracking-tight break-words text-white sm:text-5xl md:text-7xl">
              {str(c.title, "Project Horizon")}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85 md:text-lg">
              {str(c.body)}
            </p>
            <div className="mt-8 flex w-full max-w-lg flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link
                href={str(c.primaryCtaHref, "/register?as=seeker")}
                className="btn-primary w-full rounded-md bg-brand-accent px-5 py-3.5 text-center text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto sm:px-6"
              >
                {str(c.primaryCtaLabel, "Register as a returner")}
              </Link>
              <Link
                href={str(c.secondaryCtaHref, "/register?as=employer")}
                className="w-full rounded-md border border-white/40 bg-white/10 px-5 py-3.5 text-center text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 sm:w-auto sm:px-6"
              >
                {str(c.secondaryCtaLabel, "Register as an employer")}
              </Link>
            </div>
          </div>
        </section>
      );

    case "trust":
      return (
        <section className="border-b border-[color:var(--line)] bg-white/90">
          <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-px bg-[color:var(--line)] sm:grid-cols-2 md:grid-cols-4">
            {arr<string>(c.items).map((item) => (
              <li
                key={item}
                className="bg-white px-4 py-5 text-center text-sm font-semibold break-words text-brand sm:px-5"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      );

    case "story":
      return (
        <section className="mx-auto max-w-3xl px-6 py-16 text-center md:py-20">
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand md:text-4xl">
            {str(c.title)}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[color:var(--foreground)]/80">
            {str(c.body)}
          </p>
        </section>
      );

    case "how_it_works":
      return (
        <section className="border-y border-[color:var(--line)] bg-[color:var(--surface)]/60 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
              {str(c.title, "How it works")}
            </h2>
            {c.subtitle ? (
              <p className="mt-2 max-w-2xl text-[color:var(--foreground)]/75">
                {str(c.subtitle)}
              </p>
            ) : null}
            <ol className="mt-8 grid gap-8 md:grid-cols-3">
              {arr<{ title: string; body: string }>(c.steps).map((step, index) => (
                <li key={`${step.title}-${index}`}>
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
      );

    case "differentiators":
      return (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
            {str(c.title, "What makes us different")}
          </h2>
          {c.subtitle ? (
            <p className="mt-2 max-w-2xl text-[color:var(--foreground)]/75">
              {str(c.subtitle)}
            </p>
          ) : null}
          <ul className="mt-10 grid gap-8 sm:grid-cols-2">
            {arr<{ title: string; body: string }>(c.items).map((item) => (
              <li key={item.title} className="border-l-2 border-brand-accent pl-5">
                <h3 className="font-semibold text-brand">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--foreground)]/75">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>
      );

    case "employers_cta":
      return (
        <section className="border-y border-[color:var(--line)] bg-[color:var(--surface)]/60 py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand md:text-4xl">
              {str(c.title)}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[color:var(--foreground)]/80">
              {str(c.body)}
            </p>
            <Link
              href={str(c.ctaHref, "/register?as=employer")}
              className="btn-primary mt-8 inline-block rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {str(c.ctaLabel, "Register as an employer")}
            </Link>
          </div>
        </section>
      );

    case "stats":
      return (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
            {str(c.title)}
          </h2>
          {c.subtitle ? (
            <p className="mt-2 text-sm text-[color:var(--foreground)]/60">
              {str(c.subtitle)}
            </p>
          ) : null}
          <ul className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            {arr<{ value: string; label: string }>(c.items).map((stat) => (
              <li key={stat.label}>
                <p className="font-[family-name:var(--font-fraunces)] text-3xl text-brand sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-[color:var(--foreground)]/70">
                  {stat.label}
                </p>
              </li>
            ))}
          </ul>
          {c.footnote ? (
            <p className="mt-4 text-xs text-[color:var(--foreground)]/50">
              {str(c.footnote)}
            </p>
          ) : null}
        </section>
      );

    case "logos":
      return (
        <section className="border-y border-[color:var(--line)] bg-white/70 py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center font-[family-name:var(--font-fraunces)] text-2xl text-brand">
              {str(c.title)}
            </h2>
            {c.subtitle ? (
              <p className="mt-2 text-center text-sm text-[color:var(--foreground)]/60">
                {str(c.subtitle)}
              </p>
            ) : null}
            <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
              {arr<string>(c.items).map((name) => (
                <li
                  key={name}
                  className="min-w-0 max-w-[9rem] text-center text-sm font-semibold tracking-wide break-words text-brand/45"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </section>
      );

    case "testimonials":
      return (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
            {str(c.title)}
          </h2>
          {c.subtitle ? (
            <p className="mt-2 text-sm text-[color:var(--foreground)]/60">
              {str(c.subtitle)}
            </p>
          ) : null}
          <ul className="mt-8 grid gap-8 md:grid-cols-3">
            {arr<{ quote: string; name: string; role: string }>(c.items).map(
              (item) => (
                <li key={item.name}>
                  <blockquote className="text-base leading-relaxed text-[color:var(--foreground)]/80">
                    “{item.quote}”
                  </blockquote>
                  <p className="mt-4 text-sm font-semibold text-brand">{item.name}</p>
                  <p className="text-sm text-[color:var(--foreground)]/60">
                    {item.role}
                  </p>
                </li>
              ),
            )}
          </ul>
        </section>
      );

    case "success_stories":
      return (
        <section className="border-y border-[color:var(--line)] bg-[color:var(--surface)]/60 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
              {str(c.title)}
            </h2>
            {c.subtitle ? (
              <p className="mt-2 text-sm text-[color:var(--foreground)]/60">
                {str(c.subtitle)}
              </p>
            ) : null}
            <ul className="mt-8 grid gap-8 md:grid-cols-2">
              {arr<{ title: string; body: string }>(c.items).map((story) => (
                <li key={story.title}>
                  <h3 className="font-semibold text-brand">{story.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--foreground)]/75">
                    {story.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      );

    case "featured_jobs": {
      const showDemo = featuredJobs.length === 0;
      const demoJobs = arr<{
        slug?: string;
        title: string;
        companyName: string;
        location: string;
        remoteType: string;
        blurb: string;
        skills?: string[];
      }>(c.demoJobs);
      const showSearch = c.showSearch !== false;

      return (
        <section id="jobs" className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
                {str(c.title, "Featured jobs")}
              </h2>
              <p className="mt-2 text-[color:var(--foreground)]/75">
                {showDemo
                  ? str(c.subtitleDemo)
                  : str(c.subtitleLive)}
              </p>
            </div>
            <Link href="/jobs" className="text-sm font-semibold text-brand underline">
              View all jobs
            </Link>
          </div>

          {showSearch ? (
            <form
              action="/jobs"
              method="get"
              className="mt-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
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
          ) : null}

          <ul className="mt-8 space-y-4">
            {showDemo
              ? demoJobs.map((job) => {
                  const slug = demoJobSlug(job);
                  const skills =
                    job.skills ??
                    HOMEPAGE_DEMO_JOBS.find((j) => j.title === job.title || j.slug === job.slug)
                      ?.skills.map((s) => s.name) ??
                    [];
                  return (
                    <li key={`${job.title}-${job.companyName}`}>
                      <Link
                        href={`/jobs/examples/${slug}`}
                        className="group block w-full rounded-lg border border-[color:var(--line)] bg-white/80 p-5 sm:p-6 transition-all duration-200 hover:border-brand hover:bg-white hover:shadow-md cursor-pointer"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h3 className="font-semibold text-lg text-brand group-hover:text-brand-accent transition-colors">
                            {job.title}
                          </h3>
                          <span className="rounded-full bg-brand-accent/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-accent">
                            Example listing
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-[color:var(--foreground)]/70">
                          {job.companyName} · {job.location} ·{" "}
                          {job.remoteType.replace("_", "-")}
                        </p>
                        {skills.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            {skills.slice(0, 5).map((skill) => (
                              <span
                                key={skill}
                                className="rounded-md border border-[color:var(--line)] bg-white px-2.5 py-1 text-brand font-medium pointer-events-none"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <p className="mt-3 text-sm leading-relaxed text-[color:var(--foreground)]/80">
                          {job.blurb}
                        </p>
                        <div className="mt-4 flex items-center justify-between border-t border-[color:var(--line)]/60 pt-3">
                          <span className="text-sm font-semibold text-brand group-hover:text-brand-accent group-hover:underline inline-flex items-center gap-1">
                            Read full example listing <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })
              : featuredJobs.map((job) => (
                  <li key={job.id}>
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="group block w-full rounded-lg border border-[color:var(--line)] bg-white/80 p-5 sm:p-6 transition-all duration-200 hover:border-brand hover:bg-white hover:shadow-md cursor-pointer"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg text-brand group-hover:text-brand-accent transition-colors">
                          {job.title}
                        </h3>
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
                      {job.description ? (
                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[color:var(--foreground)]/80">
                          {job.description}
                        </p>
                      ) : null}
                      <div className="mt-4 flex items-center justify-between border-t border-[color:var(--line)]/60 pt-3">
                        <span className="text-sm font-semibold text-brand group-hover:text-brand-accent group-hover:underline inline-flex items-center gap-1">
                          View role details <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
          </ul>
        </section>
      );
    }

    case "closing_cta":
      return (
        <section className="border-t border-[color:var(--line)] bg-[color:var(--surface)]/60 py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand md:text-4xl">
              {str(c.title)}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[color:var(--foreground)]/80">
              {str(c.body)}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href={str(c.primaryCtaHref, "/register?as=seeker")}
                className="btn-primary rounded-md bg-brand-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {str(c.primaryCtaLabel, "Register as a returner")}
              </Link>
              <Link
                href={str(c.secondaryCtaHref, "/register?as=employer")}
                className="rounded-md border border-[color:var(--line)] bg-white/70 px-5 py-3 text-sm font-semibold text-brand transition hover:bg-white"
              >
                {str(c.secondaryCtaLabel, "Register as an employer")}
              </Link>
            </div>
          </div>
        </section>
      );

    case "faq":
      return (
        <section id="faq" className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
            {str(c.title, "Frequently asked questions")}
          </h2>
          {c.subtitle ? (
            <p className="mt-2 text-[color:var(--foreground)]/75">{str(c.subtitle)}</p>
          ) : null}
          <div className="mt-8 space-y-3">
            {arr<{ q: string; a: string }>(c.items).map((item) => (
              <details
                key={item.q}
                className="group border-b border-[color:var(--line)] py-3"
              >
                <summary className="cursor-pointer list-none font-semibold text-brand marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-4">
                    {item.q}
                    <span className="text-brand-accent transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--foreground)]/75">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      );

    default:
      return null;
  }
}
