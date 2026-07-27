import { BusinessEmailVerificationPanel } from "@/components/business-email-verification-panel";
import { CompanyEditForm } from "@/components/company-edit-form";
import { CompanyStatusPanel } from "@/components/company-status-panel";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiRequestError, getCurrentUser, getMyCompany } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function EmployerCompanyPage() {
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
  if (user.role !== "employer") redirect(dashboardPathForRole(user.role));

  let company;
  try {
    company = await getMyCompany(token);
  } catch (error) {
    if (error instanceof ApiRequestError && error.code === "COMPANY_NOT_FOUND") {
      redirect("/employer");
    }
    throw error;
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/employer" className="text-sm text-primary underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 font-sans text-4xl text-primary">
          Company profile
        </h1>
        <div className="mt-8 space-y-6">
          <CompanyStatusPanel company={company} />
          <BusinessEmailVerificationPanel company={company} />
          <CompanyEditForm company={company} />
        </div>
      </main>
    </>
  );
}
