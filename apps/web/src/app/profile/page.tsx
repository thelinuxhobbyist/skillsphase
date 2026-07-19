import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api";

export default async function ProfilePage() {
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

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/dashboard" className="text-sm text-brand underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
        My profile
      </h1>
      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="font-semibold text-brand">Name</dt>
          <dd>
            {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-brand">Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt className="font-semibold text-brand">Location</dt>
          <dd>
            {[user.city, user.country].filter(Boolean).join(", ") || "—"}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-brand">Career summary</dt>
          <dd className="whitespace-pre-wrap">
            {user.careerSummary || "Not added yet"}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-brand">Profile complete</dt>
          <dd>{user.profileCompleted ? "Yes" : "No — add skills and a CV to apply"}</dd>
        </div>
      </dl>
      <p className="mt-8 text-sm text-[color:var(--foreground)]/65">
        Editable profile forms (history, qualifications, CV upload) arrive in
        Phase 3.
      </p>
    </main>
  );
}
