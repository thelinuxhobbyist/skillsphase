import { SafeUserButton } from "@/components/safe-user-button";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function EmployerDashboardPage() {
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

  if (user.role !== "employer") {
    redirect(dashboardPathForRole(user.role));
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
            Employer
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
            Company dashboard
          </h1>
        </div>
        <SafeUserButton />
      </div>

      <div className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
        <h2 className="font-semibold text-brand">Verification required</h2>
        <p className="mt-2 text-[color:var(--foreground)]/75">
          Company registration and Companies House verification arrive in the
          next phase. You can sign in and manage your Horizon account now.
        </p>
        <p className="mt-4 text-sm text-[color:var(--foreground)]/65">
          Signed in as {user.email}
        </p>
      </div>
    </main>
  );
}
