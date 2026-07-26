type JobSearchFormProps = {
  className?: string;
  compact?: boolean;
  variant?: "default" | "hero";
};

export function JobSearchForm({
  className,
  compact,
  variant = "default",
}: JobSearchFormProps) {
  const isHero = variant === "hero";

  const inputClass = isHero
    ? "w-full rounded-md border border-white/40 bg-white/95 text-slate-900 placeholder:text-slate-500 shadow-lg backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/60 transition"
    : "min-w-0 flex-1 rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm";

  const buttonClass = isHero
    ? "btn-primary shrink-0 rounded-md bg-brand-accent px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] shadow-md flex items-center justify-center gap-2 cursor-pointer"
    : "btn-primary shrink-0 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 cursor-pointer";

  return (
    <form
      action="/jobs"
      method="get"
      className={className}
      aria-label="Search open roles"
    >
      <div
        className={
          isHero
            ? "grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
            : compact
              ? "flex flex-col gap-2"
              : "flex flex-col gap-2 sm:flex-row sm:items-center"
        }
      >
        <div className={isHero ? "relative flex-1" : "flex-1"}>
          {isHero ? (
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          ) : null}
          <input
            name="keyword"
            placeholder="Keyword or skill (e.g. Finance, Ops)"
            className={
              isHero ? `${inputClass} pl-10 pr-4 py-3.5` : inputClass
            }
          />
        </div>

        <div className={isHero ? "relative flex-1" : "flex-1"}>
          {isHero ? (
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          ) : null}
          <input
            name="location"
            placeholder="Location (e.g. London, Remote)"
            className={
              isHero
                ? `${inputClass} pl-10 pr-4 py-3.5`
                : `${inputClass} sm:max-w-[10rem]`
            }
          />
        </div>

        <button type="submit" className={buttonClass}>
          {isHero ? (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>Search jobs</span>
            </>
          ) : (
            "Search"
          )}
        </button>
      </div>
    </form>
  );
}
