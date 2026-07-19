import { JobEditForm } from "@/components/job-edit-form";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getJobById, getMyCompany } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

type Params = Promise<{ id: string }>;

export default async function EditJobPage({ params }: { params: Params }) {
  const { id } = await params;
  const jobId = Number(id);
  if (!Number.isFinite(jobId)) redirect("/employer/jobs");

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
  if (!company || company.verificationStatus !== "approved") {
    redirect("/employer");
  }

  let job;
  try {
    job = await getJobById(token, jobId);
  } catch {
    redirect("/employer/jobs");
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/employer/jobs" className="text-sm text-brand underline">
          ← Back to jobs
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
          Edit job
        </h1>
        <div className="mt-8">
          <JobEditForm job={job} />
        </div>
      </main>
    </>
  );
}
