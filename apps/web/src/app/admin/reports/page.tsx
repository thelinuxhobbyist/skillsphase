import { SiteHeader } from "@/components/site-header";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminReports, getCurrentUser } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function AdminReportsPage() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/login");
  const token = await getToken();
  if (!token) redirect("/onboarding");

  let user;
  try {
    user = await getCurrentUser(token);
  } catch {
    redirect("/onboarding");
  }
  if (user.role !== "admin") redirect(dashboardPathForRole(user.role));

  const reports = await getAdminReports(token);

  const stats = [
    ["Pending employers", reports.pendingEmployers],
    ["Approved employers", reports.approvedEmployers],
    ["Total employers", reports.totalEmployers],
    ["Employer users", reports.totalEmployerUsers],
    ["Job seekers", reports.totalJobSeekers],
    ["Active jobs", reports.activeJobs],
    ["Pending applications", reports.pendingApplications],
  ] as const;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/admin" className="text-sm text-brand underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
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
              <p className="mt-1 text-3xl font-semibold text-brand">{value}</p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
