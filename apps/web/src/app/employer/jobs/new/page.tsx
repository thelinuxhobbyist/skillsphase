import { JobCreateForm } from "@/components/job-create-form";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getMyCompany } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function NewJobPage() {
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

  const company = await getMyCompany(token).catch(() => null);
  if (!company) redirect("/employer");
  if (company.verificationStatus !== "approved") redirect("/employer");

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/employer/jobs" className="text-sm text-brand underline">
        ← Back to jobs
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
        Create a job
      </h1>
      <p className="mt-2 mb-8 text-[color:var(--foreground)]/75">
        Start with the skills this role needs (at least three). Project Horizon
        is skills-first — lead with abilities, not long employment must-haves.
      </p>
      <JobCreateForm />
    </main>
  );
}
