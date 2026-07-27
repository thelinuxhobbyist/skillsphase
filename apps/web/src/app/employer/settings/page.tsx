import { AccountSettingsPanel } from "@/components/account-settings-panel";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function EmployerSettingsPage() {
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

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-sans text-4xl text-primary">
          Business settings
        </h1>
        <p className="mt-2 text-[color:var(--foreground)]/75">
          Export company-linked account data or delete your business account.
        </p>
        <div className="mt-8">
          <AccountSettingsPanel role="employer" />
        </div>
      </main>
    </>
  );
}
