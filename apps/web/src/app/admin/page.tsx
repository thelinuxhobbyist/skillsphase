import { AdminEmployersPanel } from "@/components/admin-employers-panel";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminDashboard, getCurrentUser, listAdminEmployers } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function AdminDashboardPage() {
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

  if (user.role !== "admin") {
    redirect(dashboardPathForRole(user.role));
  }

  const [stats, employers] = await Promise.all([
    getAdminDashboard(token),
    listAdminEmployers(token, "pending_review"),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
            Administrator
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
            Admin dashboard
          </h1>
        </div>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Pending employers" value={stats.pendingEmployers} />
          <Stat label="Job seekers" value={stats.totalJobSeekers} />
          <Stat label="Active jobs" value={stats.activeJobs} />
          <Stat label="Approved employers" value={stats.approvedEmployers} />
          <Stat label="Total employers" value={stats.totalEmployers} />
          <Stat label="Pending applications" value={stats.pendingApplications} />
        </section>

        <nav className="mb-8 flex flex-wrap gap-4 text-sm font-semibold text-brand">
          <Link href="/admin/employers" className="underline">
            Employers
          </Link>
          <Link href="/admin/users" className="underline">
            Users
          </Link>
          <Link href="/admin/jobs" className="underline">
            Jobs
          </Link>
          <Link href="/admin/jobs/new" className="underline">
            Create job
          </Link>
          <Link href="/admin/audit" className="underline">
            Audit
          </Link>
          <Link href="/admin/reports" className="underline">
            Reports
          </Link>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <section>
            <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
              Pending employer approvals
            </h2>
            <div className="mt-4">
              <AdminEmployersPanel employers={employers} />
            </div>
          </section>
          <section className="space-y-8">
            <div>
              <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
                Recent users
              </h2>
              <ul className="mt-4 space-y-2 text-sm">
                {stats.recentUsers.length === 0 ? (
                  <li className="text-[color:var(--foreground)]/70">None yet.</li>
                ) : (
                  stats.recentUsers.map((u) => (
                    <li key={u.id} className="text-[color:var(--foreground)]/80">
                      {[u.firstName, u.lastName].filter(Boolean).join(" ") ||
                        u.email}{" "}
                      · {u.role.replace("_", " ")}
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
                Recent admin actions
              </h2>
              <ul className="mt-4 space-y-2 text-sm">
                {stats.recentActions.length === 0 ? (
                  <li className="text-[color:var(--foreground)]/70">None yet.</li>
                ) : (
                  stats.recentActions.map((log) => (
                    <li key={log.id} className="text-[color:var(--foreground)]/80">
                      {log.action} · {log.adminName}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
      <p className="text-sm text-[color:var(--foreground)]/70">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-brand">{value}</p>
    </div>
  );
}
