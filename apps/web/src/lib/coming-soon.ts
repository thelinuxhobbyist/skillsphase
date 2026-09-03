import type { Metadata } from "next";

/**
 * Public shell is hidden while the product is unfinished.
 * Set COMING_SOON=0 to show the full site (local development).
 * Unset or any other value keeps the coming-soon landing page on.
 */
export function isComingSoon(): boolean {
  const value = process.env.COMING_SOON?.trim().toLowerCase();
  return value !== "0" && value !== "false" && value !== "off";
}

export const SITE_URL = "https://skillsphase.com";

const COMING_SOON_TITLE = "SkillsPhase";
const COMING_SOON_DESCRIPTION =
  "We're working on something. Check back later.";

/** Indexable, generic metadata — brand only, no product pitch. */
export const comingSoonMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: COMING_SOON_TITLE,
  description: COMING_SOON_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: COMING_SOON_TITLE,
    description: COMING_SOON_DESCRIPTION,
    url: SITE_URL,
    siteName: "SkillsPhase",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: COMING_SOON_TITLE,
    description: COMING_SOON_DESCRIPTION,
  },
  robots: { index: true, follow: false },
};
