import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SiteHeader } from "@/components/site-header";
import { EmployerJobForm } from "@/components/employer-job-form";
import { getCurrentUser } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function NewEmployerJobPage() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/login");
  const token = await getToken();
  if (!token) redirect("/onboarding");
  const user = await getCurrentUser(token).catch(() => null);
  if (!user) redirect("/onboarding");
  if (user.role !== "employer") redirect(dashboardPathForRole(user.role));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
        <h1 className="font-display text-3xl font-semibold text-[color:var(--ink)]">
          Post a job
        </h1>
        <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
          Candidates apply with a SkillsPhase profile — not a CV upload.
        </p>
        <div className="mt-8">
          <EmployerJobForm mode="create" />
        </div>
      </main>
    </>
  );
}
