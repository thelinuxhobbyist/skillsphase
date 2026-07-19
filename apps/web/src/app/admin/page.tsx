import { AdminEmployersPanel } from "@/components/admin-employers-panel";
import { SafeUserButton } from "@/components/safe-user-button";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminDashboard, getCurrentUser, listAdminEmployers } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function AdminDashboardPage() {
  const { userId, getToken } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const token = await getToken();
  if (!token) {
    redirect("/onboarding");
  }

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
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
            Administrator
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
            Admin dashboard
          </h1>
        </div>
        <SafeUserButton />
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <Stat label="Pending employers" value={stats.pendingEmployers} />
        <Stat label="Approved employers" value={stats.approvedEmployers} />
        <Stat label="Total employers" value={stats.totalEmployers} />
        <Stat label="Active jobs" value={stats.activeJobs} />
      </section>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
          Pending employer approvals
        </h2>
        <div className="flex gap-4 text-sm font-semibold">
          <Link href="/admin/employers" className="text-brand underline">
            All employers
          </Link>
          <Link href="/admin/jobs" className="text-brand underline">
            Moderate jobs
          </Link>
        </div>
      </div>
      <AdminEmployersPanel employers={employers} />
    </main>
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
