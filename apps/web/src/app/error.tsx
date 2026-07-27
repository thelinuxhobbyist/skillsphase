"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="text-sm font-medium text-primary">
        500
      </p>
      <h1 className="mt-3 font-sans text-4xl text-primary">
        Something went wrong
      </h1>
      <p className="mt-3 text-[color:var(--foreground)]/75">
        An unexpected error occurred. Try again, or return home.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-3 text-sm font-semibold text-primary"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
