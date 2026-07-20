import { AdminHomepagePanel } from "@/components/admin-homepage-panel";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiRequestError, getCurrentUser, listAdminHomepageSections } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function AdminHomepagePage() {
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

  let sections: Awaited<
    ReturnType<typeof listAdminHomepageSections>
  >["sections"] = [];
  let databaseConfigured = true;
  let errorMessage: string | null = null;

  try {
    const result = await listAdminHomepageSections(token);
    sections = result.sections;
  } catch (error) {
    if (error instanceof ApiRequestError && error.code === "DATABASE_NOT_CONFIGURED") {
      databaseConfigured = false;
    } else {
      errorMessage =
        error instanceof Error ? error.message : "Unable to load homepage sections.";
      databaseConfigured = false;
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/admin" className="text-sm text-brand underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
          Homepage template
        </h1>
        <p className="mt-2 text-[color:var(--foreground)]/75">
          Show, hide, reorder, edit, add, or delete homepage sections. Changes go
          live on the public site once saved (requires Neon).
        </p>
        <div className="mt-8">
          <AdminHomepagePanel
            initialSections={sections}
            databaseConfigured={databaseConfigured}
            errorMessage={errorMessage}
          />
        </div>
      </main>
    </>
  );
}
