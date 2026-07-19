import { SiteHeader } from "@/components/site-header";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, listAdminAudit } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function AdminAuditPage() {
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

  const logs = await listAdminAudit(token);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/admin" className="text-sm text-brand underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
          Audit log
        </h1>
        <p className="mt-2 text-[color:var(--foreground)]/75">
          Read-only record of administrative actions.
        </p>
        <ul className="mt-8 space-y-3">
          {logs.length === 0 ? (
            <li className="text-[color:var(--foreground)]/70">No audit entries yet.</li>
          ) : (
            logs.map((log) => (
              <li
                key={log.id}
                className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4 text-sm"
              >
                <p className="font-semibold text-brand">{log.action}</p>
                <p className="mt-1 text-[color:var(--foreground)]/70">
                  {log.adminName} · {log.entity} {log.entityId}
                </p>
                <p className="mt-1 text-xs text-[color:var(--foreground)]/55">
                  {new Date(log.createdAt).toLocaleString("en-GB")}
                  {log.notes ? ` · ${log.notes}` : ""}
                </p>
              </li>
            ))
          )}
        </ul>
      </main>
    </>
  );
}
