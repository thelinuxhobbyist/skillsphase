import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-[family-name:var(--font-fraunces)] text-4xl text-brand">
          About Project Horizon
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[color:var(--foreground)]/80">
          Project Horizon is a Career Return Platform built to connect verified UK
          employers with people returning to work after a career break — without
          the stigma of employment gaps.
        </p>
        <section className="mt-10 space-y-4 text-[color:var(--foreground)]/80">
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">
            What we value
          </h2>
          <p>
            <strong className="text-brand">Trust.</strong> Employers are checked
            against Companies House and approved before they can publish roles.
          </p>
          <p>
            <strong className="text-brand">Dignity.</strong> Profiles invite a
            career-gap narrative so returners can explain their path on their own
            terms.
          </p>
          <p>
            <strong className="text-brand">Simplicity.</strong> Apply once with a
            complete profile; track status clearly; export or delete your data when
            you choose.
          </p>
        </section>
        <Link
          href="/register"
          className="mt-10 inline-block rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white"
        >
          Get started
        </Link>
      </main>
    </>
  );
}
