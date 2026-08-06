import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SiteHeader } from "@/components/site-header";
import { ApplicationStatusControls } from "@/components/application-status-controls";
import { APPLICATION_STATUS_LABELS } from "@horizon/shared";
import {
  ApiRequestError,
  getCurrentUser,
  getEmployerJob,
  listJobApplications,
} from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function EmployerJobApplicationsPage({
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

  const { applications, note } = await listJobApplications(token, jobId).catch(
    () => ({ applications: [], note: "" }),
  );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
        <Link href="/employer/jobs" className="text-sm text-primary underline">
          ← Jobs
        </Link>
        <h1 className="mt-4 font-display text-3xl font-semibold text-[color:var(--ink)]">
          Applications · {job.title}
        </h1>
        {note ? (
          <p className="mt-3 max-w-2xl text-sm text-[color:var(--ink-soft)]">
            {note}
          </p>
        ) : null}

        {applications.length === 0 ? (
          <p className="mt-10 text-sm text-[color:var(--ink-soft)]">
            No applications yet.
          </p>
        ) : (
          <ul className="mt-8 space-y-5">
            {applications.map((app) => {
              const name = [app.candidate.firstName, app.candidate.lastName]
                .filter(Boolean)
                .join(" ");
              const snapshot = app.profileSnapshot ?? {};
              const capability =
                (typeof snapshot.primaryCapability === "string" &&
                  snapshot.primaryCapability) ||
                app.candidate.primaryCapability ||
                app.candidate.professionalTitle ||
                "SkillsPhase profile";

              return (
                <li
                  key={app.id}
                  className="rounded-md border border-[color:var(--line)] bg-white p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-xl font-semibold text-[color:var(--ink)]">
                        {capability}
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
                        {name || "Candidate"}
                        {app.candidate.city ? ` · ${app.candidate.city}` : ""}
                      </p>
                      <p className="mt-2 text-sm font-medium text-primary">
                        {APPLICATION_STATUS_LABELS[app.status]}
                      </p>
                    </div>
                    <Link
                      href={`/employer/discover/${app.candidate.id}`}
                      className="text-sm font-semibold text-primary underline"
                    >
                      View live profile
                    </Link>
                  </div>

                  {Array.isArray(snapshot.skills) && snapshot.skills.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(snapshot.skills as string[]).slice(0, 8).map((skill) => (
                        <span
                          key={skill}
                          className="rounded border border-[color:var(--line)] px-2 py-1 text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {app.coverLetter ? (
                    <p className="mt-4 text-sm leading-relaxed text-[color:var(--ink-soft)]">
                      <span className="font-semibold text-[color:var(--ink)]">
                        Note:{" "}
                      </span>
                      {app.coverLetter}
                    </p>
                  ) : null}

                  <p className="mt-4 text-xs text-[color:var(--ink-soft)]">
                    Supporting documents (CV, certificates, references) —
                    available upon request after mutual interest.
                  </p>

                  <div className="mt-4">
                    <ApplicationStatusControls
                      applicationId={app.id}
                      status={app.status}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
