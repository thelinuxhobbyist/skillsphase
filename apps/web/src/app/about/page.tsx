import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="eyebrow">Skills-first hiring</p>
        <h1 className="mt-3 font-display text-[clamp(2rem,4vw,2.75rem)] font-semibold text-[color:var(--ink)]">
          About SkillsPhase
        </h1>
        <p className="mt-6 text-xl font-display leading-snug text-[color:var(--stamp)]">
          Skills first. Because life happens.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-[color:var(--ink-soft)]">
          Traditional recruitment places too much emphasis on employment history,
          career gaps, and polished CVs. SkillsPhase puts skills, qualifications,
          experience, and potential first — so employers focus on what candidates
          can do today.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-[color:var(--ink-soft)]">
          Career gaps are not flaws. Whether someone has taken time away to raise
          children, care for family, recover from illness, study, travel, or change
          careers, those experiences should not overshadow their ability to do the
          job. When skills come first, career gaps matter less.
        </p>

        <section className="mt-12 space-y-4 text-base leading-relaxed text-[color:var(--ink-soft)]">
          <h2 className="font-display text-[1.6rem] font-semibold text-[color:var(--ink)]">
            For candidates
          </h2>
          <p>
            Build a skills-first profile: skills, qualifications, experience,
            certifications, projects, and achievements — backed by real portfolio
            evidence. No CV upload, no cover letter, no generic personal statement.
            Let businesses reach out when your skills fit.
          </p>
        </section>

        <section className="mt-12 space-y-4 text-base leading-relaxed text-[color:var(--ink-soft)]">
          <h2 className="font-display text-[1.6rem] font-semibold text-[color:var(--ink)]">
            For businesses
          </h2>
          <p>
            Hire for capability, not an uninterrupted timeline. Browse
            skills-first profiles with real evidence, open full details for people
            worth talking to, and contact them directly. You decide who to reach
            out to — there’s no automatic match.
          </p>
        </section>

        <section className="mt-12 space-y-4 text-base leading-relaxed text-[color:var(--ink-soft)]">
          <h2 className="font-display text-[1.6rem] font-semibold text-[color:var(--ink)]">
            What we value
          </h2>
          <p>
            <strong className="text-[color:var(--ink)]">Skills first.</strong> Ability and
            evidence lead — not employment timelines or polished statements.
          </p>
          <p>
            <strong className="text-[color:var(--ink)]">Life happens.</strong> Career breaks
            are normal. They shouldn’t disqualify capable people.
          </p>
          <p>
            <strong className="text-[color:var(--ink)]">Trust.</strong> Every business is
            checked against Companies House and activates via a verified company
            email before contacting candidates.
          </p>
          <p>
            <strong className="text-[color:var(--ink)]">Control.</strong> Export or delete your
            data whenever you choose.
          </p>
        </section>

        <section className="mt-14 rounded-[5px] border border-[color:var(--folder-line)] bg-[color:var(--folder)] p-6 sm:p-7">
          <h2 className="font-display text-[1.6rem] font-semibold text-[color:var(--ink)]">
            Skills first. Because life happens.
          </h2>
          <p className="mt-3 text-base text-[color:var(--ink-soft)]">
            It&apos;s free to join as a candidate. Build your profile at your own
            pace — there&apos;s no pressure.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/register?as=candidate"
              className="btn-primary rounded-[var(--radius)] px-5 py-3 font-mono text-xs tracking-[0.05em] uppercase"
            >
              Create your Skill Profile
            </Link>
            <Link
              href="/register?as=business"
              className="rounded-[var(--radius)] border border-[color:var(--line-strong)] bg-transparent px-5 py-3 font-mono text-xs tracking-[0.05em] uppercase text-[color:var(--ink)]"
            >
              Register as a business
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
