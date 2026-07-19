import { AdminJobCreateForm } from "@/components/admin-job-create-form";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, listAdminEmployers } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function AdminNewJobPage() {
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

  const companies = await listAdminEmployers(token, "approved");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/admin/jobs" className="text-sm text-brand underline">
          ← Back to jobs
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
          Create job for company
        </h1>
        <p className="mt-2 text-[color:var(--foreground)]/75">
          Select an approved employer, then publish a vacancy on their behalf.
        </p>
        <div className="mt-8">
          <AdminJobCreateForm companies={companies} />
        </div>
      </main>
    </>
  );
}
