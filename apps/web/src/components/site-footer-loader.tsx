import { getDefaultFooterSection } from "@horizon/shared";
import { getFooterContent } from "@/lib/api";
import { SiteFooter } from "@/components/site-footer";

export async function SiteFooterLoader() {
  let enabled = getDefaultFooterSection().enabled;
  let content = getDefaultFooterSection().content;

  try {
    const footer = await getFooterContent();
    enabled = footer.enabled;
    content = footer.content;
  } catch {
    // keep defaults
  }

  if (!enabled) {
    return null;
  }

  return <SiteFooter content={content} />;
}
