import Link from "next/link";

export default function ApplicationsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/dashboard" className="text-sm text-brand underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
        My applications
      </h1>
      <p className="mt-4 text-[color:var(--foreground)]/75">
        Application tracking will appear here once job applications are
        implemented.
      </p>
    </main>
  );
}
