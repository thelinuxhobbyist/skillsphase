import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
          404
        </p>
        <h1 className="mt-3 font-display text-4xl text-primary">
          Page not found
        </h1>
        <p className="mt-3 text-[color:var(--foreground)]/75">
          That page does not exist or may have moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white"
        >
          Back home
        </Link>
      </main>
    </>
  );
}
