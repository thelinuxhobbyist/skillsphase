import { AdminUsersPanel } from "@/components/admin-users-panel";
import { AdminHeader } from "@/components/admin-header";
import Link from "next/link";
import { listAdminUsers } from "@/lib/api";
import { requireAdminPage } from "@/lib/require-admin";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const role = typeof params.role === "string" ? params.role : "";
  const hasSearch = q.length >= 2;

  const { token } = await requireAdminPage();
  const users = hasSearch
    ? await listAdminUsers(token, {
        q,
        role: role || undefined,
      })
    : [];

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/admin" className="text-sm text-brand underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
          Users
        </h1>
        <p className="mt-2 text-[color:var(--foreground)]/75">
          Search for a job seeker or employer by name or email, then suspend,
          reactivate, or delete their account. Results are limited so the list
          stays manageable at scale.
        </p>
        <form className="mt-6 flex flex-wrap gap-3" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or email (min 2 characters)"
            className="min-w-[16rem] flex-1 rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
          />
          <select
            name="role"
            defaultValue={role}
            className="rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
          >
            <option value="">All public roles</option>
            <option value="job_seeker">Job seeker</option>
            <option value="employer">Employer</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            Search
          </button>
        </form>
        <div className="mt-8">
          {!hasSearch ? (
            <p className="text-[color:var(--foreground)]/70">
              Enter a name or email to find an account. Users are not listed
              automatically.
            </p>
          ) : users.length === 0 ? (
            <p className="text-[color:var(--foreground)]/70">
              No matching users found.
            </p>
          ) : (
            <AdminUsersPanel users={users} />
          )}
        </div>
      </main>
    </>
  );
}
