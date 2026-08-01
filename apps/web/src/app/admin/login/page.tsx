import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getAdminMe } from "@/lib/api";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session";

/**
 * Custom administrator sign-in — no Clerk, no public registration.
 */
export default async function AdminLoginPage() {
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (token) {
    try {
      const user = await getAdminMe(token);
      if (user.role === "admin" && !user.suspendedAt) {
        redirect("/admin");
      }
    } catch {
      /* show login form */
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 py-16">
      <p className="mb-2 text-sm font-medium text-primary">
        SkillsPhase
      </p>
      <h1 className="mb-2 font-display text-3xl text-primary">
        Administrator sign-in
      </h1>
      <p className="mb-8 text-center text-sm text-[color:var(--foreground)]/70">
        Access is restricted to existing administrator accounts. Public
        registration is not available here.
      </p>
      <AdminLoginForm />
    </main>
  );
}
