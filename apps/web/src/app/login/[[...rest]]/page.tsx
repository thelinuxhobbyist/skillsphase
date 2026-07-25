import { isClerkConfigured } from "@/lib/clerk-config";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  const configured = isClerkConfigured();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 py-16">
      <h1 className="mb-6 font-[family-name:var(--font-fraunces)] text-3xl text-brand">
        Sign in
      </h1>
      {configured ? (
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/register"
          forceRedirectUrl="/onboarding"
          fallbackRedirectUrl="/onboarding"
        />
      ) : (
        <p className="text-center text-[color:var(--foreground)]/75">
          Add <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> to enable Clerk
          sign-in.
        </p>
      )}
    </main>
  );
}
