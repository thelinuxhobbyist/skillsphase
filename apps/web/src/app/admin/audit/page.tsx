import { AdminHeader } from "@/components/admin-header";
import Link from "next/link";
import { listAdminAudit } from "@/lib/api";
import { requireAdminPage } from "@/lib/require-admin";

export default async function AdminAuditPage() {
  const { token } = await requireAdminPage();
  const logs = await listAdminAudit(token);

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/admin" className="text-sm text-primary underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 font-display text-4xl text-primary">
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
                <p className="font-semibold text-primary">{log.action}</p>
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
