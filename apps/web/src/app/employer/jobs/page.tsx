import { EmployerJobsPanel } from "@/components/employer-jobs-panel";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getMyCompany, listMyJobs } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function EmployerJobsPage() {
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
  if (user.role !== "employer") redirect(dashboardPathForRole(user.role));

  const company = await getMyCompany(token).catch(() => null);
  if (!company) redirect("/employer");
  if (company.verificationStatus !== "approved") redirect("/employer");

  const jobs = await listMyJobs(token);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/employer" className="text-sm text-brand underline">
            ← Dashboard
          </Link>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
            Your jobs
          </h1>
        </div>
        <Link
          href="/employer/jobs/new"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
        >
          Create job
        </Link>
      </div>
      <EmployerJobsPanel jobs={jobs} />
    </main>
  );
}
