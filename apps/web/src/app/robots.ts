import { isComingSoon, SITE_URL } from "@/lib/coming-soon";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  if (isComingSoon()) {
    return {
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
      sitemap: `${SITE_URL}/sitemap.xml`,
      host: SITE_URL,
    };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
