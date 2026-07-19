import { SafeUserButton } from "@/components/safe-user-button";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function JobSeekerDashboardPage() {
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

  if (user.role !== "job_seeker") {
    redirect(dashboardPathForRole(user.role));
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
            Job seeker
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
            Welcome{user.firstName ? `, ${user.firstName}` : ""}
          </h1>
        </div>
        <SafeUserButton />
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          title="Profile"
          body={
            user.profileCompleted
              ? "Your profile is ready for applications."
              : "Complete your profile to apply for jobs."
          }
          href="/profile"
        />
        <DashboardCard
          title="Applications"
          body="Track the status of roles you have applied for."
          href="/applications"
        />
        <DashboardCard
          title="Browse jobs"
          body="Explore published vacancies from verified UK employers."
          href="/jobs"
        />
      </section>
    </main>
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
      <h2 className="font-semibold text-brand">{title}</h2>
      <p className="mt-2 text-sm text-[color:var(--foreground)]/75">{body}</p>
    </Link>
  );
}
