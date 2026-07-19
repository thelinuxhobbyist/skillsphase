import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[color:var(--line)] bg-brand text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="max-w-sm">
          <p className="font-[family-name:var(--font-fraunces)] text-xl font-semibold">
            Project Horizon
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/75">
            Career Return Platform — connecting verified UK employers with people
            returning to work after a career break.
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
                About Horizon
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
