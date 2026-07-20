import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-[family-name:var(--font-fraunces)] text-4xl text-brand">
          Terms &amp; Conditions
        </h1>
        <p className="mt-4 text-[color:var(--foreground)]/75">
          Placeholder terms page. Final terms for returners and employers will be
          published before public launch, covering account use, job posting
          rules, and acceptable use of the Career Return Platform.
        </p>
        <Link href="/contact" className="mt-8 inline-block text-sm font-semibold text-brand underline">
          Contact us
        </Link>
      </main>
    </>
  );
}
