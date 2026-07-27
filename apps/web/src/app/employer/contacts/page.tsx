import { SiteHeader } from "@/components/site-header";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, listContacts } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function EmployerContactsPage() {
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

  const contacts = await listContacts(token).catch(() => []);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl min-w-0 px-4 py-10 sm:px-6 sm:py-12">
        <Link href="/employer" className="text-sm text-primary underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 font-display text-3xl text-primary sm:text-4xl">
          Contacts
        </h1>
        <p className="mt-2 mb-8 text-[color:var(--foreground)]/75">
          Candidates you’ve contacted directly from discovery.
        </p>

        <ul className="space-y-3">
          {contacts.length === 0 ? (
            <li className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5 text-sm text-[color:var(--foreground)]/70">
              You haven’t contacted anyone yet.{" "}
              <Link href="/employer/discover" className="underline">
                Discover talent
              </Link>{" "}
              to get started.
            </li>
          ) : (
            contacts.map((contact) => (
              <li key={contact.id}>
                <Link
                  href={`/employer/contacts/${contact.id}`}
                  className="block rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5 transition hover:bg-white"
                >
                  <p className="font-semibold text-primary">
                    {[contact.candidate?.firstName, contact.candidate?.lastName]
                      .filter(Boolean)
                      .join(" ") || "A candidate"}
                  </p>
                  {contact.candidate?.professionalTitle ? (
                    <p className="text-sm text-[color:var(--foreground)]/70">
                      {contact.candidate.professionalTitle}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-[color:var(--foreground)]/55">
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
