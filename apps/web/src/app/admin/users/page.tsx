import { AdminUsersPanel } from "@/components/admin-users-panel";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, listAdminUsers } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const role = typeof params.role === "string" ? params.role : "";

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

  const users = await listAdminUsers(token, {
    q: q || undefined,
    role: role || undefined,
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/admin" className="text-sm text-brand underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
          Users
        </h1>
        <form className="mt-6 flex flex-wrap gap-3" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or email"
            className="rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
          />
          <select
            name="role"
            defaultValue={role}
            className="rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
          >
            <option value="">All roles</option>
            <option value="job_seeker">Job seeker</option>
            <option value="employer">Employer</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            Filter
          </button>
        </form>
        <div className="mt-8">
          <AdminUsersPanel users={users} />
        </div>
      </main>
    </>
  );
}
