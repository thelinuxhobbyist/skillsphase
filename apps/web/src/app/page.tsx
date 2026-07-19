import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <p className="font-[family-name:var(--font-fraunces)] text-xl font-semibold tracking-tight text-brand">
          Project Horizon
        </p>
        <nav className="flex items-center gap-5 text-sm font-medium text-[color:var(--foreground)]/80">
          <Link href="/jobs">Jobs</Link>
          <Link href="/about">About</Link>
          <Link href="/waitlist">Waitlist</Link>
          <Link
            href="/login"
            className="rounded-md bg-brand px-3 py-2 text-white transition hover:opacity-90"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <main className="relative mx-auto grid min-h-[calc(100vh-5.5rem)] w-full max-w-6xl items-center gap-10 px-6 pb-16 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
            Career Return Platform
          </p>
          <h1 className="max-w-xl font-[family-name:var(--font-fraunces)] text-5xl leading-[1.05] font-semibold tracking-tight text-brand md:text-6xl">
            Project Horizon
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-[color:var(--foreground)]/80">
            A trusted place where verified UK employers meet skilled people
            returning to work after a career break.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/register"
              className="rounded-md bg-brand-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Find your next role
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-3 text-sm font-semibold text-brand backdrop-blur transition hover:bg-white"
            >
              Hire returners
            </Link>
          </div>
        </section>

        <section
          aria-hidden
          className="relative hidden min-h-[28rem] overflow-hidden rounded-none lg:block"
          style={{
            background:
              "linear-gradient(145deg, rgba(15,76,92,0.92), rgba(15,76,92,0.55)), url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22 viewBox=%220 0 160 160%22%3E%3Cpath fill=%22%23ffffff14%22 d=%22M0 80h160M80 0v160%22/%3E%3C/svg%3E')",
            backgroundSize: "cover, 48px 48px",
          }}
        >
          <div className="absolute inset-0 animate-[horizon-pan_18s_ease-in-out_infinite_alternate] bg-[radial-gradient(circle_at_30%_40%,rgba(227,100,20,0.35),transparent_45%)]" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-white">
            <p className="font-[family-name:var(--font-fraunces)] text-2xl">
              Careers are rarely linear.
            </p>
            <p className="mt-2 max-w-sm text-sm text-white/85">
              Horizon helps employers discover talent that traditional screening
              overlooks.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
