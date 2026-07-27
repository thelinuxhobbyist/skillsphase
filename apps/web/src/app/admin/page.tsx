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
      <main className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6">
        <div className="mb-10">
          <p className="eyebrow">Administrator</p>
          <h1 className="mt-3 font-sans text-[clamp(2rem,4vw,2.75rem)] font-semibold text-[color:var(--ink)]">
            Admin dashboard
          </h1>
        </div>

        <section className="mb-10 grid gap-px border border-[color:var(--line-strong)] bg-[color:var(--line-strong)] sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Pending businesses" value={stats.pendingBusinesses} />
          <Stat label="Total candidates" value={stats.totalCandidates} />
          <Stat
            label="Candidates with complete profile"
            value={stats.candidatesWithCompleteProfile}
          />
          <Stat label="Verified businesses" value={stats.verifiedBusinesses} />
          <Stat label="Total businesses" value={stats.totalBusinesses} />
        </section>

        <nav className="mb-10 flex flex-wrap gap-x-6 gap-y-3 text-base text-[color:var(--ink-soft)]">
          {[
            ["/admin/employers", "Businesses"],
            ["/admin/users", "Users"],
            ["/admin/staff", "Administrators"],
            ["/admin/audit", "Audit"],
            ["/admin/homepage", "Homepage"],
            ["/admin/reports", "Reports"],
            ["/admin/account", "Account"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="hover:text-[color:var(--stamp)]"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="grid gap-12 lg:grid-cols-2">
          <section>
            <h2 className="font-sans text-[1.6rem] font-semibold text-[color:var(--ink)]">
              Pending business approvals
            </h2>
            <div className="mt-5">
              <AdminEmployersPanel employers={employers} />
            </div>
          </section>
          <section className="space-y-10">
            <div>
              <h2 className="font-sans text-[1.6rem] font-semibold text-[color:var(--ink)]">
                Find a user
              </h2>
              <p className="mt-2 text-base text-[color:var(--ink-soft)]">
                Search by name or email to view, suspend, or remove an account.
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
                  className="min-w-0 w-full flex-1 rounded-[var(--radius)] border border-[color:var(--line-strong)] bg-[color:var(--folder)] px-3.5 py-2.5 text-sm sm:min-w-[16rem]"
                />
                <button
                  type="submit"
                  className="btn-primary rounded-[var(--radius)] px-4 py-2.5 text-sm font-medium"
                >
                  Search
                </button>
              </form>
            </div>
            <div>
              <h2 className="font-sans text-[1.6rem] font-semibold text-[color:var(--ink)]">
                Your account
              </h2>
              <p className="mt-2 text-base text-[color:var(--ink-soft)]">
                Change your password, email, or display name on the account page.
              </p>
              <Link
                href="/admin/account"
                className="btn-primary mt-4 inline-block rounded-[var(--radius)] px-4 py-2.5 text-sm font-medium"
              >
                Manage password &amp; profile
              </Link>
            </div>
            <div>
              <h2 className="font-sans text-[1.6rem] font-semibold text-[color:var(--ink)]">
                Recent admin actions
              </h2>
              <ul className="mt-4 space-y-2 text-sm">
                {stats.recentActions.length === 0 ? (
                  <li className="text-[color:var(--ink-soft)]">None yet.</li>
                ) : (
                  stats.recentActions.map((log) => (
                    <li key={log.id} className="text-[color:var(--ink-soft)]">
                      <span className="font-mono text-xs text-[color:var(--stamp)]">
                        {log.action}
                      </span>
                      {" · "}
                      {log.adminName}
                    </li>
                  ))
                )}
              </ul>
              <Link
                href="/admin/audit"
                className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
              >
                Full audit log →
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
    <div className="bg-[color:var(--paper)] px-5 py-5">
      <p className="text-sm text-[color:var(--ink-soft)]">{label}</p>
      <p className="mt-1.5 text-[2rem] font-semibold text-[color:var(--stamp)]">
        {value}
      </p>
    </div>
  );
}
