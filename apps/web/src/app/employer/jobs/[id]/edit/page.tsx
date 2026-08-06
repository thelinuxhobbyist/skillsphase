import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SiteHeader } from "@/components/site-header";
import { EmployerJobForm } from "@/components/employer-job-form";
import { ApiRequestError, getCurrentUser, getEmployerJob } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function EditEmployerJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jobId = Number(id);
  if (!Number.isFinite(jobId)) notFound();

  const { userId, getToken } = await auth();
  if (!userId) redirect("/login");
  const token = await getToken();
  if (!token) redirect("/onboarding");
  const user = await getCurrentUser(token).catch(() => null);
  if (!user) redirect("/onboarding");
  if (user.role !== "employer") redirect(dashboardPathForRole(user.role));

  let job;
  try {
    job = await getEmployerJob(token, jobId);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
        <h1 className="font-display text-3xl font-semibold text-[color:var(--ink)]">
          Edit job
        </h1>
        <div className="mt-8">
          <EmployerJobForm mode="edit" jobId={jobId} initial={job} />
        </div>
      </main>
    </>
  );
}
