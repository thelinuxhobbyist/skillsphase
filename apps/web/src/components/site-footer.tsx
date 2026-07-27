import Link from "next/link";

export function SiteFooter() {
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
            Skills first. Because life happens. A skills-first hiring platform
            connecting verified UK businesses with capable people through
            skills-first profiles and portfolio evidence.
          </p>
        </div>

        <div>
          <p className="font-mono text-xs tracking-widest text-primary uppercase">
            FOR CANDIDATES
          </p>
          <ul className="mt-3.5 space-y-2.5 text-sm text-ink-foreground/80">
            <li>
              <Link
                href="/register?as=candidate"
                className="hover:text-ink-foreground"
              >
                Create your Skill Profile
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-ink-foreground">
                About
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-xs tracking-widest text-primary uppercase">
            FOR BUSINESSES
          </p>
          <ul className="mt-3.5 space-y-2.5 text-sm text-ink-foreground/80">
            <li>
              <Link
                href="/discover-talent"
                className="hover:text-ink-foreground"
              >
                Browse Skill Profiles
              </Link>
            </li>
            <li>
              <Link
                href="/register?as=business"
                className="hover:text-ink-foreground"
              >
                Register as a business
              </Link>
            </li>
            <li>
              <Link href="/waitlist" className="hover:text-ink-foreground">
                Non-UK waitlist
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-ink-foreground">
                Sign in
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-xs tracking-widest text-primary uppercase">
            LEGAL &amp; HELP
          </p>
          <ul className="mt-3.5 space-y-2.5 text-sm text-ink-foreground/80">
            <li>
              <Link href="/privacy" className="hover:text-ink-foreground">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-ink-foreground">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-ink-foreground">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-ink-foreground">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-foreground/15">
        <p className="mx-auto max-w-[1180px] px-4 py-5 font-mono text-xs text-ink-foreground/55 sm:px-6">
          © {new Date().getFullYear()} SkillsPhase. UK only for business
          registration.
        </p>
      </div>
    </footer>
  );
}
