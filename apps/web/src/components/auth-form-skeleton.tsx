/**
 * Placeholder shown while clerk-js downloads and initialises. Without it the
 * auth pages render only their heading, which reads as a broken page.
 */
export function AuthFormSkeleton() {
  return (
    <div
      aria-live="polite"
      aria-busy="true"
      className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-soft"
    >
      <span className="sr-only">Loading sign-in form…</span>
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      <div className="mt-6 h-10 w-full animate-pulse rounded-md bg-muted" />
      <div className="mt-4 h-3 w-16 animate-pulse rounded bg-muted" />
      <div className="mt-4 space-y-3">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      </div>
      <div className="mt-6 h-10 w-full animate-pulse rounded-md bg-muted" />
    </div>
  );
}
