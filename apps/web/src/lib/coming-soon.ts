/**
 * Public shell is hidden while the product is unfinished.
 * Set COMING_SOON=0 to show the full site (local development).
 * Unset or any other value keeps the coming-soon landing page on.
 */
export function isComingSoon(): boolean {
  const value = process.env.COMING_SOON?.trim().toLowerCase();
  return value !== "0" && value !== "false" && value !== "off";
}
