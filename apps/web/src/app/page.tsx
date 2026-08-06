import { HomepageSections } from "@/components/homepage-sections";
import { SiteHeader } from "@/components/site-header";
import { filterHomepageBodySections, getDefaultHomepageSections } from "@horizon/shared";
import { getHomepageContent } from "@/lib/api";

export default async function HomePage() {
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
