import { SiteHeader } from "@/components/site-header";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, listContacts } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function CandidateContactsPage() {
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
  if (user.role !== "job_seeker") redirect(dashboardPathForRole(user.role));

  const contacts = await listContacts(token).catch(() => []);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl min-w-0 px-4 py-10 sm:px-6 sm:py-12">
        <Link href="/dashboard" className="text-sm text-primary underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 font-display text-3xl text-primary sm:text-4xl">
          Messages
        </h1>
        <p className="mt-2 mb-8 text-[color:var(--foreground)]/75">
          Businesses that have contacted you. There’s no automatic match — you
          decide whether and how to reply.
        </p>

        <ul className="space-y-3">
          {contacts.length === 0 ? (
            <li className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5 text-sm text-[color:var(--foreground)]/70">
              No businesses have contacted you yet. Improve your{" "}
              <Link href="/profile" className="underline">
                Skill Profile
              </Link>{" "}
              to increase your chances of discovery.
            </li>
          ) : (
            contacts.map((contact) => (
              <li key={contact.id}>
                <Link
                  href={`/contacts/${contact.id}`}
                  className="block rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5 transition hover:bg-white"
                >
                  <p className="font-semibold text-primary">
                    {contact.business?.companyName ?? "A business"}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--foreground)]/70">
                    Contacted{" "}
                    {new Date(contact.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </Link>
              </li>
            ))
          )}
        </ul>
      </main>
    </>
  );
}
