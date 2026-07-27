import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-sm font-medium text-primary">
          403
        </p>
        <h1 className="mt-3 font-sans text-4xl text-primary">
          Access denied
        </h1>
        <p className="mt-3 text-[color:var(--foreground)]/75">
          You do not have permission to view this page.
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
