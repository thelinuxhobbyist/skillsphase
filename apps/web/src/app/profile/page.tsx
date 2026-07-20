import { ProfileEditor } from "@/components/profile-editor";
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
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/dashboard" className="text-sm text-brand underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
        Your profile
      </h1>
      <p className="mt-2 mb-8 text-[color:var(--foreground)]/75">
        Edit anytime — jump between steps, update entries, or remove mistakes.
        Changes save as you go. To delete your whole account, use Settings.
      </p>
      <ProfileEditor initial={profile} />
    </main>
  );
}
