function StampMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-current ${className ?? "h-9 w-9"}`}
    >
      <span className="absolute inset-[3px] rounded-full border border-dashed border-current opacity-60" />
      <svg
        viewBox="0 0 24 24"
        className="relative h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

const pillars = [
  {
    title: "Capabilities",
    detail: "What you can do — not just a job title.",
  },
  {
    title: "Evidence",
    detail: "Proof that shows the work behind the skill.",
  },
  {
    title: "Impact",
    detail: "Outcomes you have delivered, in plain language.",
  },
];

export function ComingSoonPage() {
  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[image:var(--gradient-hero)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-8rem] size-[28rem] rounded-full border border-[color:var(--line)] opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-8 right-[-3rem] size-[18rem] rounded-full border border-dashed border-[color:var(--primary)]/40"
      />

      <header className="relative mx-auto flex w-full max-w-[720px] items-center gap-2.5 px-6 pt-10 sm:px-8">
        <StampMark className="h-[29px] w-[29px] text-foreground" />
        <p className="font-display text-[19px] font-semibold tracking-tight text-foreground">
          SkillsPhase
        </p>
      </header>

      <div className="relative mx-auto flex w-full max-w-[720px] flex-1 flex-col justify-center px-6 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow flex items-center gap-2 animate-[dossier-rise_0.6s_ease_both]">
          <span className="size-1.5 rounded-full bg-primary" />
          Coming soon
        </p>
        <h1 className="mt-5 animate-[dossier-rise_0.7s_ease_both] font-display text-[clamp(2.5rem,7vw,4.25rem)] leading-[1.05] font-bold tracking-[-0.03em] text-[color:var(--ink)]">
          We&apos;re building something.
          <em className="mt-2 block text-[0.72em] font-semibold text-primary italic">
            Because life happens.
          </em>
        </h1>
        <p className="mt-7 max-w-[38rem] animate-[dossier-rise_0.8s_ease_both] font-display text-[1.2rem] leading-snug font-medium text-[color:var(--ink)] sm:text-[1.35rem]">
          Work changes. Life changes. Your skills don&apos;t disappear.
        </p>
        <p className="mt-4 max-w-[38rem] animate-[dossier-rise_0.85s_ease_both] text-base leading-relaxed text-[color:var(--ink-soft)] sm:text-lg">
          SkillsPhase is a skills-first jobs platform. We&apos;re not open to
          the public yet — the live site will be here when it&apos;s ready.
        </p>

        <ul className="mt-12 grid gap-3 sm:grid-cols-3">
          {pillars.map((pillar, index) => (
            <li
              key={pillar.title}
              className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/80 px-4 py-4 shadow-soft"
              style={{
                animation: `dossier-rise 0.7s ease both`,
                animationDelay: `${0.15 + index * 0.08}s`,
              }}
            >
              <p className="font-display text-sm font-semibold text-[color:var(--ink)]">
                {pillar.title}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--ink-soft)]">
                {pillar.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative mx-auto w-full max-w-[720px] px-6 pb-8 text-xs text-[color:var(--ink-soft)] sm:px-8">
        © {new Date().getFullYear()} SkillsPhase. Check back soon.
      </p>
    </main>
  );
}
