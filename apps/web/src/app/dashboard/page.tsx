import { SiteHeader } from "@/components/site-header";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AVAILABILITY_LABELS } from "@horizon/shared";
import { getCurrentUser, getProfileBundle, listContacts } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function CandidateDashboardPage() {
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

  const [profile, contacts] = await Promise.all([
    getProfileBundle(token).catch(() => null),
    listContacts(token).catch(() => []),
  ]);
  const recentContacts = contacts.slice(0, 5);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl min-w-0 px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">
            Candidate
          </p>
          <h1 className="mt-2 font-display text-3xl break-words text-primary sm:text-4xl">
            Welcome{user.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="mt-2 text-[color:var(--foreground)]/75">
            {user.primaryCapability ||
              user.professionalTitle ||
              "Add a capability statement so employers see what you can do."}
            {user.availability
              ? ` · ${AVAILABILITY_LABELS[user.availability]}`
              : ""}
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <DashboardCard
            title="Browse jobs"
            body="Search roles and apply with your SkillsPhase profile — not a CV upload."
            href="/jobs"
          />
          <DashboardCard
            title="Applications"
            body="Track where you've applied and how employers are progressing you."
            href="/applications"
          />
          <DashboardCard
            title="SkillsPhase profile"
            body={
              user.profileCompleted
                ? "Your profile is ready to use as your application."
                : "Complete your profile before applying for jobs."
            }
            href="/profile"
          />
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-2xl text-primary">
              Recent contacts
            </h2>
            <Link href="/contacts" className="text-sm text-primary underline">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {recentContacts.length === 0 ? (
              <li className="text-[color:var(--foreground)]/70">
                No businesses have contacted you yet.{" "}
                <Link href="/jobs" className="underline">
                  Browse jobs
                </Link>{" "}
                or{" "}
                <Link href="/profile" className="underline">
                  strengthen your profile
                </Link>
                .
              </li>
            ) : (
              recentContacts.map((contact) => (
                <li
                  key={contact.id}
                  className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4 text-sm"
                >
                  <Link
                    href={`/contacts/${contact.id}`}
                    className="font-semibold text-primary underline"
                  >
                    {contact.business?.companyName ?? "A business"}
                  </Link>
                  <p className="mt-1 text-[color:var(--foreground)]/70">
                    Contacted {new Date(contact.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>

        {!profile || !user.profileCompleted ? (
          <section className="mt-10 rounded-md border border-brand-accent/30 bg-brand-accent/5 p-5">
            <h2 className="font-semibold text-primary">Finish your SkillsPhase profile</h2>
            <p className="mt-2 text-sm text-[color:var(--foreground)]/75">
              Add what you can do, at least 3 skills, and evidence so you can
              apply for jobs with proof — documents stay available upon request.
            </p>
            <Link
              href="/profile"
              className="btn-primary mt-4 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
            >
              Continue your profile
            </Link>
          </section>
        ) : null}
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
