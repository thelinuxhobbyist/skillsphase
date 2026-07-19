import { SafeUserButton } from "@/components/safe-user-button";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function AdminDashboardPage() {
  const { userId, getToken } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const token = await getToken();
  if (!token) {
    redirect("/onboarding");
  }

  let user;
  try {
    user = await getCurrentUser(token);
  } catch {
    redirect("/onboarding");
  }

  if (user.role !== "admin") {
    redirect(dashboardPathForRole(user.role));
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
            Administrator
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
            Admin dashboard
          </h1>
        </div>
        <SafeUserButton />
      </div>
      <p className="text-[color:var(--foreground)]/75">
        Employer approvals, moderation queues, and audit logs will be wired in a
        later phase.
      </p>
    </main>
  );
}
