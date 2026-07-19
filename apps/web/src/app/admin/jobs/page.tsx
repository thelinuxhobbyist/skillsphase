import { AdminJobsPanel } from "@/components/admin-jobs-panel";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, listAdminJobs } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function AdminJobsPage() {
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

  const jobs = await listAdminJobs(token);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/admin" className="text-sm text-brand underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
        Job moderation
      </h1>
      <div className="mt-8">
        <AdminJobsPanel jobs={jobs} />
      </div>
    </main>
  );
}
