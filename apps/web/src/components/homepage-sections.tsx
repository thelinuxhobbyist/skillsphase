import Link from "next/link";
import type { HomepageSection } from "@horizon/shared";
import { AVAILABILITY_LABELS } from "@horizon/shared";

function str(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function arr<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function availabilityLabel(value: unknown): string {
  if (typeof value === "string" && value in AVAILABILITY_LABELS) {
    return AVAILABILITY_LABELS[value as keyof typeof AVAILABILITY_LABELS];
  }
  return typeof value === "string" ? value : "";
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
}: {
  sections: HomepageSection[];
}) {
  return (
    <>
      {sections.map((section) => (
        <HomepageSectionBlock key={section.id} section={section} />
      ))}
    </>
  );
}

function HomepageSectionBlock({ section }: { section: HomepageSection }) {
  const c = section.content;

  switch (section.type) {
    case "hero":
      return (
        <section className="border-b border-[color:var(--line)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--foreground)_2%,transparent),transparent_40%),var(--background)] px-4 pb-14 pt-16 sm:px-6 sm:pb-16 sm:pt-20">
          <div className="mx-auto grid max-w-[1180px] items-center gap-12 md:grid-cols-[1.05fr_1fr] md:gap-14">
            <div className="animate-[dossier-rise_0.7s_ease_both]">
              <p className="eyebrow">{str(c.eyebrow, "Skills-first hiring")}</p>
              <h1 className="mt-4 max-w-xl font-sans text-[clamp(2.25rem,5.2vw,3.75rem)] leading-[1.06] font-semibold tracking-[-0.01em] text-[color:var(--ink)]">
                {formatHeroTitle(str(c.title, "Skills first. Because life happens."))}
              </h1>
              <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-[color:var(--ink-soft)]">
                {str(c.body)}
              </p>
              <div className="mt-8 flex flex-wrap gap-3.5">
                <Link
                  href={str(c.primaryCtaHref, "/register?as=candidate")}
                  className="btn-primary inline-flex items-center rounded-[var(--radius)] px-5 py-3 text-sm font-medium"
                >
                  {str(c.primaryCtaLabel, "Create your Skill Profile")}
                </Link>
                <Link
                  href={str(c.secondaryCtaHref, "/discover-talent")}
                  className="inline-flex items-center rounded-[var(--radius)] border border-[color:var(--line-strong)] bg-transparent px-5 py-3 text-sm font-medium text-[color:var(--ink)] transition hover:border-[color:var(--ink)] hover:bg-foreground/5"
                >
                  {str(c.secondaryCtaLabel, "Discover talent")}
                </Link>
              </div>
            </div>

            <div className="relative animate-[dossier-rise_0.85s_ease_0.08s_both] rounded-md border border-[color:var(--folder-line)] bg-[color:var(--folder)] px-5 pb-8 pt-7 shadow-lift sm:px-6">
              <span className="absolute -top-3.5 left-6 rounded-t-[5px] border border-b-0 border-[color:var(--folder-line)] bg-[color:var(--folder)] px-3 py-1.5 text-xs text-[color:var(--ink-soft)]">
                FILE — CAREER TIMELINE
              </span>
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span>CANDIDATE 04471</span>
                <span>STATUS: ACTIVE</span>
              </div>
              <HeroDossierArt />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>EVIDENCE: 6 PROJECTS · 2 CERTS</span>
                <span>REF. SP-2026</span>
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
        <section className="border-y border-[color:var(--line)] bg-[color:var(--paper-warm)] py-20">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
            <p className="eyebrow">{str(c.title, "How it works")}</p>
            <h2 className="mt-3.5 max-w-2xl font-sans text-[clamp(1.95rem,3.6vw,2.65rem)] font-semibold tracking-[-0.01em] text-[color:var(--ink)]">
              {str(c.subtitle, "Three simple steps from profile to conversation.")}
            </h2>
            <ol className="mt-12 grid border-t border-[color:var(--line-strong)] md:grid-cols-3">
              {arr<{ title: string; body: string }>(c.steps).map((step, index) => (
                <li
                  key={`${step.title}-${index}`}
                  className={`border-[color:var(--line-strong)] py-7 md:border-l md:py-8 md:pl-6 ${index === 0 ? "md:border-l-0 md:pl-0" : ""} border-t md:border-t-0 first:border-t-0`}
                >
                  <p className="text-xs font-medium text-[color:var(--stamp)]">
                    FILE 0{index + 1}
                  </p>
                  <h3 className="mt-2.5 font-sans text-[1.35rem] font-semibold text-[color:var(--ink)]">
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
        <section className="py-20">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
            <p className="eyebrow">
              {str(c.title, "What makes SkillsPhase different")}
            </p>
            <h2 className="mt-3.5 max-w-2xl font-sans text-[clamp(1.95rem,3.6vw,2.65rem)] font-semibold tracking-[-0.01em] text-[color:var(--ink)]">
              {str(
                c.subtitle,
                "A hiring platform built around skills and evidence.",
              )}
            </h2>
            <ul className="mt-12 grid gap-px border border-[color:var(--line-strong)] bg-[color:var(--line-strong)] sm:grid-cols-2">
              {arr<{ title: string; body: string }>(c.items).map((item, index) => (
                <li
                  key={item.title}
                  className="border-l-4 bg-[color:var(--paper)] px-6 py-8 sm:px-8 sm:py-9"
                  style={{ borderLeftColor: accents[index % accents.length] }}
                >
                  <h3 className="font-sans text-[1.4rem] font-semibold text-[color:var(--ink)] sm:text-[1.5rem]">
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
        <section className="bg-[color:var(--ink)] px-4 py-20 text-center text-[color:var(--paper)] sm:px-6">
          <p className="eyebrow !text-[color:var(--mustard)] justify-center before:!bg-[color:var(--mustard)]">
            For businesses
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl font-sans text-[clamp(1.95rem,4vw,2.75rem)] font-medium italic">
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
        <section className="border-y border-[color:var(--line)] bg-[color:var(--paper-warm)] py-20">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
            <p className="eyebrow">The record so far</p>
            <h2 className="mt-3.5 font-sans text-[clamp(1.95rem,3.6vw,2.65rem)] font-semibold text-[color:var(--ink)]">
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
      const demoCards = arr<{
        title: string;
        skills: string[];
        yearsExperience: number;
        topProject: string;
        availability: string;
      }>(c.demoCards);

      return (
        <section className="py-20">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">See it in action</p>
                <h2 className="mt-3.5 font-sans text-[clamp(1.95rem,3.6vw,2.65rem)] font-semibold text-[color:var(--ink)]">
                  {str(c.title, "Example skill profiles")}
                </h2>
                <p className="mt-2 text-base text-[color:var(--ink-soft)]">
                  {str(c.subtitle)}
                </p>
              </div>
              <Link
                href="/discover-talent"
                className="text-sm font-medium text-primary hover:underline"
              >
                Browse real Skill Profiles →
              </Link>
            </div>

            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {demoCards.map((card) => (
                <li
                  key={card.title}
                  className="rounded-[5px] border border-[color:var(--folder-line)] bg-[color:var(--folder)] p-5 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-sans text-[1.35rem] font-semibold text-[color:var(--ink)]">
                      {card.title}
                    </h3>
                    <span className="-rotate-3 rounded-full border border-[color:var(--stamp)] px-2.5 py-0.5 text-xs font-medium text-primary whitespace-nowrap">
                      EXAMPLE
                    </span>
                  </div>
                  {card.skills.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {card.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-[color:var(--line-strong)] bg-[color:var(--paper)] px-2.5 py-1 text-xs text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <p className="mt-3.5 text-sm text-[color:var(--ink-soft)]">
                    {card.yearsExperience} years experience
                  </p>
                  <p className="mt-1 text-base text-[color:var(--ink)]">
                    {card.topProject}
                  </p>
                  <p className="mt-3.5 flex items-center gap-1.5 text-sm font-medium text-primary before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:bg-[color:var(--verified)] before:content-['']">
                    {availabilityLabel(card.availability)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      );
    }

    case "testimonials":
      return (
        <section className="border-y border-[color:var(--line)] bg-[color:var(--paper-warm)] py-20">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
            <p className="eyebrow">Voices from the community</p>
            <h2 className="mt-3.5 max-w-2xl font-sans text-[clamp(1.95rem,3.6vw,2.65rem)] font-semibold text-[color:var(--ink)]">
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
                      className="pointer-events-none absolute top-1.5 left-4 font-sans text-[46px] leading-none text-[color:var(--folder-line)]"
                    >
                      “
                    </span>
                    <blockquote className="relative mt-3.5 font-sans text-lg leading-snug italic text-[color:var(--ink)]">
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
        <section className="px-4 py-20 text-center sm:px-6">
          <p className="eyebrow justify-center">Ready when you are</p>
          <h2 className="mt-4 font-sans text-[clamp(1.95rem,4vw,2.65rem)] font-semibold text-[color:var(--ink)]">
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
          className="border-t border-[color:var(--line)] bg-[color:var(--paper-warm)] py-20"
        >
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
            <p className="eyebrow">Frequently asked questions</p>
            <h2 className="mt-3.5 font-sans text-[clamp(1.95rem,3.6vw,2.65rem)] font-semibold text-[color:var(--ink)]">
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
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-sans text-[19px] font-semibold text-[color:var(--ink)] marker:content-none [&::-webkit-details-marker]:hidden">
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

function HeroDossierArt() {
  return (
    <svg
      viewBox="0 0 520 300"
      className="mt-1.5 w-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <line
        x1="20"
        y1="150"
        x2="500"
        y2="150"
        stroke="var(--ink)"
        strokeWidth="1.5"
        strokeDasharray="1 6"
        strokeLinecap="round"
      />
      <circle cx="20" cy="150" r="4" fill="var(--ink)" />
      <circle cx="500" cy="150" r="4" fill="var(--ink)" />
      <rect x="150" y="132" width="150" height="36" rx="2" fill="var(--ink)" />
      <text
        x="225"
        y="155"
        textAnchor="middle"
        fontFamily="var(--font-inter), ui-sans-serif, system-ui, sans-serif"
        fontSize="10.5"
        letterSpacing="1"
        fill="var(--paper)"
      >
        CAREGIVING — 14 MOS
      </text>
      <g
        className="origin-center animate-[stamp-in_0.9s_ease_0.35s_both]"
        style={{ transformOrigin: "225px 150px" }}
        transform="translate(225,150) rotate(-9)"
      >
        <circle r="34" fill="none" stroke="var(--stamp)" strokeWidth="2" />
        <circle
          r="28"
          fill="none"
          stroke="var(--stamp)"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        <text
          x="0"
          y="-3"
          textAnchor="middle"
          fontFamily="var(--font-inter), ui-sans-serif, system-ui, sans-serif"
          fontWeight="600"
          fontSize="9.5"
          fill="var(--stamp)"
        >
          SKILLS
        </text>
        <text
          x="0"
          y="9"
          textAnchor="middle"
          fontFamily="var(--font-inter), ui-sans-serif, system-ui, sans-serif"
          fontWeight="600"
          fontSize="9.5"
          fill="var(--stamp)"
        >
          VERIFIED
        </text>
      </g>
    </svg>
  );
}
