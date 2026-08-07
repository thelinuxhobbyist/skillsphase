import Link from "next/link";
import type { ReactNode } from "react";
import type { HomepageSection } from "@horizon/shared";
import {
  DiscoverySearchMock,
  StepIcon,
} from "@/components/homepage-product-mocks";
import { ProductWalkthrough } from "@/components/homepage-product-walkthrough";

function str(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function arr<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function formatHeroTitle(title: string, accent?: string) {
  const marker =
    accent && title.includes(accent)
      ? accent
      : title.includes("because life happens.")
        ? "because life happens."
        : title.includes("Because life happens")
          ? "Because life happens"
          : title.includes("not just a CV.")
            ? "not just a CV."
            : null;
  if (!marker) {
    return <>{title}</>;
  }
  const idx = title.indexOf(marker);
  const lead = title.slice(0, idx).trimEnd();
  const trail = title.slice(idx + marker.length);
  return (
    <>
      <span className="block">{lead}</span>
      <em className="mt-1 block text-[0.92em] font-medium text-primary italic">
        {marker}
        {trail}
      </em>
    </>
  );
}

function Eyebrow({
  children,
  center = false,
}: {
  children: string;
  center?: boolean;
}) {
  return (
    <p
      className={`mb-3.5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-[color:var(--stamp-dark,var(--primary))] ${
        center ? "justify-center" : ""
      }`}
    >
      <span className="size-1.5 rounded-full bg-primary" aria-hidden />
      {children}
    </p>
  );
}

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="btn-primary inline-flex items-center justify-center rounded-full px-[26px] py-3.5 text-[15px] font-semibold transition hover:-translate-y-px"
    >
      {children}
    </Link>
  );
}

function GhostButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full border-[1.5px] border-[color:var(--ink)] px-[26px] py-3.5 text-[15px] font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
    >
      {children}
    </Link>
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
        <section className="px-5 pb-[72px] pt-16 sm:px-8 sm:pb-[120px] sm:pt-24">
          <div className="mx-auto max-w-[1180px]">
            <div className="animate-[dossier-rise_0.7s_ease_both] max-w-2xl">
              <h1 className="font-display text-[clamp(2.625rem,5.4vw,4.125rem)] leading-[1.02] font-semibold tracking-[-0.01em] text-[color:var(--ink)]">
                {formatHeroTitle(
                  str(c.title, "Skills first. Because life happens."),
                  str(c.titleAccent) || undefined,
                )}
              </h1>
              <p className="mt-[26px] max-w-[480px] text-lg leading-relaxed text-[color:var(--ink-soft)]">
                {str(
                  c.body,
                  "You shouldn't have to hide your experience or apologise for your journey. Every skill you've gained is valuable. Showcase it with pride.",
                )}
              </p>
              <div className="mt-[38px] flex flex-wrap gap-3.5">
                <PrimaryButton
                  href={str(c.primaryCtaHref, "/register?as=candidate")}
                >
                  {str(c.primaryCtaLabel, "Create your Skill Profile")}
                </PrimaryButton>
                <GhostButton href={str(c.secondaryCtaHref, "/discover-talent")}>
                  {str(c.secondaryCtaLabel, "Discover talent")}
                </GhostButton>
              </div>
            </div>
          </div>
        </section>
      );

    case "trust":
      return (
        <section className="overflow-x-auto border-y border-[color:var(--line-strong)] bg-[color:var(--ink)] text-[color:var(--paper)]">
          <ul className="mx-auto flex min-w-max max-w-[1180px] items-center px-5 py-3.5 text-xs sm:px-8 md:min-w-0 md:justify-between">
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

    case "featured_candidates":
      return (
        <section id="product" className="px-5 py-[72px] sm:px-8 sm:py-[110px]">
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-12 max-w-[600px] sm:mb-16">
              {c.eyebrow ? <Eyebrow>{str(c.eyebrow)}</Eyebrow> : null}
              <h2 className="font-display text-[clamp(1.875rem,3.6vw,2.625rem)] leading-[1.1] font-semibold tracking-[-0.01em] text-[color:var(--ink)]">
                {str(c.title, "Your application, rebuilt around proof")}
              </h2>
              <p className="mt-4 text-[17px] text-[color:var(--ink-soft)]">
                {str(
                  c.subtitle,
                  "Instead of a CV timeline, employers see what you can do—supported by evidence that works for any profession.",
                )}
              </p>
            </div>

            <ProductWalkthrough
              callouts={arr<{ label: string; detail?: string }>(c.callouts)}
            />

            <div className="mt-14">
              <PrimaryButton
                href={str(c.primaryCtaHref, "/register?as=candidate")}
              >
                  {str(c.primaryCtaLabel, "Create your SkillsPhase profile")}
                </PrimaryButton>
            </div>
          </div>
        </section>
      );

    case "career_journeys":
      return (
        <section className="border-y border-[color:var(--line)] bg-[color:var(--paper-warm)] px-5 py-[72px] sm:px-8 sm:py-[100px]">
          <div className="mx-auto max-w-[1180px]">
            <div className="mx-auto mb-[50px] max-w-[560px] text-center">
              {c.eyebrow ? <Eyebrow center>{str(c.eyebrow)}</Eyebrow> : null}
              <h2 className="font-display text-[clamp(1.75rem,3.4vw,2.375rem)] font-semibold tracking-[-0.01em] text-[color:var(--ink)]">
                {str(c.title, "Real careers aren't linear.")}
              </h2>
              {c.subtitle ? (
                <p className="mt-3.5 text-[16.5px] text-[color:var(--ink-soft)]">
                  {str(c.subtitle)}
                </p>
              ) : null}
            </div>

            <ul className="mx-auto flex max-w-[920px] flex-wrap justify-center gap-3">
              {arr<{ title: string }>(c.items).map((item) => (
                <li
                  key={item.title}
                  className="rounded-full border border-[color:var(--line)] bg-white px-5 py-[11px] text-[14.5px] font-medium text-[color:var(--ink)] transition hover:-translate-y-0.5 hover:border-primary hover:bg-[color-mix(in_oklch,var(--primary)_14%,white)]"
                >
                  {item.title}
                </li>
              ))}
            </ul>

            {c.body ? (
              <p className="mt-[46px] text-center font-display text-[19px] italic text-[color:var(--ink-soft)]">
                {(() => {
                  const body = str(c.body);
                  const highlight = body.includes("SkillsPhase sees capability.")
                    ? "SkillsPhase sees capability."
                    : body.includes("SkillsPhase sees skills.")
                      ? "SkillsPhase sees skills."
                      : null;
                  if (!highlight) return body;
                  const idx = body.indexOf(highlight);
                  return (
                    <>
                      {body.slice(0, idx)}
                      <strong className="font-semibold not-italic text-[color:var(--ink)]">
                        {highlight}
                      </strong>
                      {body.slice(idx + highlight.length)}
                    </>
                  );
                })()}
              </p>
            ) : null}
          </div>
        </section>
      );

    case "how_it_works": {
      const steps = arr<{ title: string; body: string }>(c.steps);
      return (
        <section className="px-5 py-[72px] sm:px-8 sm:py-[110px]">
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-[70px] text-center">
              {c.eyebrow ? <Eyebrow center>{str(c.eyebrow)}</Eyebrow> : null}
              <h2 className="font-display text-[clamp(1.75rem,3.4vw,2.375rem)] font-semibold tracking-[-0.01em] text-[color:var(--ink)]">
                {str(c.title, "How it works")}
              </h2>
            </div>

            <ol className="relative grid gap-12 md:grid-cols-3 md:gap-0">
              <div
                aria-hidden
                className="absolute top-[29px] right-[16%] left-[16%] hidden h-[1.5px] bg-[repeating-linear-gradient(to_right,color-mix(in_oklch,var(--primary)_35%,var(--line))_0_8px,transparent_8px_16px)] md:block"
              />
              {steps.map((step, index) => (
                <li
                  key={`${step.title}-${index}`}
                  className="relative px-6 text-center"
                >
                  <StepIcon index={index} />
                  <p className="mt-[22px] font-mono text-[11.5px] uppercase tracking-[0.1em] text-[color:var(--stamp-dark,var(--primary))]">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-2.5 font-display text-xl font-semibold text-[color:var(--ink)]">
                    {step.title}
                  </h3>
                  <p className="mx-auto mt-2 max-w-[220px] text-[14.5px] leading-relaxed text-[color:var(--ink-soft)]">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      );
    }

    case "product_showcase":
      return (
        <section className="border-y border-[color:var(--line)] bg-[color:var(--paper-warm)] px-5 py-[72px] sm:px-8 sm:py-[100px]">
          <div className="mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-[70px]">
            <div>
              {c.eyebrow ? <Eyebrow>{str(c.eyebrow)}</Eyebrow> : null}
              <h2 className="font-display text-[clamp(1.75rem,3.2vw,2.25rem)] leading-[1.15] font-semibold tracking-[-0.01em] text-[color:var(--ink)]">
                {str(c.title, "Recruit by capability, not keyword bingo")}
              </h2>
              {c.subtitle ? (
                <p className="mt-4 text-[16.5px] text-[color:var(--ink-soft)]">
                  {str(c.subtitle)}
                </p>
              ) : null}
              <Link
                href={str(c.primaryCtaHref, "/discover-talent")}
                className="mt-[22px] inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-[color:var(--stamp-dark,var(--primary))] hover:underline"
              >
                {str(c.primaryCtaLabel, "Browse candidates")} →
              </Link>
            </div>
            <DiscoverySearchMock />
          </div>
        </section>
      );

    case "comparison":
      return (
        <section className="px-5 py-[72px] sm:px-8 sm:py-[110px]">
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-[60px] text-center">
              {c.eyebrow ? <Eyebrow center>{str(c.eyebrow)}</Eyebrow> : null}
              <h2 className="font-display text-[clamp(1.75rem,3.4vw,2.375rem)] font-semibold tracking-[-0.01em] text-[color:var(--ink)]">
                {str(c.title, "A better application than a CV")}
              </h2>
            </div>

            <div className="mx-auto grid max-w-[820px] gap-[26px] md:grid-cols-2">
              <div className="rounded-[18px] border border-[color:var(--line)] bg-[color:var(--paper-warm)] p-[34px]">
                <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-soft)]">
                  Before
                </p>
                <h3 className="mb-5 font-display text-[22px] font-semibold text-[color:var(--ink)]">
                  {str(c.traditionalTitle, "Traditional CV")}
                </h3>
                <ul>
                  {arr<string>(c.traditionalItems).map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-[11px] py-[9px] text-[15px] text-[color:var(--ink-soft)] line-through decoration-[#B9C6BE]"
                    >
                      <span className="size-4 shrink-0 rounded-full border-[1.5px] border-[#B9C6BE]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[18px] border-[1.5px] border-primary bg-white p-[34px] shadow-[0_20px_50px_-20px_rgba(11,23,18,0.25)]">
                <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--stamp-dark,var(--primary))]">
                  After
                </p>
                <h3 className="mb-5 font-display text-[22px] font-semibold text-[color:var(--ink)]">
                  {str(c.skillsphaseTitle, "SkillsPhase profile")}
                </h3>
                <ul>
                  {arr<string>(c.skillsphaseItems).map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-[11px] py-[9px] text-[15px] text-[color:var(--ink)]"
                    >
                      <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary">
                        <svg
                          viewBox="0 0 24 24"
                          className="size-2.5 text-primary-foreground"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      );

    case "businesses_cta":
      return (
        <section className="bg-[color:var(--ink)] px-5 py-14 text-center text-[color:var(--paper)] sm:px-8 sm:py-20">
          <h2 className="mx-auto max-w-3xl font-display text-[clamp(1.95rem,4vw,2.75rem)] font-medium italic">
            {str(c.title)}
          </h2>
          <p className="mx-auto mt-3.5 max-w-xl text-base leading-relaxed text-ink-foreground/70">
            {str(c.body)}
          </p>
          <Link
            href={str(c.ctaHref, "/register?as=business")}
            className="mt-8 inline-flex items-center rounded-full border border-white/50 px-5 py-3 text-sm font-medium text-[color:var(--paper)] transition hover:border-white hover:bg-white hover:text-[color:var(--ink)]"
          >
            {str(c.ctaLabel, "Register as a business")}
          </Link>
        </section>
      );

    case "stats":
      return (
        <section className="border-y border-[color:var(--line)] bg-[color:var(--paper-warm)] px-5 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-[1180px]">
            <h2 className="font-display text-[clamp(1.95rem,3.6vw,2.65rem)] font-semibold text-[color:var(--ink)]">
              {str(c.title)}
            </h2>
            {c.subtitle ? (
              <p className="mt-2 text-base text-[color:var(--ink-soft)]">
                {str(c.subtitle)}
              </p>
            ) : null}
            <ul className="mt-9 grid grid-cols-2 gap-y-8 md:grid-cols-4">
              {arr<{ value: string; label: string }>(c.items).map(
                (stat, index) => (
                  <li
                    key={stat.label}
                    className={
                      index === 0
                        ? "md:pl-0"
                        : "md:border-l md:border-[color:var(--line-strong)] md:pl-6"
                    }
                  >
                    <p className="text-[clamp(1.875rem,3.4vw,2.6rem)] font-semibold text-primary">
                      {stat.value}
                    </p>
                    <p className="mt-1.5 text-sm text-[color:var(--ink-soft)]">
                      {stat.label}
                    </p>
                  </li>
                ),
              )}
            </ul>
          </div>
        </section>
      );

    case "differentiators":
      return null;

    case "testimonials":
      return null;

    case "closing_cta":
      return (
        <section className="border-y border-[color-mix(in_oklch,var(--primary)_35%,var(--line))] bg-[color-mix(in_oklch,var(--primary)_14%,white)] px-5 py-[72px] text-center sm:px-8 sm:py-[110px]">
          <h2 className="font-display text-[clamp(1.875rem,4vw,2.875rem)] font-semibold tracking-[-0.01em] text-[color:var(--ink)]">
            {formatHeroTitle(
              str(c.title, "Apply for jobs with proof, not just a CV."),
              str(c.titleAccent) || undefined,
            )}
          </h2>
          <p className="mt-[18px] text-[17px] text-[color:var(--ink-soft)]">
            {str(c.body, "Create a SkillsPhase profile once—then use it to apply.")}
          </p>
          <div className="mt-[34px] flex flex-wrap justify-center gap-3.5">
            <PrimaryButton
              href={str(c.primaryCtaHref, "/register?as=candidate")}
            >
              {str(c.primaryCtaLabel, "Create your SkillsPhase profile")}
            </PrimaryButton>
            <GhostButton href={str(c.secondaryCtaHref, "/register?as=business")}>
              {str(c.secondaryCtaLabel, "Register as a business")}
            </GhostButton>
          </div>
        </section>
      );

    case "faq":
      return (
        <section
          id="faq"
          className="border-t border-[color:var(--line)] bg-[color:var(--paper-warm)] px-5 py-14 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-[1180px]">
            <h2 className="font-display text-[clamp(1.95rem,3.6vw,2.65rem)] font-semibold text-[color:var(--ink)]">
              {str(c.title, "Frequently asked questions")}
            </h2>
            <div className="mt-10 max-w-[820px] border-t border-[color:var(--line-strong)]">
              {arr<{ q: string; a: string }>(c.items).map((item) => (
                <details
                  key={item.q}
                  className="group border-b border-[color:var(--line-strong)]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-[19px] font-semibold text-[color:var(--ink)] marker:content-none [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="text-lg font-medium text-primary transition group-open:rotate-45">
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
