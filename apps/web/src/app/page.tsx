import { HomepageSections } from "@/components/homepage-sections";
import { SiteHeader } from "@/components/site-header";
import { getDefaultHomepageSections } from "@horizon/shared";
import { getHomepageContent, listPublishedJobs } from "@/lib/api";

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof listPublishedJobs>>["jobs"] = [];
  try {
    const result = await listPublishedJobs({ page: 1, pageSize: 3 });
    featured = result.jobs;
  } catch {
    featured = [];
  }

  let sections = getDefaultHomepageSections().filter((s) => s.enabled);
  try {
    const content = await getHomepageContent();
    if (content.sections.length > 0) {
      sections = content.sections;
    }
  } catch {
    // keep defaults
  }

  return (
    <div>
      <SiteHeader />
      <main>
        <HomepageSections sections={sections} featuredJobs={featured} />
      </main>
    </div>
  );
}
