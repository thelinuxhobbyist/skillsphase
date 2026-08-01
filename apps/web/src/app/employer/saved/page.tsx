import { SiteHeader } from "@/components/site-header";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AVAILABILITY_LABELS } from "@horizon/shared";
import { getCurrentUser, listSavedCandidates } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function SavedCandidatesPage() {
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

  const saved = await listSavedCandidates(token).catch(() => []);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl min-w-0 px-4 py-10 sm:px-6 sm:py-12">
        <Link href="/employer" className="text-sm text-primary underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 font-display text-3xl text-primary sm:text-4xl">
          Saved candidates
        </h1>
        <p className="mt-2 mb-8 text-[color:var(--foreground)]/75">
          Candidates you’ve saved from discovery for later review.
        </p>

        <ul className="grid gap-4 sm:grid-cols-2">
          {saved.length === 0 ? (
            <li className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5 text-sm text-[color:var(--foreground)]/70">
              No saved candidates yet.{" "}
              <Link href="/employer/discover" className="underline">
                Discover talent
              </Link>{" "}
              to start saving profiles.
            </li>
          ) : (
            saved.map((entry) => (
              <li key={entry.candidate.id}>
                <Link
                  href={`/employer/discover/${entry.candidate.id}`}
                  className="block h-full rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5 transition hover:bg-white"
                >
                  <p className="font-semibold text-primary">
                    {entry.candidate.professionalTitle ||
                      [entry.candidate.firstName, entry.candidate.lastName]
                        .filter(Boolean)
                        .join(" ") ||
                      "Candidate"}
                  </p>
                  {entry.candidate.city ? (
                    <p className="text-sm text-[color:var(--foreground)]/70">
                      {entry.candidate.city}
                    </p>
                  ) : null}
                  {entry.candidate.skills.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                      {entry.candidate.skills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md border border-[color:var(--line)] bg-white px-2 py-1 text-primary"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {entry.candidate.availability ? (
                    <p className="mt-2 text-xs font-medium text-primary-accent">
                      {AVAILABILITY_LABELS[entry.candidate.availability]}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))
          )}
        </ul>
      </main>
    </>
  );
}
