import Link from "next/link";
import { getDefaultFooterSection } from "@horizon/shared";

type FooterLink = { label: string; href: string };
type FooterColumn = { title: string; links: FooterLink[] };

function str(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function arr<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function defaultFooterContent() {
  return getDefaultFooterSection().content;
}

export function SiteFooter({
  content,
}: {
  content?: Record<string, unknown>;
}) {
  const c = content ?? defaultFooterContent();
  const columns = arr<FooterColumn>(c.columns);
  const tagline = str(
    c.tagline,
    "SkillsPhase is a jobs platform that replaces the traditional CV with an evidence-based profile.",
  );
  const copyright = str(
    c.copyright,
    "© {year} SkillsPhase. UK only for business registration.",
  ).replace("{year}", String(new Date().getFullYear()));

  return (
    <footer className="mt-auto bg-ink text-ink-foreground">
      <div className="mx-auto grid w-full max-w-[1180px] gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="max-w-sm lg:col-span-1">
          <p className="flex items-center gap-2.5 font-display text-xl font-semibold">
            <span
              aria-hidden
              className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-primary text-primary"
            >
              <span className="absolute inset-[3px] rounded-full border border-dashed border-current opacity-60" />
              <svg
                viewBox="0 0 24 24"
                className="relative h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            SkillsPhase
          </p>
          <p className="mt-3 max-w-[32ch] text-sm leading-relaxed text-ink-foreground/70">
            {tagline}
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-xs font-semibold text-primary">{column.title}</p>
            <ul className="mt-3.5 space-y-2.5 text-sm text-ink-foreground/80">
              {arr<FooterLink>(column.links).map((link) => (
                <li key={`${column.title}-${link.href}`}>
                  <Link href={link.href} className="hover:text-ink-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ink-foreground/15">
        <p className="mx-auto max-w-[1180px] px-4 py-5 text-xs text-ink-foreground/55 sm:px-6">
          {copyright}
        </p>
      </div>
    </footer>
  );
}
