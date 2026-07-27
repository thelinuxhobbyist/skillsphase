import { ProfileEditor } from "@/components/profile-editor";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getProfileBundle } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/roles";

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

  if (user.role !== "job_seeker") {
    redirect(dashboardPathForRole(user.role));
  }

  const profile = await getProfileBundle(token);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl min-w-0 px-4 py-10 sm:px-6 sm:py-12">
        <Link href="/dashboard" className="text-sm text-primary underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 font-sans text-3xl text-primary sm:text-4xl">
          Your Skill Profile
        </h1>
        <p className="mt-2 mb-8 text-[color:var(--foreground)]/75">
          Edit anytime — jump between steps, update entries, or remove mistakes.
          Changes save as you go. To delete your whole account, use Settings.
        </p>
        <ProfileEditor initial={profile} />
      </main>
    </>
  );
}
