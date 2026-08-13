import { PublicDiscoveryBrowser } from "@/components/public-discovery-browser";
import { SiteHeader } from "@/components/site-header";
import { getPublicCandidates } from "@/lib/api";

export default async function DiscoverTalentPage() {
  let candidates: Awaited<ReturnType<typeof getPublicCandidates>>["candidates"] = [];
  let total = 0;
  try {
    const result = await getPublicCandidates({ limit: 12, offset: 0 });
    candidates = result.candidates;
    total = result.total;
  } catch {
    // keep empty state
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-sm font-medium text-primary">
          Recruit by capability
        </p>
        <h1 className="mt-3 font-display text-4xl text-primary">
          Discover talent
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[color:var(--foreground)]/80">
          See what someone can do — not just where they&apos;ve worked.
          Browse profiles by capability, evidence, and skills across professions.
          Sign in or register as a business to contact a candidate directly.
        </p>

        <div className="mt-10">
          <PublicDiscoveryBrowser initialCandidates={candidates} initialTotal={total} />
        </div>
      </main>
    </>
  );
}
