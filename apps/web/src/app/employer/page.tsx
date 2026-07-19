import { CompanyRegistrationForm } from "@/components/company-registration-form";
import { CompanyStatusPanel } from "@/components/company-status-panel";
import { SafeUserButton } from "@/components/safe-user-button";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiRequestError, getCurrentUser, getMyCompany } from "@/lib/api";
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

  let company = null;
  try {
    company = await getMyCompany(token);
  } catch (error) {
    if (!(error instanceof ApiRequestError && error.code === "COMPANY_NOT_FOUND")) {
      throw error;
    }
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

      {company ? (
        <div className="space-y-4">
          <CompanyStatusPanel company={company} />
          <Link href="/employer/company" className="text-sm font-semibold text-brand underline">
            Manage company profile
          </Link>
        </div>
      ) : (
        <section className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
            Register your UK company
          </h2>
          <p className="mt-2 mb-6 text-[color:var(--foreground)]/75">
            We validate your Companies House number, then an administrator
            reviews your registration before you can post jobs.
          </p>
          <CompanyRegistrationForm />
        </section>
      )}
    </main>
  );
}
