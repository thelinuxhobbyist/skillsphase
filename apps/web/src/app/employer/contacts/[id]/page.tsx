import { MessageThread } from "@/components/message-thread";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiRequestError, getCurrentUser, listContacts, listMessages } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

export default async function EmployerContactThreadPage({
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

  const [contacts, messages] = await Promise.all([
    listContacts(token).catch(() => []),
    listMessages(token, id).catch((err) => {
      if (err instanceof ApiRequestError && err.status === 404) return null;
      throw err;
    }),
  ]);

  if (messages === null) redirect("/employer/contacts");
  const contact = contacts.find((c) => c.id === id);
  const candidateName = [
    contact?.candidate?.firstName,
    contact?.candidate?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-3xl min-w-0 flex-col px-4 py-6 sm:px-6">
        <Link href="/employer/contacts" className="text-sm text-primary underline">
          ← Back to contacts
        </Link>
        <h1 className="mt-2 mb-4 font-sans text-2xl text-primary">
          {candidateName || "Conversation"}
        </h1>
        <div className="min-h-0 flex-1 rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
          <MessageThread
            contactId={id}
            currentUserId={user.id}
            initialMessages={messages}
          />
        </div>
      </main>
    </>
  );
}
