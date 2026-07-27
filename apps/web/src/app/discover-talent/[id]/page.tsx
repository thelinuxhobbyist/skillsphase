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
      <main className="mx-auto w-full max-w-3xl min-w-0 px-4 py-10 sm:px-6 sm:py-12">
        <Link href="/discover-talent" className="text-sm text-primary underline">
          ← Back to Browse Talent
        </Link>

        <div className="mt-4">
          <CandidateProfileView
            candidate={candidate}
            name={name}
            fallbackTitle="Skill Profile"
            actions={
              <div className="flex flex-wrap gap-3 rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
                <p className="flex-1 min-w-[220px] text-sm text-[color:var(--foreground)]/75">
                  Want to contact {name || "this candidate"}? Sign in if
                  you&apos;re already a verified business, or register to get
                  started.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/login"
                    className="rounded-md border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-primary"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register?as=business"
                    className="btn-primary rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Register as a business
                  </Link>
                </div>
              </div>
            }
          />
        </div>
      </main>
    </>
  );
}
