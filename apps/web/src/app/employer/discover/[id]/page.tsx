import { CandidateDetailActions } from "@/components/candidate-detail-actions";
import { CandidateProfileView } from "@/components/candidate-profile-view";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ApiRequestError,
  getCandidateDetail,
  getCurrentUser,
  listSavedCandidates,
} from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  let candidate;
  try {
    candidate = await getCandidateDetail(token, id);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      redirect("/employer/discover");
    }
    throw error;
  }

  const saved = await listSavedCandidates(token).catch(() => []);
  const isSaved = saved.some((row) => row.candidate.id === id);

  const name = [candidate.firstName, candidate.lastName].filter(Boolean).join(" ");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl min-w-0 px-4 py-10 sm:px-6 sm:py-12">
        <Link href="/employer/discover" className="text-sm text-primary underline">
          ← Back to discovery
        </Link>

        <div className="mt-4">
          <CandidateProfileView
            candidate={candidate}
            name={name}
            fallbackTitle="Candidate"
            actions={
              <CandidateDetailActions candidateId={id} initiallySaved={isSaved} />
            }
          />
        </div>
      </main>
    </>
  );
}
