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
          Skills First Hiring
        </p>
        <h1 className="mt-3 font-sans text-4xl text-primary">
          Browse Skill Profiles
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[color:var(--foreground)]/80">
          Browse Skill Profiles — names, skills, experience, and portfolio
          evidence, open to anyone. Sign in or register as a business to contact a
          candidate directly.
        </p>

        <div className="mt-10">
          <PublicDiscoveryBrowser initialCandidates={candidates} initialTotal={total} />
        </div>
      </main>
    </>
  );
}
