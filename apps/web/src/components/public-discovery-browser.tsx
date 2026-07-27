"use client";

import {
  AVAILABILITY_LABELS,
  AVAILABILITY_OPTIONS,
  REMOTE_TYPE_LABELS,
  REMOTE_TYPES,
} from "@horizon/shared";
import Link from "next/link";
import { useCallback, useState } from "react";
import {
  ApiRequestError,
  getPublicCandidates,
  type PublicCandidateCard,
} from "@/lib/api";

type Filters = {
  skills: string;
  availability: string;
  remoteType: string;
  minYearsExperience: string;
  keyword: string;
};

const EMPTY_FILTERS: Filters = {
  skills: "",
  availability: "",
  remoteType: "",
  minYearsExperience: "",
  keyword: "",
};

const PAGE_SIZE = 12;

export function PublicDiscoveryBrowser({
  initialCandidates,
  initialTotal,
}: {
  initialCandidates: PublicCandidateCard[];
  initialTotal: number;
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [candidates, setCandidates] = useState(initialCandidates);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (nextFilters: Filters, offset: number, append: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPublicCandidates({
        skills: nextFilters.skills || undefined,
        availability: nextFilters.availability || undefined,
        remoteType: nextFilters.remoteType || undefined,
        minYearsExperience: nextFilters.minYearsExperience
          ? Number(nextFilters.minYearsExperience)
          : undefined,
        keyword: nextFilters.keyword || undefined,
        limit: PAGE_SIZE,
        offset,
      });
      setCandidates((prev) => (append ? [...prev, ...result.candidates] : result.candidates));
      setTotal(result.total);
    } catch (err) {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Unable to load candidates right now.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <form
        className="flex flex-wrap gap-3 rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void search(filters, 0, false);
        }}
      >
        <input
          value={filters.keyword}
          onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
          placeholder="Keyword (title)"
          className="min-w-[160px] flex-1 rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
        />
        <input
          value={filters.skills}
          onChange={(e) => setFilters((f) => ({ ...f, skills: e.target.value }))}
          placeholder="Skills, comma separated"
          className="min-w-[160px] flex-1 rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
        />
        <select
          value={filters.availability}
          onChange={(e) => setFilters((f) => ({ ...f, availability: e.target.value }))}
          className="rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
        >
          <option value="">Any availability</option>
          {AVAILABILITY_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {AVAILABILITY_LABELS[value]}
            </option>
          ))}
        </select>
        <select
          value={filters.remoteType}
          onChange={(e) => setFilters((f) => ({ ...f, remoteType: e.target.value }))}
          className="rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
        >
          <option value="">Any location</option>
          {REMOTE_TYPES.map((value) => (
            <option key={value} value={value}>
              {REMOTE_TYPE_LABELS[value]}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          value={filters.minYearsExperience}
          onChange={(e) =>
            setFilters((f) => ({ ...f, minYearsExperience: e.target.value }))
          }
          placeholder="Min years exp."
          className="w-32 rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <p className="text-sm text-[color:var(--foreground)]/60">
        {total} skill profile{total === 1 ? "" : "s"} match
        {total === 1 ? "es" : ""} your search.
      </p>

      {candidates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[color:var(--line)] bg-[color:var(--surface)] p-10 text-center">
          <p className="font-semibold text-primary">No skill profiles yet</p>
          <p className="mt-2 text-sm text-[color:var(--foreground)]/70">
            No candidates match this search right now — try different filters, or
            check back soon as more people join SkillsPhase.
          </p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((card) => (
            <PublicCandidateCardView key={card.id} card={card} />
          ))}
        </ul>
      )}

      {candidates.length > 0 && candidates.length < total ? (
        <div className="flex justify-center">
          <button
            type="button"
            disabled={loading}
            onClick={() => void search(filters, candidates.length, true)}
            className="rounded-md border border-[color:var(--line)] bg-white px-5 py-2.5 text-sm font-semibold text-primary disabled:opacity-60"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function PublicCandidateCardView({ card }: { card: PublicCandidateCard }) {
  const name = [card.firstName, card.lastName].filter(Boolean).join(" ");
  return (
    <li className="flex flex-col rounded-lg border border-[color:var(--line)] bg-white p-5 shadow-sm sm:p-6">
      <Link href={`/discover-talent/${card.id}`} className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-lg text-primary">
              {card.professionalTitle || name || "Skill Profile"}
            </h3>
            {name ? (
              <p className="text-sm text-[color:var(--foreground)]/70">
                {name}
                {card.city ? ` · ${card.city}` : ""}
              </p>
            ) : null}
          </div>
          {card.availability ? (
            <span className="shrink-0 rounded-full bg-brand-accent/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary-accent">
              {AVAILABILITY_LABELS[card.availability]}
            </span>
          ) : null}
        </div>

        {card.skills.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {card.skills.slice(0, 8).map((skill) => (
              <span
                key={skill}
                className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] px-2.5 py-1 text-xs font-medium text-primary"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : null}

        <dl className="mt-4 space-y-1 text-sm text-[color:var(--foreground)]/75">
          {card.yearsExperience != null ? (
            <div>
              <dt className="inline font-semibold text-primary">Experience: </dt>
              <dd className="inline">{card.yearsExperience} years</dd>
            </div>
          ) : null}
          {card.remotePreference ? (
            <div>
              <dt className="inline font-semibold text-primary">Preference: </dt>
              <dd className="inline">{REMOTE_TYPE_LABELS[card.remotePreference]}</dd>
            </div>
          ) : null}
          {card.topProject ? (
            <div>
              <dt className="inline font-semibold text-primary">Top project: </dt>
              <dd className="inline">{card.topProject}</dd>
            </div>
          ) : null}
        </dl>
      </Link>

      <div className="mt-5 border-t border-[color:var(--line)]/60 pt-4">
        <Link
          href="/register?as=business"
          className="btn-primary block rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
        >
          Sign in or register as a business to contact
        </Link>
      </div>
    </li>
  );
}
