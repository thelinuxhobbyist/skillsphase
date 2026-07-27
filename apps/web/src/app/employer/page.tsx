import { CompanyRegistrationForm } from "@/components/company-registration-form";
import { CompanyStatusPanel } from "@/components/company-status-panel";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ApiRequestError,
  getCurrentUser,
  getMyCompany,
  listContacts,
  listSavedCandidates,
} from "@/lib/api";
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

  const canDiscover =
    company?.verificationStatus === "approved" && company.businessEmailVerified;
  const [savedCandidates, contacts] = canDiscover
    ? await Promise.all([
        listSavedCandidates(token).catch(() => []),
        listContacts(token).catch(() => []),
      ])
    : [[], []];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl min-w-0 px-4 py-10 sm:px-6 sm:py-12">
        <p className="text-sm font-medium text-primary">
          Business
        </p>
        <h1 className="mt-2 font-sans text-3xl break-words text-primary sm:text-4xl">
          Discover talent
        </h1>

        {company ? (
          <div className="mt-8 space-y-6">
            <CompanyStatusPanel company={company} />

            {canDiscover ? (
              <>
                <section className="grid gap-4 md:grid-cols-3">
                  <DashboardCard
                    title="Discover talent"
                    body="Browse fast skill-based cards and open full profiles for people who match what you need."
                    href="/employer/discover"
                  />
                  <DashboardCard
                    title="Saved candidates"
                    body={`${savedCandidates.length} candidate${savedCandidates.length === 1 ? "" : "s"} saved to your lists.`}
                    href="/employer/saved"
                  />
                  <DashboardCard
                    title="Contacts"
                    body={`${contacts.length} conversation${contacts.length === 1 ? "" : "s"} with candidates.`}
                    href="/employer/contacts"
                  />
                </section>
              </>
            ) : (
              <p className="text-sm text-[color:var(--foreground)]/70">
                {company.verificationStatus === "approved"
                  ? "Check your company email and click the activation link to unlock discovery."
                  : "Discovery unlocks after admin review and account activation via your company email."}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm font-semibold">
              <Link href="/employer/company" className="text-primary underline">
                Manage company profile
              </Link>
            </div>
          </div>
        ) : (
          <section className="mt-8 rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-6">
            <h2 className="font-sans text-2xl text-primary">
              Register your UK company
            </h2>
            <p className="mt-2 mb-6 text-[color:var(--foreground)]/75">
              First we identify the company via Companies House, then collect
              your company email and contact details. After you submit, a
              SkillsPhase admin reviews your registration. If accepted, an
              activation link is sent to your company email — click it to
              activate your account.
            </p>
            <CompanyRegistrationForm />
          </section>
        )}
      </main>
    </>
  );
}

function DashboardCard({
  title,
  body,
  href,
}: {
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5 backdrop-blur transition hover:bg-white"
    >
      <h2 className="font-semibold text-primary">{title}</h2>
      <p className="mt-2 text-sm text-[color:var(--foreground)]/75">{body}</p>
    </Link>
  );
}
