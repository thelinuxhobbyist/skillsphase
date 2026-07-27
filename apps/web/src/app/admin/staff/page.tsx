import { AdminStaffPanel } from "@/components/admin-staff-panel";
import { AdminHeader } from "@/components/admin-header";
import Link from "next/link";
import { adminHasPermission } from "@horizon/shared";
import { listAdminStaff } from "@/lib/api";
import { requireAdminPage } from "@/lib/require-admin";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminStaffPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const { user, token } = await requireAdminPage();
  const staff = await listAdminStaff(token, q || undefined);
  const canManage = adminHasPermission(
    {
      isRootAdmin: user.isRootAdmin,
      adminRole: user.adminRole,
      adminPermissions: user.adminPermissions,
    },
    "manage_admins",
  );

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/admin" className="text-sm text-primary underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 font-sans text-4xl text-primary">
          Administrators
        </h1>
        <p className="mt-2 text-[color:var(--foreground)]/75">
          Administrator accounts are created only by a Root Administrator. Public
          sign-up cannot grant admin access.
        </p>
        <form className="mt-6 flex flex-wrap gap-3" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or email"
            className="rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            Search
          </button>
        </form>
        <div className="mt-8">
          <AdminStaffPanel
            staff={staff}
            currentUserId={user.id}
            canManage={canManage}
          />
        </div>
      </main>
    </>
  );
}
