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
        className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void search(filters, 0, false);
        }}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-[color:var(--ink-soft)]">
            Title
            <input
              value={filters.keyword}
              onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
              placeholder="e.g. Designer"
              className="w-full min-w-0 rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm text-[color:var(--ink)]"
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-[color:var(--ink-soft)]">
            Skills
            <input
              value={filters.skills}
              onChange={(e) => setFilters((f) => ({ ...f, skills: e.target.value }))}
              placeholder="e.g. TypeScript, SQL"
              className="w-full min-w-0 rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm text-[color:var(--ink)]"
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-[color:var(--ink-soft)]">
            Availability
            <select
              value={filters.availability}
              onChange={(e) => setFilters((f) => ({ ...f, availability: e.target.value }))}
              className="w-full min-w-0 rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm text-[color:var(--ink)]"
            >
              <option value="">Any</option>
              {AVAILABILITY_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {AVAILABILITY_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-[color:var(--ink-soft)]">
            Work style
            <select
              value={filters.remoteType}
              onChange={(e) => setFilters((f) => ({ ...f, remoteType: e.target.value }))}
              className="w-full min-w-0 rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm text-[color:var(--ink)]"
            >
              <option value="">Any</option>
              {REMOTE_TYPES.map((value) => (
                <option key={value} value={value}>
                  {REMOTE_TYPE_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-[color:var(--ink-soft)]">
            Min. years
            <input
              type="number"
              min={0}
              value={filters.minYearsExperience}
              onChange={(e) =>
                setFilters((f) => ({ ...f, minYearsExperience: e.target.value }))
              }
              placeholder="0"
              className="w-full min-w-0 rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm text-[color:var(--ink)]"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </div>
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

function initialsFor(card: PublicCandidateCard, name: string) {
  const fromParts = [card.firstName, card.lastName]
    .filter(Boolean)
    .map((part) => part!.slice(0, 1).toUpperCase())
    .join("");
  if (fromParts) return fromParts.slice(0, 2);
  if (name) return name.slice(0, 2).toUpperCase();
  return "?";
}

function PublicCandidateCardView({ card }: { card: PublicCandidateCard }) {
  const name = [card.firstName, card.lastName].filter(Boolean).join(" ");
  const title = card.professionalTitle || name || "Skill Profile";
  const locationParts = [
    card.city,
    card.remotePreference ? REMOTE_TYPE_LABELS[card.remotePreference] : null,
  ].filter(Boolean);
  const initials = initialsFor(card, name);

  return (
    <li className="flex flex-col rounded-[5px] border border-[color:var(--folder-line)] bg-[color:var(--folder)] p-5 sm:p-6">
      <Link href={`/discover-talent/${card.id}`} className="flex flex-1 flex-col">
        <div className="flex items-center gap-3">
          {card.profilePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.profilePhotoUrl}
              alt=""
              className="h-11 w-11 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--paper)] text-sm font-semibold text-[color:var(--ink)]"
            >
              {initials}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[color:var(--ink)]">
              {name || "Candidate"}
            </p>
            {locationParts.length > 0 ? (
              <p className="truncate text-sm text-[color:var(--ink-soft)]">
                {locationParts.join(" · ")}
              </p>
            ) : null}
          </div>
        </div>

        <h3
          className="mt-4 font-sans text-lg font-semibold leading-snug tracking-tight text-[color:var(--ink)] whitespace-nowrap truncate [overflow-wrap:normal] [word-break:normal]"
          title={title}
        >
          {title}
        </h3>

        {card.skills.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {card.skills.slice(0, 6).map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-[color:var(--line-strong)] bg-[color:var(--paper)] px-2.5 py-1 text-xs text-muted-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-3.5 space-y-1">
          {card.yearsExperience != null ? (
            <p className="text-sm text-[color:var(--ink-soft)]">
              {card.yearsExperience} years experience
            </p>
          ) : null}
          {card.topProject ? (
            <p className="line-clamp-2 text-base text-[color:var(--ink)]">
              {card.topProject}
            </p>
          ) : null}
        </div>

        {card.availability ? (
          <p className="mt-3.5 flex items-center gap-1.5 text-sm font-medium text-primary before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:bg-[color:var(--verified)] before:content-['']">
            {AVAILABILITY_LABELS[card.availability]}
          </p>
        ) : null}

        <span className="mt-5 block w-full rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white">
          View profile →
        </span>
      </Link>
    </li>
  );
}
