import { MyApplicationsPanel } from "@/components/my-applications-panel";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, listMyApplications } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

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
  if (user.role !== "job_seeker") redirect(dashboardPathForRole(user.role));

  const applications = await listMyApplications(token);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl min-w-0 px-4 py-10 sm:px-6 sm:py-12">
        <Link href="/dashboard" className="text-sm text-brand underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-3xl text-brand sm:text-4xl">
          My applications
        </h1>
        <div className="mt-8">
          <MyApplicationsPanel applications={applications} />
        </div>
      </main>
    </>
  );
}
