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

      <div className="relative mx-auto flex w-full max-w-[40rem] flex-1 flex-col justify-center px-6 py-16 sm:px-8">
        <div className="animate-[dossier-rise_0.6s_ease_both] flex items-center gap-2.5">
          <StampMark className="h-[29px] w-[29px] text-foreground" />
          <p className="font-display text-[19px] font-semibold tracking-tight text-foreground">
            SkillsPhase
          </p>
        </div>
        <h1 className="mt-10 animate-[dossier-rise_0.7s_ease_both] font-display text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.1] font-bold tracking-[-0.03em] text-[color:var(--ink)]">
          We&apos;re working on something.
        </h1>
        <p className="mt-5 max-w-[28rem] animate-[dossier-rise_0.8s_ease_both] text-base leading-relaxed text-[color:var(--ink-soft)] sm:text-lg">
          Check back later.
        </p>
      </div>

      <p className="relative mx-auto w-full max-w-[40rem] px-6 pb-8 text-xs text-[color:var(--ink-soft)] sm:px-8">
        © {new Date().getFullYear()} SkillsPhase
      </p>
    </main>
  );
}
