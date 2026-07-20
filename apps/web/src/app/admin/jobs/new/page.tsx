import { AdminJobCreateForm } from "@/components/admin-job-create-form";
import { AdminHeader } from "@/components/admin-header";
import Link from "next/link";
import { listAdminEmployers } from "@/lib/api";
import { requireAdminPage } from "@/lib/require-admin";

export default async function AdminNewJobPage() {
  const { token } = await requireAdminPage();
  const companies = await listAdminEmployers(token, "approved");

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/admin/jobs" className="text-sm text-brand underline">
          ← Back to jobs
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
          Create job for company
        </h1>
        <p className="mt-2 text-[color:var(--foreground)]/75">
          Select an approved employer, then publish a vacancy on their behalf.
        </p>
        <div className="mt-8">
          <AdminJobCreateForm companies={companies} />
        </div>
      </main>
    </>
  );
}
