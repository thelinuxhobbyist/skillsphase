import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SiteHeader } from "@/components/site-header";
import { APPLICATION_STATUS_LABELS } from "@horizon/shared";
import { getCurrentUser, listMyApplications } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";
import { WithdrawApplicationButton } from "@/components/withdraw-application-button";

export default async function ApplicationsPage() {
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
  if (user.role !== "job_seeker") {
    redirect(dashboardPathForRole(user.role));
  }

  const { applications } = await listMyApplications(token).catch(() => ({
    applications: [],
  }));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <p className="text-sm font-medium text-primary">Candidate</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[color:var(--ink)]">
          Your applications
        </h1>
        <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
          Each application uses your SkillsPhase profile. Employers may request
          a CV, certificates, or references later — only after mutual interest.
        </p>

        <div className="mt-6">
          <Link href="/jobs" className="text-sm font-semibold text-primary underline">
            Browse jobs
          </Link>
        </div>

        {applications.length === 0 ? (
          <p className="mt-10 text-sm text-[color:var(--ink-soft)]">
            You haven&apos;t applied to any roles yet.
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-[color:var(--line)] border-t border-[color:var(--line)]">
            {applications.map((app) => (
              <li key={app.id} className="flex flex-wrap items-start justify-between gap-4 py-5">
                <div>
                  <Link
                    href={`/jobs/${app.job.slug}`}
                    className="font-display text-lg font-semibold text-[color:var(--ink)] hover:underline"
                  >
                    {app.job.title}
                  </Link>
                  <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
                    {app.job.companyName} · {app.job.location}
                  </p>
                  <p className="mt-2 text-sm font-medium text-primary">
                    {APPLICATION_STATUS_LABELS[app.status]}
                  </p>
                </div>
                {app.status !== "withdrawn" &&
                app.status !== "hired" &&
                app.status !== "rejected" ? (
                  <WithdrawApplicationButton applicationId={app.id} />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
