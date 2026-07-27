import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-4xl text-primary">
          Contact
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[color:var(--foreground)]/80">
          We&apos;d love to hear from candidates and businesses. A contact form
          and support email will be added before launch.
        </p>
        <p className="mt-6 text-[color:var(--foreground)]/75">
          For now, use the FAQ on the homepage or register an account when Clerk
          is configured and reach us through your dashboard.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/#faq" className="text-primary underline">
            FAQ
          </Link>
          <Link href="/register" className="text-primary underline">
            Register
          </Link>
        </div>
      </main>
    </>
  );
}
