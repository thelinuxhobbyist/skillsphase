import { AdminEmployersPanel } from "@/components/admin-employers-panel";
import { AdminHeader } from "@/components/admin-header";
import Link from "next/link";
import { listAdminEmployers } from "@/lib/api";
import { requireAdminPage } from "@/lib/require-admin";

export default async function AdminEmployersPage() {
  const { token } = await requireAdminPage();
  const employers = await listAdminEmployers(token);

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/admin" className="text-sm text-brand underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
          Employer management
        </h1>
        <div className="mt-8">
          <AdminEmployersPanel employers={employers} />
        </div>
      </main>
    </>
  );
}
