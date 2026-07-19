import Link from "next/link";

const LINKS = [
  { href: "/jobs", label: "Jobs" },
  { href: "/about", label: "About" },
  { href: "/waitlist", label: "Waitlist" },
  { href: "/register", label: "Register" },
  { href: "/login", label: "Sign in" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[color:var(--line)] bg-brand text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="font-[family-name:var(--font-fraunces)] text-xl font-semibold">
            Project Horizon
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/75">
            Career Return Platform — connecting verified UK employers with people
            returning to work after a career break.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-white/85">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="btn-primary hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/15">
        <p className="mx-auto max-w-6xl px-6 py-4 text-xs text-white/55">
          © {new Date().getFullYear()} Project Horizon. UK only for employer
          registration.
        </p>
      </div>
    </footer>
  );
}
