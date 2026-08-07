import { SiteHeader } from "@/components/site-header";
import { CandidateProfileView } from "@/components/candidate-profile-view";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiRequestError, getPublicCandidateDetail } from "@/lib/api";

export default async function PublicCandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let candidate;
  try {
    candidate = await getPublicCandidateDetail(id);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const name = [candidate.firstName, candidate.lastName].filter(Boolean).join(" ");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[820px] min-w-0 px-4 py-9 sm:px-8 sm:py-14">
        <Link
          href="/discover-talent"
          className="mb-7 inline-block text-[13px] text-[color:var(--ink-soft)] no-underline hover:text-primary"
        >
          ← Back to Browse Talent
        </Link>

        <CandidateProfileView
          candidate={candidate}
          name={name}
          fallbackTitle="Skill Profile"
          actions={
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 w-full">
              <div>
                <h3 className="font-display text-xl font-semibold text-primary">
                  Interested in this candidate?
                </h3>
                <p className="mt-1 text-sm text-[color:var(--ink-soft)] max-w-lg">
                  Sign in or register as a verified employer to contact{" "}
                  {candidate.firstName || name || "this candidate"} or request additional information.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2.5">
                <Link
                  href="/login"
                  className="inline-block rounded-sm border border-primary bg-transparent px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register?as=business"
                  className="inline-block rounded-sm border border-primary bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Register as a business
                </Link>
              </div>
            </div>
          }
        />
      </main>
    </>
  );
}
