import { AdminHeader } from "@/components/admin-header";
import Link from "next/link";
import { getAdminReports } from "@/lib/api";
import { requireAdminPage } from "@/lib/require-admin";

export default async function AdminReportsPage() {
  const { token } = await requireAdminPage();
  const reports = await getAdminReports(token);

  const stats = [
    ["Pending businesses", reports.pendingBusinesses],
    ["Verified businesses", reports.verifiedBusinesses],
    ["Total businesses", reports.totalBusinesses],
    ["Business users", reports.totalBusinessUsers],
    ["Total candidates", reports.totalCandidates],
    ["Candidates with complete profile", reports.candidatesWithCompleteProfile],
  ] as const;

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/admin" className="text-sm text-primary underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 font-display text-4xl text-primary">
          Reports
        </h1>
        <p className="mt-2 text-[color:var(--foreground)]/75">{reports.note}</p>
        <section className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {stats.map(([label, value]) => (
            <div
              key={label}
              className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4"
            >
              <p className="text-sm text-[color:var(--foreground)]/70">{label}</p>
              <p className="mt-1 text-3xl font-semibold text-primary">{value}</p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
