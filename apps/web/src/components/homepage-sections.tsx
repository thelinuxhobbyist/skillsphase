import Link from "next/link";
import type { HomepageSection } from "@horizon/shared";
import { PublicCandidateCardView } from "@/components/public-candidate-card";
import type { PublicCandidateCard } from "@/lib/api";

function str(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function arr<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function formatHeroTitle(title: string) {
  const marker = "Because life happens";
  const idx = title.indexOf(marker);
  if (idx === -1) {
    return <>{title}</>;
  }
  return (
    <>
      {title.slice(0, idx)}
      <em className="font-medium text-[color:var(--stamp)] italic">
        {marker}
      </em>
      {title.slice(idx + marker.length)}
    </>
  );
}

export function HomepageSections({
  sections,
  featuredCandidates = [],
}: {
  sections: HomepageSection[];
  featuredCandidates?: PublicCandidateCard[];
}) {
  return (
    <>
      {sections.map((section) => (
        <HomepageSectionBlock
          key={section.id}
          section={section}
          featuredCandidates={featuredCandidates}
        />
      ))}
    </>
  );
}

function HomepageSectionBlock({
  section,
  featuredCandidates,
}: {
  section: HomepageSection;
  featuredCandidates: PublicCandidateCard[];
}) {
  const c = section.content;

  switch (section.type) {
    case "hero":
      return (
        <section className="border-b border-[color:var(--line)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--foreground)_2%,transparent),transparent_40%),var(--background)] px-4 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:pt-20">
          <div className="mx-auto max-w-[1180px]">
            <div className="animate-[dossier-rise_0.7s_ease_both] max-w-2xl">
              <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.08] font-semibold tracking-[-0.01em] text-[color:var(--ink)]">
                {formatHeroTitle(str(c.title, "Skills first. Because life happens."))}
              </h1>
              <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-[color:var(--ink-soft)] sm:text-lg">
                {str(c.body)}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3.5">
                <Link
                  href={str(c.primaryCtaHref, "/register?as=candidate")}
                  className="btn-primary inline-flex items-center justify-center rounded-[var(--radius)] px-5 py-3 text-sm font-medium"
                >
                  {str(c.primaryCtaLabel, "Create your Skill Profile")}
                </Link>
                <Link
                  href={str(c.secondaryCtaHref, "/discover-talent")}
                  className="inline-flex items-center justify-center rounded-[var(--radius)] border border-[color:var(--line-strong)] bg-transparent px-5 py-3 text-sm font-medium text-[color:var(--ink)] transition hover:border-[color:var(--ink)] hover:bg-foreground/5"
                >
                  {str(c.secondaryCtaLabel, "Discover talent")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      );

    case "trust":
      return (
        <section className="overflow-x-auto border-y border-[color:var(--line-strong)] bg-[color:var(--ink)] text-[color:var(--paper)]">
          <ul className="mx-auto flex min-w-max max-w-[1180px] items-center px-4 py-3.5 text-xs sm:px-6 md:min-w-0 md:justify-between">
            {arr<string>(c.items).map((item, index) => (
              <li
                key={item}
                className={`whitespace-nowrap px-6 md:px-4 ${index === 0 ? "" : "border-l border-white/25"}`}
              >
                {item.toUpperCase()}
              </li>
            ))}
          </ul>
        </section>
      );

    case "how_it_works":
      return (
        <section className="border-y border-[color:var(--line)] bg-[color:var(--paper-warm)] py-14 sm:py-20">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
            <h2 className="max-w-2xl font-display text-[clamp(1.95rem,3.6vw,2.65rem)] font-semibold tracking-[-0.01em] text-[color:var(--ink)]">
              {str(c.title, "Three simple steps from profile to conversation.")}
            </h2>
            {c.subtitle ? (
              <p className="mt-3.5 max-w-2xl text-base text-[color:var(--ink-soft)]">
                {str(c.subtitle)}
              </p>
            ) : null}
            <ol className="mt-12 grid border-t border-[color:var(--line-strong)] md:grid-cols-3">
              {arr<{ title: string; body: string }>(c.steps).map((step, index) => (
                <li
                  key={`${step.title}-${index}`}
                  className={`border-[color:var(--line-strong)] py-7 md:border-l md:py-8 md:pl-6 ${index === 0 ? "md:border-l-0 md:pl-0" : ""} border-t md:border-t-0 first:border-t-0`}
                >
                  <p className="text-xs font-medium text-[color:var(--stamp)]">
                    FILE 0{index + 1}
                  </p>
                  <h3 className="mt-2.5 font-display text-[1.35rem] font-semibold text-[color:var(--ink)]">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-base leading-relaxed text-[color:var(--ink-soft)]">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      );

    case "differentiators": {
      const accents = [
        "var(--stamp)",
        "var(--verified)",
        "var(--mustard)",
        "var(--ink)",
      ];
      return (
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
            <h2 className="max-w-2xl font-display text-[clamp(1.95rem,3.6vw,2.65rem)] font-semibold tracking-[-0.01em] text-[color:var(--ink)]">
              {str(c.title, "What makes SkillsPhase different")}
            </h2>
            <p className="mt-3.5 max-w-2xl text-base text-[color:var(--ink-soft)]">
              {str(
                c.subtitle,
                "A hiring platform built around skills and evidence.",
              )}
            </p>
            <ul className="mt-12 grid gap-px border border-[color:var(--line-strong)] bg-[color:var(--line-strong)] sm:grid-cols-2">
              {arr<{ title: string; body: string }>(c.items).map((item, index) => (
                <li
                  key={item.title}
                  className="border-l-4 bg-[color:var(--paper)] px-6 py-8 sm:px-8 sm:py-9"
                  style={{ borderLeftColor: accents[index % accents.length] }}
                >
                  <h3 className="font-display text-[1.4rem] font-semibold text-[color:var(--ink)] sm:text-[1.5rem]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-[color:var(--ink-soft)]">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      );
    }

    case "businesses_cta":
      return (
        <section className="bg-[color:var(--ink)] px-4 py-14 sm:py-20 text-center text-[color:var(--paper)] sm:px-6">
          <h2 className="mx-auto max-w-3xl font-display text-[clamp(1.95rem,4vw,2.75rem)] font-medium italic">
            {str(c.title)}
          </h2>
          <p className="mx-auto mt-3.5 max-w-xl text-base leading-relaxed text-ink-foreground/70">
            {str(c.body)}
          </p>
          <Link
            href={str(c.ctaHref, "/register?as=business")}
            className="mt-8 inline-flex items-center rounded-[var(--radius)] border border-white/50 px-5 py-3 text-sm font-medium text-[color:var(--paper)] transition hover:border-white hover:bg-white/10"
          >
            {str(c.ctaLabel, "Register as a business")}
          </Link>
        </section>
      );

    case "stats":
      return (
        <section className="border-y border-[color:var(--line)] bg-[color:var(--paper-warm)] py-14 sm:py-20">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
            <h2 className="font-display text-[clamp(1.95rem,3.6vw,2.65rem)] font-semibold text-[color:var(--ink)]">
              {str(c.title)}
            </h2>
            {c.subtitle ? (
              <p className="mt-2 text-base text-[color:var(--ink-soft)]">
                {str(c.subtitle)}
              </p>
            ) : null}
            <ul className="mt-9 grid grid-cols-2 gap-y-8 md:grid-cols-4">
              {arr<{ value: string; label: string }>(c.items).map((stat, index) => (
                <li
                  key={stat.label}
                  className={
                    index === 0
                      ? "md:pl-0"
                      : "md:border-l md:border-[color:var(--line-strong)] md:pl-6"
                  }
                >
                  <p className="text-[clamp(1.875rem,3.4vw,2.6rem)] font-semibold text-[color:var(--stamp)]">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-sm text-[color:var(--ink-soft)]">
                    {stat.label}
                  </p>
                </li>
              ))}
            </ul>
            {c.footnote ? (
              <p className="mt-6 text-xs text-muted-foreground italic opacity-75">
                {str(c.footnote)}
              </p>
            ) : null}
          </div>
        </section>
      );

    case "featured_candidates": {
      return (
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-[clamp(1.95rem,3.6vw,2.65rem)] font-semibold text-[color:var(--ink)]">
                  {str(c.title, "Skill profiles")}
                </h2>
                <p className="mt-2 text-base text-[color:var(--ink-soft)]">
                  {str(
                    c.subtitle,
                    "Discover people by skills, experience, and evidence of their work.",
                  )}
                </p>
              </div>
              <Link
                href="/discover-talent"
                className="text-sm font-medium text-primary hover:underline"
              >
                Browse Skill Profiles →
              </Link>
            </div>

            {featuredCandidates.length === 0 ? (
              <div className="mt-10 rounded-lg border border-dashed border-[color:var(--line)] bg-[color:var(--surface)] p-10 text-center">
                <p className="font-semibold text-primary">No skill profiles yet</p>
                <p className="mt-2 text-sm text-[color:var(--foreground)]/70">
                  Check back soon as more people join SkillsPhase.
                </p>
              </div>
            ) : (
              <ul className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-5">
                {featuredCandidates.map((card) => (
                  <PublicCandidateCardView key={card.id} card={card} />
                ))}
              </ul>
            )}
          </div>
        </section>
      );
    }

    case "testimonials":
      return (
        <section className="border-y border-[color:var(--line)] bg-[color:var(--paper-warm)] py-14 sm:py-20">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
            <h2 className="max-w-2xl font-display text-[clamp(1.95rem,3.6vw,2.65rem)] font-semibold text-[color:var(--ink)]">
              {str(c.title)}
            </h2>
            {c.subtitle ? (
              <p className="mt-2 text-base text-[color:var(--ink-soft)]">
                {str(c.subtitle)}
              </p>
            ) : null}
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              {arr<{ quote: string; name: string; role: string }>(c.items).map(
                (item) => (
                  <li
                    key={item.name}
                    className="relative rounded border border-[color:var(--line)] bg-[color:var(--paper)] px-6 py-6"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute top-1.5 left-4 font-display text-[46px] leading-none text-[color:var(--folder-line)]"
                    >
                      “
                    </span>
                    <blockquote className="relative mt-3.5 font-display text-lg leading-snug italic text-[color:var(--ink)]">
                      {item.quote}
                    </blockquote>
                    <p className="mt-4 text-sm font-semibold text-[color:var(--ink)]">
                      {item.name}
                    </p>
                    <p className="text-sm text-[color:var(--ink-soft)]">
                      {item.role}
                    </p>
                  </li>
                ),
              )}
            </ul>
          </div>
        </section>
      );

    case "closing_cta":
      return (
        <section className="px-4 py-14 sm:py-20 text-center sm:px-6">
          <h2 className="font-display text-[clamp(1.95rem,4vw,2.65rem)] font-semibold text-[color:var(--ink)]">
            {str(c.title)}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[color:var(--ink-soft)]">
            {str(c.body)}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <Link
              href={str(c.primaryCtaHref, "/register?as=candidate")}
              className="btn-primary inline-flex items-center rounded-[var(--radius)] px-5 py-3 text-sm font-medium"
            >
              {str(c.primaryCtaLabel, "Create your Skill Profile")}
            </Link>
            <Link
              href={str(c.secondaryCtaHref, "/register?as=business")}
              className="inline-flex items-center rounded-[var(--radius)] border border-[color:var(--line-strong)] px-5 py-3 text-sm font-medium text-[color:var(--ink)] transition hover:border-[color:var(--ink)]"
            >
              {str(c.secondaryCtaLabel, "Register as a business")}
            </Link>
          </div>
        </section>
      );

    case "faq":
      return (
        <section
          id="faq"
          className="border-t border-[color:var(--line)] bg-[color:var(--paper-warm)] py-14 sm:py-20"
        >
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
            <h2 className="font-display text-[clamp(1.95rem,3.6vw,2.65rem)] font-semibold text-[color:var(--ink)]">
              {str(c.title, "Frequently asked questions")}
            </h2>
            {c.subtitle ? (
              <p className="mt-2 text-base text-[color:var(--ink-soft)]">
                {str(c.subtitle)}
              </p>
            ) : null}
            <div className="mt-10 max-w-[820px] border-t border-[color:var(--line-strong)]">
              {arr<{ q: string; a: string }>(c.items).map((item) => (
                <details
                  key={item.q}
                  className="group border-b border-[color:var(--line-strong)]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-[19px] font-semibold text-[color:var(--ink)] marker:content-none [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="text-lg font-medium text-[color:var(--stamp)] transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="max-w-[70ch] pb-5 text-base leading-relaxed text-[color:var(--ink-soft)]">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      );

    default:
      return null;
  }
}
