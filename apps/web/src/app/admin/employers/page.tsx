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
      <main className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6">
        <Link
          href="/admin"
          className="font-mono text-sm text-[color:var(--stamp)] hover:underline"
        >
          ← Back to dashboard
        </Link>
        <p className="eyebrow mt-6">Admin</p>
        <h1 className="mt-3 font-display text-[clamp(2rem,4vw,2.75rem)] font-semibold text-[color:var(--ink)]">
          Business management
        </h1>
        <p className="mt-3 max-w-2xl text-base text-[color:var(--ink-soft)]">
          Review Companies House matches, approve verified businesses, and
          suspend accounts when needed.
        </p>
        <div className="mt-8">
          <AdminEmployersPanel employers={employers} />
        </div>
      </main>
    </>
  );
}
