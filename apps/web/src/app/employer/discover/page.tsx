import { DiscoveryFeed } from "@/components/discovery-feed";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ApiRequestError,
  getCurrentUser,
  getDiscoveryFeed,
  getMyCompany,
} from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function DiscoverPage() {
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

  if (company.verificationStatus !== "approved" || !company.businessEmailVerified) {
    const awaitingActivation =
      company.verificationStatus === "approved" && !company.businessEmailVerified;

    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="font-display text-3xl text-primary">
            {awaitingActivation ? "Activate your account" : "Discovery locked"}
          </h1>
          <p className="mt-4 text-[color:var(--foreground)]/75">
            {awaitingActivation
              ? `Check ${company.businessEmail} for your activation link. Once you click it, you can browse candidates.`
              : "Your registration must be reviewed and activated before you can browse candidates."}
          </p>
          <Link
            href="/employer/company"
            className="btn-primary mt-8 inline-block rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white"
          >
            View company status
          </Link>
        </main>
      </>
    );
  }

  const cards = await getDiscoveryFeed(token).catch(() => []);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl min-w-0 px-4 py-10 sm:px-6 sm:py-12">
        <Link href="/employer" className="text-sm text-primary underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 mb-2 font-display text-3xl text-primary sm:text-4xl">
          Discover talent
        </h1>
        <p className="mb-8 text-[color:var(--foreground)]/75">
          Fast skills-based discovery — skim skill cards and open full
          profiles for people worth talking to.
        </p>
        <DiscoveryFeed initialCards={cards} />
      </main>
    </>
  );
}
