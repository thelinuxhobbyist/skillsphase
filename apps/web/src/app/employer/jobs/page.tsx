import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SiteHeader } from "@/components/site-header";
import { JOB_STATUS_LABELS } from "@horizon/shared";
import {
  ApiRequestError,
  getCurrentUser,
  getMyCompany,
  listEmployerJobs,
} from "@/lib/api";
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

  let company = null;
  try {
    company = await getMyCompany(token);
  } catch (error) {
    if (!(error instanceof ApiRequestError && error.code === "COMPANY_NOT_FOUND")) {
      throw error;
    }
  }

  const canManage =
    company?.verificationStatus === "approved" && company.businessEmailVerified;

  const jobs = canManage
    ? (await listEmployerJobs(token).catch(() => ({ jobs: [] }))).jobs
    : [];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Business</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-[color:var(--ink)]">
              Your jobs
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[color:var(--ink-soft)]">
              Post roles and review SkillsPhase profile applications. Request
              CVs or certificates only after you want to move forward.
            </p>
          </div>
          {canManage ? (
            <Link
              href="/employer/jobs/new"
              className="btn-primary rounded-md px-4 py-2.5 text-sm font-semibold"
            >
              Post a job
            </Link>
          ) : null}
        </div>

        {!canManage ? (
          <p className="mt-10 text-sm text-[color:var(--ink-soft)]">
            Job posting unlocks after Companies House approval and company email
            activation.
          </p>
        ) : jobs.length === 0 ? (
          <p className="mt-10 text-sm text-[color:var(--ink-soft)]">
            No jobs yet. Post your first role to start receiving profile-based
            applications.
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-[color:var(--line)] border-t border-[color:var(--line)]">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="flex flex-wrap items-start justify-between gap-4 py-5"
              >
                <div>
                  <p className="font-display text-lg font-semibold text-[color:var(--ink)]">
                    {job.title}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
                    {JOB_STATUS_LABELS[job.status]} · {job.location} ·{" "}
                    {job.applicationCount} application
                    {job.applicationCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm font-semibold">
                  <Link
                    href={`/employer/jobs/${job.id}/applications`}
                    className="text-primary underline"
                  >
                    Applications
                  </Link>
                  <Link
                    href={`/employer/jobs/${job.id}/edit`}
                    className="text-primary underline"
                  >
                    Edit
                  </Link>
                  {job.status === "published" ? (
                    <Link href={`/jobs/${job.slug}`} className="text-primary underline">
                      Public page
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
