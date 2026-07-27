import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-sans text-4xl text-primary">
          Terms &amp; Conditions
        </h1>
        <p className="mt-4 text-[color:var(--foreground)]/75">
          Placeholder terms page. Final terms for candidates and businesses
          will be published before public launch, covering account use,
          candidate discovery and contact rules, and acceptable use of the
          SkillsPhase skills-first hiring platform.
        </p>
        <Link href="/contact" className="mt-8 inline-block text-sm font-semibold text-primary underline">
          Contact us
        </Link>
      </main>
    </>
  );
}
