import { AdminEmployersPanel } from "@/components/admin-employers-panel";
import { AdminHeader } from "@/components/admin-header";
import Link from "next/link";
import { getAdminDashboard, listAdminEmployers } from "@/lib/api";
import { requireAdminPage } from "@/lib/require-admin";

export default async function AdminDashboardPage() {
  const { token } = await requireAdminPage();

  const [stats, employers] = await Promise.all([
    getAdminDashboard(token),
    listAdminEmployers(token, "pending_review"),
  ]);

  return (
    <>
      <AdminHeader />
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
          <Link href="/admin/staff" className="underline">
            Administrators
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
          <Link href="/admin/homepage" className="underline">
            Homepage
          </Link>
          <Link href="/admin/reports" className="underline">
            Reports
          </Link>
          <Link href="/admin/account" className="underline">
            Account
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
                Find a user
              </h2>
              <p className="mt-2 text-sm text-[color:var(--foreground)]/70">
                Search by name or email to view, suspend, or remove an account.
                Accounts are not listed here in bulk.
              </p>
              <form
                action="/admin/users"
                method="get"
                className="mt-4 flex flex-wrap gap-2"
              >
                <input
                  name="q"
                  type="search"
                  required
                  minLength={2}
                  placeholder="Name or email"
                  className="min-w-0 w-full flex-1 rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm sm:min-w-[16rem]"
                />
                <button
                  type="submit"
                  className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
                >
                  Search
                </button>
              </form>
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
                Your account
              </h2>
              <p className="mt-2 text-sm text-[color:var(--foreground)]/70">
                Change your password, email, or display name on the account page.
                That is intentional — profile edits stay separate from day-to-day
                admin tools.
              </p>
              <Link
                href="/admin/account"
                className="mt-3 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
              >
                Manage password &amp; profile
              </Link>
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
              <Link
                href="/admin/audit"
                className="mt-3 inline-block text-sm text-brand underline"
              >
                Full audit log
              </Link>
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
