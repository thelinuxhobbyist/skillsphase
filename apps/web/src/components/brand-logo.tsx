import { brandAsset } from "@/lib/brand";

type BrandLogoVariant = "lockup" | "lockupOnDark" | "mark";

const SOURCE: Record<BrandLogoVariant, string> = {
  lockup: "logo.svg",
  lockupOnDark: "logo-on-dark.svg",
  mark: "favicon.svg",
};

export function BrandLogo({
  variant = "lockup",
  className,
}: {
  variant?: BrandLogoVariant;
  className?: string;
}) {
  const decorative = variant === "mark";
  return (
    // CDN SVG lockup — native img so the vector file is used as-is.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brandAsset(SOURCE[variant])}
      alt={decorative ? "" : "SkillsPhase"}
      className={className}
      draggable={false}
    />
  );
}
