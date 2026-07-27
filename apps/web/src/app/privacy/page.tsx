import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-4xl text-primary">
          Privacy Policy
        </h1>
        <p className="mt-4 text-[color:var(--foreground)]/75">
          Placeholder policy page. Full UK GDPR wording will be published before
          public launch. In the meantime: we only collect what you provide for
          your account, Skill Profile, and business verification; you can
          export or delete your data from account settings once signed in.
        </p>
        <Link href="/#faq" className="mt-8 inline-block text-sm font-semibold text-primary underline">
          See FAQ
        </Link>
      </main>
    </>
  );
}
