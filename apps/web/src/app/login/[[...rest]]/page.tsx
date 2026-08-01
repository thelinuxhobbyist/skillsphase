import { AuthSignIn } from "@/components/auth-sign-in";
import { SiteHeader } from "@/components/site-header";
import { isClerkConfigured } from "@/lib/clerk-config";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const configured = isClerkConfigured();

  if (configured) {
    try {
      const { userId } = await auth();
      if (userId) {
        redirect("/onboarding");
      }
    } catch {
      // Secret key missing/misconfigured on the Worker — still show SignIn.
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 py-16">
        <h1 className="mb-6 font-display text-3xl text-primary">
          Sign in
        </h1>
        {configured ? (
          <AuthSignIn />
        ) : (
          <p className="text-center text-[color:var(--foreground)]/75">
            Add <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> to enable Clerk
            sign-in.
          </p>
        )}
        <p className="mt-8 text-sm text-[color:var(--foreground)]/65">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary underline">
            Register
          </Link>
        </p>
      </main>
    </>
  );
}
