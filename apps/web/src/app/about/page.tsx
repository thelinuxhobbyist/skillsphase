import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
          Career Return Platform
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
          About Project Horizon
        </h1>
        <p className="mt-6 text-xl font-[family-name:var(--font-fraunces)] leading-snug text-brand">
          Careers aren&apos;t meant to be perfectly linear.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-[color:var(--foreground)]/80">
          Millions of talented people pause their careers to recover, raise
          families, care for loved ones, or simply to breathe. Project Horizon
          exists to make the way back feel obvious — connecting skilled people
          with employers who value the whole human, not just the timeline.
        </p>

        <section className="mt-12 space-y-4 text-[color:var(--foreground)]/80">
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
            For people returning
          </h2>
          <p>
            Your career story isn&apos;t over. Horizon helps you restart, return,
            and move forward — connecting you with employers who value experience
            over perfect timelines.
          </p>
          <p>
            Browse{" "}
            <strong className="text-brand">gap-friendly employers</strong> —
            companies that explicitly welcome non-linear careers and
            return-to-work journeys.
          </p>
        </section>

        <section className="mt-12 space-y-4 text-[color:var(--foreground)]/80">
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
            For employers
          </h2>
          <p>
            Untapped talent is still talent. Hire skills-first. Build loyalty.
            Reach experienced candidates other platforms overlook. Project Horizon
            connects you with professionals ready to bring depth, perspective, and
            commitment to your team.
          </p>
        </section>

        <section className="mt-12 space-y-4 text-[color:var(--foreground)]/80">
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
            What we value
          </h2>
          <p>
            <strong className="text-brand">Trust.</strong> Employers are checked
            against Companies House and approved before they can publish roles.
          </p>
          <p>
            <strong className="text-brand">Dignity.</strong> Profiles invite a
            career-gap narrative so returners can explain their path on their own
            terms.
          </p>
          <p>
            <strong className="text-brand">Simplicity.</strong> Apply once with a
            complete profile; track status clearly; export or delete your data when
            you choose.
          </p>
        </section>

        <section className="mt-14 rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
            A better way back into work.
          </h2>
          <p className="mt-3 text-[color:var(--foreground)]/80">
            Whatever your story, your next chapter starts here. It&apos;s free to
            join, and there&apos;s no pressure to move at anyone&apos;s pace but
            your own.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="btn-primary rounded-md bg-brand-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Create your profile
            </Link>
            <Link
              href="/jobs"
              className="rounded-md border border-[color:var(--line)] bg-white px-5 py-3 text-sm font-semibold text-brand"
            >
              Browse jobs
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
