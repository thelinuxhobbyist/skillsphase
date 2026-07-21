import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[color:var(--line)] bg-brand text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="max-w-sm lg:col-span-1">
          <p className="font-[family-name:var(--font-fraunces)] text-xl font-semibold">
            Project Horizon
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/75">
            Career Return Platform — temporary name while branding is finalised.
            Connecting verified UK employers with people returning to work after
            a career break.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/60">
            For returners
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/85">
            <li>
              <Link href="/register?as=seeker" className="btn-primary hover:text-white">
                Register as a returner
              </Link>
            </li>
            <li>
              <Link href="/jobs" className="btn-primary hover:text-white">
                Browse jobs
              </Link>
            </li>
            <li>
              <Link href="/about" className="btn-primary hover:text-white">
                About
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/60">
            For employers
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/85">
            <li>
              <Link
                href="/register?as=employer"
                className="btn-primary hover:text-white"
              >
                Register as an employer
              </Link>
            </li>
            <li>
              <Link href="/waitlist" className="btn-primary hover:text-white">
                Non-UK waitlist
              </Link>
            </li>
            <li>
              <Link href="/login" className="btn-primary hover:text-white">
                Sign in
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/60">
            Legal &amp; help
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/85">
            <li>
              <Link href="/privacy" className="btn-primary hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="btn-primary hover:text-white">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link href="/contact" className="btn-primary hover:text-white">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="btn-primary hover:text-white">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-white/55 sm:px-6">
          © {new Date().getFullYear()} Project Horizon (working title). UK only
          for employer registration.
        </p>
      </div>
    </footer>
  );
}
