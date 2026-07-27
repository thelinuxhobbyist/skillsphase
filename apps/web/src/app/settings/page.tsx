import { AccountSettingsPanel } from "@/components/account-settings-panel";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function SettingsPage() {
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
    if (user.role === "employer") redirect("/employer/settings");
    redirect(dashboardPathForRole(user.role));
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-sans text-4xl text-primary">
          Account settings
        </h1>
        <p className="mt-2 text-[color:var(--foreground)]/75">
          Manage export and deletion of your SkillsPhase data.
        </p>
        <div className="mt-8">
          <AccountSettingsPanel role="job_seeker" />
        </div>
      </main>
    </>
  );
}
