import { AdminAccountPanel } from "@/components/admin-account-panel";
import { AdminHeader } from "@/components/admin-header";
import Link from "next/link";
import { requireAdminPage } from "@/lib/require-admin";

export default async function AdminAccountPage() {
  await requireAdminPage();

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/admin" className="text-sm text-primary underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 font-sans text-4xl text-primary">
          Your admin account
        </h1>
        <p className="mt-2 text-[color:var(--foreground)]/75">
          Change your password, email, and profile details. Administrator
          accounts are managed separately from public Clerk sign-in.
        </p>
        <div className="mt-8">
          <AdminAccountPanel />
        </div>
      </main>
    </>
  );
}
