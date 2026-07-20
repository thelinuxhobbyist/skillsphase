import { AdminJobsPanel } from "@/components/admin-jobs-panel";
import { AdminHeader } from "@/components/admin-header";
import Link from "next/link";
import { listAdminJobs } from "@/lib/api";
import { requireAdminPage } from "@/lib/require-admin";

export default async function AdminJobsPage() {
  const { token } = await requireAdminPage();
  const jobs = await listAdminJobs(token);

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/admin" className="text-sm text-brand underline">
          ← Back to dashboard
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-[family-name:var(--font-fraunces)] text-4xl text-brand">
            Job moderation
          </h1>
          <Link
            href="/admin/jobs/new"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            Create job
          </Link>
        </div>
        <div className="mt-8">
          <AdminJobsPanel jobs={jobs} />
        </div>
      </main>
    </>
  );
}
