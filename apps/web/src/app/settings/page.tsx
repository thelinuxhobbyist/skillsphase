import { SafeUserButton } from "@/components/safe-user-button";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/dashboard" className="text-sm text-brand underline">
        ← Back to dashboard
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-fraunces)] text-4xl text-brand">
          Account settings
        </h1>
        <SafeUserButton />
      </div>
      <p className="mt-4 text-[color:var(--foreground)]/75">
        Password management is handled by Clerk. Data export and account
        deletion controls will be surfaced here next.
      </p>
    </main>
  );
}
