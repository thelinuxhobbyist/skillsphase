import { ComingSoonPage } from "@/components/coming-soon-page";
import { HomepageSections } from "@/components/homepage-sections";
import { SiteHeader } from "@/components/site-header";
import { comingSoonMetadata, isComingSoon } from "@/lib/coming-soon";
import { filterHomepageBodySections, getDefaultHomepageSections } from "@horizon/shared";
import { getHomepageContent } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = isComingSoon()
  ? comingSoonMetadata
  : {
      title: "SkillsPhase — Skills first. Because life happens.",
      description:
        "Work changes. Life changes. Your skills don't disappear. Build a SkillsPhase profile around what you can do, the evidence behind it, and the impact you've made — then use it to apply for jobs.",
    };

export default async function HomePage() {
  if (isComingSoon()) {
    return <ComingSoonPage />;
  }

  let sections = filterHomepageBodySections(getDefaultHomepageSections());

  try {
    const content = await getHomepageContent();
    if (content.sections.length > 0) {
      sections = content.sections;
    }
  } catch {
    // Keep built-in defaults when the content API is unavailable.
  }

  return (
    <div>
      <SiteHeader />
      <main>
        <HomepageSections sections={sections} />
      </main>
    </div>
  );
}
