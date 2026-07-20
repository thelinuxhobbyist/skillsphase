import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { listPublishedJobs, type HorizonJob } from "@/lib/api";

const DEMO_JOBS = [
  {
    id: "demo-1",
    title: "Operations Manager — hybrid",
    companyName: "Northbridge Retail Group",
    location: "Manchester",
    remoteType: "hybrid",
    blurb:
      "Lead a regional ops team. Returners with people-leadership experience welcome — career breaks recognised as part of the journey.",
  },
  {
    id: "demo-2",
    title: "Finance Business Partner",
    companyName: "Cedar Health Ltd",
    location: "Leeds",
    remoteType: "hybrid",
    blurb:
      "Partner with clinical leads on budgets and forecasting. Ideal for experienced accountants returning after parental leave.",
  },
  {
    id: "demo-3",
    title: "Customer Success Lead",
    companyName: "Brightpath Software",
    location: "Remote (UK)",
    remoteType: "remote",
    blurb:
      "Support B2B customers through onboarding and renewals. Communication skills and sector knowledge valued over continuous timelines.",
  },
] as const;

const TRUST = [
  "Verified employers",
  "Secure applications",
  "Free for returners",
  "UK focused",
] as const;

const DIFFERENTIATORS = [
  {
    title: "Skills and experience over career gaps",
    body: "We designed profiles so your real capability shows first — not an unbroken calendar of employment.",
  },
  {
    title: "Built specifically for people returning to work",
    body: "Every flow assumes a career break is normal: narrative space, gap-friendly employers, and hiring that respects your pace.",
  },
  {
    title: "Direct applications to verified employers",
    body: "Apply once with a snapshotted CV. You’re speaking to organisations that have passed UK verification — not an anonymous marketplace.",
  },
  {
    title: "Employers actively looking for returners",
    body: "Companies join because they want depth, loyalty, and perspective — not because they need another generic job board.",
  },
] as const;

const STATS = [
  { value: "12k+", label: "Returners ready to join" },
  { value: "480+", label: "Verified UK employers" },
  { value: "3.2k", label: "Applications this quarter" },
  { value: "94%", label: "Would recommend us*" },
] as const;

const LOGOS = [
  "Northbridge",
  "Cedar Health",
  "Brightpath",
  "Harbour Legal",
  "Greenfield Foods",
  "Atlas Logistics",
] as const;

const TESTIMONIALS = [
  {
    quote:
      "I worried a four-year break would define me. Here, employers asked about my skills first — the gap was just context.",
    name: "Amira K.",
    role: "Returner · Operations",
  },
  {
    quote:
      "We hired two returners in a month. The quality of experience was outstanding — exactly the maturity we’d been missing.",
    name: "James O.",
    role: "Hiring manager · Cedar Health",
  },
  {
    quote:
      "Registering took minutes, and tracking applications felt calm. No pressure to pretend my timeline was perfect.",
    name: "Priya S.",
    role: "Returner · Finance",
  },
] as const;

const STORIES = [
  {
    title: "From carer to team lead in six months",
    body: "After supporting a parent full-time, Sam returned via a hybrid ops role with a company that treated caring experience as leadership practice.",
  },
  {
    title: "Parental leave → finance business partner",
    body: "Elena restarted with a part-time FBP role, then moved full-time when ready — without hiding the break on her CV.",
  },
] as const;

const FAQS = [
  {
    q: "Is it free for people returning to work?",
    a: "Yes. Creating a profile, browsing jobs, and applying is free for returners.",
  },
  {
    q: "Will employers see my career break?",
    a: "You control how you tell your story. Profiles invite a career-gap narrative so the break is context, not a red flag.",
  },
  {
    q: "Who can post jobs?",
    a: "Only verified UK employers. Companies are checked against Companies House and approved before they can publish roles.",
  },
  {
    q: "I’m an employer — what kind of candidates will I find?",
    a: "Experienced professionals returning after parental leave, caring responsibilities, health recovery, relocation, or a planned pause — people with proven skills and renewed commitment.",
  },
  {
    q: "Do I have to apply immediately after registering?",
    a: "No. Join at your own pace. Complete your profile when you’re ready and apply only when a role feels right.",
  },
  {
    q: "Is this only for the UK?",
    a: "Employer registration is UK-only today. Non-UK organisations can join the waitlist.",
  },
] as const;

export default async function HomePage() {
  let featured: HorizonJob[] = [];
  try {
    const result = await listPublishedJobs({ page: 1, pageSize: 3 });
    featured = result.jobs;
  } catch {
    featured = [];
  }

  const showDemo = featured.length === 0;

  return (
    <div>
      <SiteHeader />

      <main>
        {/* Hero — story first, no search */}
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

          <div className="relative mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col justify-end px-6 pb-14 pt-28 md:min-h-[76vh] md:pb-16 md:pt-32">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Career Return Platform
            </p>
            <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-fraunces)] text-5xl leading-[1.02] font-semibold tracking-tight text-white md:text-7xl">
              Project Horizon
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85 md:text-lg">
              A career break doesn&apos;t erase your experience. Restart, return,
              and move forward with employers who hire the whole human — not just
              the uninterrupted timeline.
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

        {/* Trust signals */}
        <section className="border-b border-[color:var(--line)] bg-white/90">
          <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-[color:var(--line)] md:grid-cols-4">
            {TRUST.map((item) => (
              <li
                key={item}
                className="bg-white px-4 py-5 text-center text-sm font-semibold text-brand"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Emotional story */}
        <section className="mx-auto max-w-3xl px-6 py-16 text-center md:py-20">
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand md:text-4xl">
            Your pause wasn&apos;t a detour from your career — it was part of it.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[color:var(--foreground)]/80">
            Millions of talented people step away to raise families, care for
            loved ones, recover, relocate, or simply breathe. Too many job sites
            treat that chapter as a flaw. We built this platform so returning
            feels obvious: your skills still count, your story still matters, and
            the right employers are already looking for people like you.
          </p>
        </section>

        {/* How it works */}
        <section className="border-y border-[color:var(--line)] bg-[color:var(--surface)]/60 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
              How it works
            </h2>
            <p className="mt-2 max-w-2xl text-[color:var(--foreground)]/75">
              Three calm steps — no pressure to move faster than you&apos;re ready.
            </p>
            <ol className="mt-8 grid gap-8 md:grid-cols-3">
              {[
                {
                  title: "Tell your story once",
                  body: "Build a profile that includes skills, experience, and space for your career-gap narrative — on your terms.",
                },
                {
                  title: "Apply to verified employers",
                  body: "Every listing comes from a UK organisation that has passed verification. Your CV is snapshotted at apply time.",
                },
                {
                  title: "Track progress calmly",
                  body: "Follow each application from applied through interview, offer, or hire — without guessing where you stand.",
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

        {/* Unique value — replaces weak "Why Horizon" */}
        <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
            What makes us different
          </h2>
          <p className="mt-2 max-w-2xl text-[color:var(--foreground)]/75">
            Not another generic job board — a return-to-work platform built around
            how careers actually unfold.
          </p>
          <ul className="mt-10 grid gap-8 sm:grid-cols-2">
            {DIFFERENTIATORS.map((item) => (
              <li key={item.title} className="border-l-2 border-brand-accent pl-5">
                <h3 className="font-semibold text-brand">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--foreground)]/75">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Employer section — more specific */}
        <section className="border-y border-[color:var(--line)] bg-[color:var(--surface)]/60 py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand md:text-4xl">
              Untapped talent is still talent.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[color:var(--foreground)]/80">
              Hire people with real depth: former team leads returning after parental
              leave, analysts who stepped away to care for family, specialists
              restarting after relocation or recovery. They bring commercial
              judgement, calm under pressure, and loyalty that short-tenure markets
              rarely deliver — without you competing for the same overcrowded
              shortlists.
            </p>
            <Link
              href="/register?as=employer"
              className="btn-primary mt-8 inline-block rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Register as an employer
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
            Growing with returners and employers
          </h2>
          <p className="mt-2 text-sm text-[color:var(--foreground)]/60">
            Sample figures for layout — replace with live metrics when ready.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((stat) => (
              <li key={stat.label}>
                <p className="font-[family-name:var(--font-fraunces)] text-4xl text-brand">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-[color:var(--foreground)]/70">
                  {stat.label}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[color:var(--foreground)]/50">
            *Placeholder social proof until real data is available.
          </p>
        </section>

        {/* Employer logos */}
        <section className="border-y border-[color:var(--line)] bg-white/70 py-14">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center font-[family-name:var(--font-fraunces)] text-2xl text-brand">
              Employers welcoming returners
            </h2>
            <p className="mt-2 text-center text-sm text-[color:var(--foreground)]/60">
              Logo placeholders — swap in partner marks when confirmed.
            </p>
            <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
              {LOGOS.map((name) => (
                <li
                  key={name}
                  className="min-w-[7rem] text-center text-sm font-semibold tracking-wide text-brand/45"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
            Voices from the community
          </h2>
          <p className="mt-2 text-sm text-[color:var(--foreground)]/60">
            Example quotes for layout — replace with consented testimonials.
          </p>
          <ul className="mt-8 grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <li key={item.name}>
                <blockquote className="text-base leading-relaxed text-[color:var(--foreground)]/80">
                  “{item.quote}”
                </blockquote>
                <p className="mt-4 text-sm font-semibold text-brand">{item.name}</p>
                <p className="text-sm text-[color:var(--foreground)]/60">{item.role}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Success stories */}
        <section className="border-y border-[color:var(--line)] bg-[color:var(--surface)]/60 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
              Success stories
            </h2>
            <p className="mt-2 text-sm text-[color:var(--foreground)]/60">
              Illustrative stories for structure — publish real ones when ready.
            </p>
            <ul className="mt-8 grid gap-8 md:grid-cols-2">
              {STORIES.map((story) => (
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

        {/* Search + Featured jobs */}
        <section id="jobs" className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
                Featured jobs
              </h2>
              <p className="mt-2 text-[color:var(--foreground)]/75">
                {showDemo
                  ? "Example roles so you can see how listings will look — live vacancies appear here once employers publish."
                  : "Roles from verified UK employers welcoming career returners."}
              </p>
            </div>
            <Link href="/jobs" className="text-sm font-semibold text-brand underline">
              View all jobs
            </Link>
          </div>

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

          <ul className="mt-8 space-y-4">
            {showDemo
              ? DEMO_JOBS.map((job) => (
                  <li
                    key={job.id}
                    className="rounded-md border border-[color:var(--line)] bg-white/80 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-semibold text-brand">{job.title}</h3>
                      <span className="text-xs font-semibold uppercase tracking-wide text-brand-accent">
                        Example listing
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[color:var(--foreground)]/70">
                      {job.companyName} · {job.location} ·{" "}
                      {job.remoteType.replace("_", "-")}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-[color:var(--foreground)]/80">
                      {job.blurb}
                    </p>
                    <Link
                      href="/register?as=seeker"
                      className="mt-4 inline-block text-sm font-semibold text-brand underline"
                    >
                      Register to apply when live roles open
                    </Link>
                  </li>
                ))
              : featured.map((job) => (
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
                ))}
          </ul>
        </section>

        {/* Closing CTA */}
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

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
            Frequently asked questions
          </h2>
          <p className="mt-2 text-[color:var(--foreground)]/75">
            Quick answers for returners and employers.
          </p>
          <div className="mt-8 space-y-3">
            {FAQS.map((item) => (
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
      </main>
    </div>
  );
}
