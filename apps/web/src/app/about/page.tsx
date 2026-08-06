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
          A jobs platform that replaces the traditional CV with an evidence-based
          profile.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-[color:var(--ink-soft)]">
          SkillsPhase is still a jobs platform — search roles, read the
          description, apply, interview. The innovation is the application
          itself: instead of uploading a CV, candidates apply with a SkillsPhase
          profile built around capabilities and evidence.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-[color:var(--ink-soft)]">
          That works whether you are a teacher, nurse, electrician, chef,
          designer, project manager, or software engineer. The profession
          changes. The principle does not.
        </p>

        <section className="mt-12 space-y-4 text-base leading-relaxed text-[color:var(--ink-soft)]">
          <h2 className="font-display text-[1.6rem] font-semibold text-[color:var(--ink)]">
            For candidates
          </h2>
          <p>
            Build a SkillsPhase profile once, then use it to apply. Lead with
            what you can do, supported by evidence from lesson plans and
            portfolios to installations and case studies. You control what stays
            private — CVs, certificates, and references can remain available
            upon request until both sides are interested.
          </p>
        </section>

        <section className="mt-12 space-y-4 text-base leading-relaxed text-[color:var(--ink-soft)]">
          <h2 className="font-display text-[1.6rem] font-semibold text-[color:var(--ink)]">
            For businesses
          </h2>
          <p>
            Post jobs and review applications that answer “what can this person
            do?” before “where have they worked?” Verified UK businesses can
            contact candidates, save profiles, and request supporting documents
            later — progressive trust, not an immediate document dump.
          </p>
        </section>

        <section className="mt-12 space-y-4 text-base leading-relaxed text-[color:var(--ink-soft)]">
          <h2 className="font-display text-[1.6rem] font-semibold text-[color:var(--ink)]">
            What we value
          </h2>
          <p>
            <strong className="text-[color:var(--ink)]">Jobs first.</strong>{" "}
            People visit to find work or hire — the profile exists because it
            becomes the application.
          </p>
          <p>
            <strong className="text-[color:var(--ink)]">Capability before title.</strong>{" "}
            Show what someone helps people achieve, not only their job title.
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
            Apply for jobs with proof, not just a CV.
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
