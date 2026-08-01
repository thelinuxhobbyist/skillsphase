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
            <>
              <p className="m-0 max-w-[420px] text-[14.5px] text-[color:var(--ink-soft)]">
                <strong className="text-[color:var(--ink)]">
                  Want to contact {name || "this candidate"}?
                </strong>{" "}
                Sign in if you&apos;re already a verified business, or register
                to get started.
              </p>
              <div className="flex shrink-0 flex-wrap gap-2.5">
                <Link
                  href="/login"
                  className="inline-block rounded-sm border border-primary bg-transparent px-5 py-2.5 text-sm font-semibold text-primary"
                >
                  Sign in
                </Link>
                <Link
                  href="/register?as=business"
                  className="inline-block rounded-sm border border-primary bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Register as a business
                </Link>
              </div>
            </>
          }
        />
      </main>
    </>
  );
}
