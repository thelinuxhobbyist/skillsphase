export const CDN_ASSETS_BASE = "https://cdn.skillsphase.com/assets";
export const BRAND_ASSET_VERSION = "2";

export function brandAsset(path: string): string {
  return `${CDN_ASSETS_BASE}/${path}?v=${BRAND_ASSET_VERSION}`;
}

export const brandIcons = {
  icon: [
    { url: brandAsset("favicon.svg"), type: "image/svg+xml" },
    {
      url: brandAsset("favicon-32x32.png"),
      sizes: "32x32",
      type: "image/png",
    },
    { url: brandAsset("favicon.ico") },
  ],
  apple: [{ url: brandAsset("apple-touch-icon.png"), sizes: "180x180" }],
  shortcut: brandAsset("favicon.ico"),
};
