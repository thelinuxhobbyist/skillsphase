"use client";

import { useState } from "react";
import { ApiRequestError, joinWaitlist } from "@/lib/api";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (done) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16">
        <h1 className="font-display text-3xl text-primary">
          You’re on the list
        </h1>
        <p className="mt-3 text-[color:var(--foreground)]/75">
          Thanks — we’ll reach out when SkillsPhase supports businesses outside
          the UK.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <h1 className="font-display text-3xl text-primary">
        Non-UK business waitlist
      </h1>
      <p className="mt-3 mb-8 text-[color:var(--foreground)]/75">
        The MVP is limited to UK Companies House registrations. Join the
        waitlist if you’re hiring from elsewhere.
      </p>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void (async () => {
            setPending(true);
            setError(null);
            try {
              await joinWaitlist({
                email,
                companyName: companyName || undefined,
                countryCode,
                notes: notes || undefined,
              });
              setDone(true);
            } catch (err) {
              setError(
                err instanceof ApiRequestError || err instanceof Error
                  ? err.message
                  : "Unable to join waitlist.",
              );
              setPending(false);
            }
          })();
        }}
      >
        <label className="block text-sm">
          <span className="font-medium text-primary">Work email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-primary">Company name</span>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-primary">Country code</span>
          <input
            required
            maxLength={2}
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
            placeholder="US"
            className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-primary">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
            rows={3}
          />
        </label>
        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          Join waitlist
        </button>
      </form>
    </main>
  );
}
