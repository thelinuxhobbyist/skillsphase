import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] font-semibold text-[color:var(--ink)]">
          About SkillsPhase
        </h1>
        <p className="mt-6 text-xl font-display leading-snug text-[color:var(--stamp)]">
          Your career may have phases. Your skills don&apos;t disappear.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-[color:var(--ink-soft)]">
          SkillsPhase is a modern jobs platform built around a simple idea:
          work changes and life changes, but accumulated capability does not
          simply disappear. Instead of a traditional CV, people present
          themselves through capabilities, evidence, impact, skills, trust
          signals, and availability.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-[color:var(--ink-soft)]">
          It still works like a jobs platform — search roles, read the
          description, apply, interview. The difference is the application
          itself: candidates apply with a SkillsPhase profile built around what
          they can do.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-[color:var(--ink-soft)]">
          That works whether you are a teacher, nurse, electrician, chef,
          designer, warehouse operative, project manager, or software engineer.
          The profession changes. The principle does not: capabilities over
          chronology.
        </p>

        <section className="mt-12 space-y-4 text-base leading-relaxed text-[color:var(--ink-soft)]">
          <h2 className="font-display text-[1.6rem] font-semibold text-[color:var(--ink)]">
            Your skills don&apos;t stop when work does
          </h2>
          <p>
            Skills can come from employment, training, caring, volunteering,
            building something independently, or continuing to learn. Career
            change, career breaks, redundancy, returning to work, freelancing,
            and community projects are phases of a person&apos;s life and
            career — not gaps to hide.
          </p>
        </section>

        <section className="mt-12 space-y-4 text-base leading-relaxed text-[color:var(--ink-soft)]">
          <h2 className="font-display text-[1.6rem] font-semibold text-[color:var(--ink)]">
            For candidates
          </h2>
          <p>
            Build a SkillsPhase profile once, then use it to apply. Lead with
            what you can do, supported by evidence — from lesson plans and
            portfolios to installations and case studies. You control what stays
            private: CVs, certificates, and references can remain available
            upon request until both sides are interested.
          </p>
        </section>

        <section className="mt-12 space-y-4 text-base leading-relaxed text-[color:var(--ink-soft)]">
          <h2 className="font-display text-[1.6rem] font-semibold text-[color:var(--ink)]">
            For businesses
          </h2>
          <p>
            Recruit by capability, not keyword bingo. Post jobs and review
            applications that answer &ldquo;what can this person do?&rdquo;
            before &ldquo;where have they worked?&rdquo; Verified UK businesses
            can contact candidates, save profiles, and request supporting
            documents later — progressive trust, not an immediate document dump.
          </p>
        </section>

        <section className="mt-12 space-y-4 text-base leading-relaxed text-[color:var(--ink-soft)]">
          <h2 className="font-display text-[1.6rem] font-semibold text-[color:var(--ink)]">
            What we value
          </h2>
          <p>
            <strong className="text-[color:var(--ink)]">Skills first.</strong>{" "}
            Because life happens — and capability travels with people through
            every phase.
          </p>
          <p>
            <strong className="text-[color:var(--ink)]">
              Capabilities over chronology.
            </strong>{" "}
            Show what someone can do, not only their employment timeline.
          </p>
          <p>
            <strong className="text-[color:var(--ink)]">Progressive trust.</strong>{" "}
            Public profiles earn interest; deeper documents follow mutual
            interest.
          </p>
          <p>
            <strong className="text-[color:var(--ink)]">Verified businesses.</strong>{" "}
            Companies House checks and company email activation before contact.
          </p>
        </section>

        <section className="mt-14 rounded-[5px] border border-[color:var(--folder-line)] bg-[color:var(--folder)] p-6 sm:p-7">
          <h2 className="font-display text-[1.6rem] font-semibold text-[color:var(--ink)]">
            Your skills didn&apos;t disappear just because your work changed.
          </h2>
          <p className="mt-3 text-base text-[color:var(--ink-soft)]">
            Free for candidates. Create your SkillsPhase profile, then apply when
            you&apos;re ready.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/register?as=candidate"
              className="btn-primary rounded-[var(--radius)] px-5 py-3 text-sm font-medium"
            >
              Create your SkillsPhase profile
            </Link>
            <Link
              href="/jobs"
              className="rounded-[var(--radius)] border border-[color:var(--line-strong)] bg-transparent px-5 py-3 text-sm font-medium text-[color:var(--ink)]"
            >
              Browse jobs
            </Link>
            <Link
              href="/register?as=business"
              className="rounded-[var(--radius)] border border-[color:var(--line-strong)] bg-transparent px-5 py-3 text-sm font-medium text-[color:var(--ink)]"
            >
              Register as a business
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
