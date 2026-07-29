import { AdminHomepagePanel } from "@/components/admin-homepage-panel";
import { AdminHeader } from "@/components/admin-header";
import Link from "next/link";
import { ApiRequestError, listAdminHomepageSections } from "@/lib/api";
import { requireAdminPage } from "@/lib/require-admin";

export default async function AdminHomepagePage() {
  const { token } = await requireAdminPage();

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
      <AdminHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/admin" className="text-sm text-primary underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 font-sans text-4xl text-primary">
          Homepage template
        </h1>
        <p className="mt-2 text-[color:var(--foreground)]/75">
          Show, hide, reorder, edit, add, or delete homepage sections. Changes go
          live on the public site once saved (requires Neon). Optional marketing
          sections (FAQ, testimonials, statistics, trust bar, business CTA) are
          hidden by default for launch — enable them here when you have content
          ready. The footer section appears on every page.
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
