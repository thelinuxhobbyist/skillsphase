import { isComingSoon } from "@/lib/coming-soon";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  if (isComingSoon()) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
  };
}
