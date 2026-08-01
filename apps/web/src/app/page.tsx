import { HomepageSections } from "@/components/homepage-sections";
import { SiteHeader } from "@/components/site-header";
import { filterHomepageBodySections, getDefaultHomepageSections } from "@horizon/shared";
import { getHomepageContent, getPublicCandidates } from "@/lib/api";

export default async function HomePage() {
  let sections = filterHomepageBodySections(getDefaultHomepageSections());
  let featuredCandidates: Awaited<
    ReturnType<typeof getPublicCandidates>
  >["candidates"] = [];

  const [contentResult, candidatesResult] = await Promise.allSettled([
    getHomepageContent(),
    getPublicCandidates({ limit: 3, offset: 0 }),
  ]);

  if (contentResult.status === "fulfilled" && contentResult.value.sections.length > 0) {
    sections = contentResult.value.sections;
  }
  if (candidatesResult.status === "fulfilled") {
    featuredCandidates = candidatesResult.value.candidates;
  }

  return (
    <div>
      <SiteHeader />
      <main>
        <HomepageSections
          sections={sections}
          featuredCandidates={featuredCandidates}
        />
      </main>
    </div>
  );
}
