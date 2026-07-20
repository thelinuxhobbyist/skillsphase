import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function AccessDeniedPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-800">
          403
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
          Access denied
        </h1>
        <p className="mt-4 text-[color:var(--foreground)]/75">
          You do not have permission to access the administrator area.
          Administrator accounts can only be created by a Root Administrator —
          not through public registration.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white"
        >
          Return to homepage
        </Link>
      </main>
    </>
  );
}
