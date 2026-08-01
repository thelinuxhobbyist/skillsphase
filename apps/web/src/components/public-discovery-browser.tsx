"use client";

import {
  AVAILABILITY_LABELS,
  AVAILABILITY_OPTIONS,
  REMOTE_TYPE_LABELS,
  REMOTE_TYPES,
} from "@horizon/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { PublicCandidateCardView } from "@/components/public-candidate-card";
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

function hasMoreFilters(filters: Filters) {
  return Boolean(
    filters.skills.trim() ||
      filters.remoteType ||
      filters.minYearsExperience.trim(),
  );
}

export function PublicDiscoveryBrowser({
  initialCandidates,
  initialTotal,
}: {
  initialCandidates: PublicCandidateCard[];
  initialTotal: number;
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [draftMore, setDraftMore] = useState({
    skills: "",
    remoteType: "",
    minYearsExperience: "",
  });
  const [moreOpen, setMoreOpen] = useState(false);
  const [candidates, setCandidates] = useState(initialCandidates);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const moreRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!moreOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!moreRef.current?.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen]);

  function openMore() {
    setDraftMore({
      skills: filters.skills,
      remoteType: filters.remoteType,
      minYearsExperience: filters.minYearsExperience,
    });
    setMoreOpen((open) => !open);
  }

  function applyMore() {
    const next: Filters = {
      ...filters,
      skills: draftMore.skills,
      remoteType: draftMore.remoteType,
      minYearsExperience: draftMore.minYearsExperience,
    };
    setFilters(next);
    setMoreOpen(false);
    void search(next, 0, false);
  }

  function clearAll() {
    setFilters(EMPTY_FILTERS);
    setDraftMore({
      skills: "",
      remoteType: "",
      minYearsExperience: "",
    });
    setMoreOpen(false);
    void search(EMPTY_FILTERS, 0, false);
  }

  const moreActive = hasMoreFilters(filters);
  const hasActiveSearch = Boolean(
    filters.keyword.trim() ||
      filters.skills.trim() ||
      filters.availability ||
      filters.remoteType ||
      filters.minYearsExperience.trim(),
  );

  return (
    <div className="space-y-6">
      <form
        className="relative flex items-center gap-2 rounded-lg border border-[color:var(--line)] bg-white p-2.5 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          void search(filters, 0, false);
        }}
      >
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-[color:var(--line)] bg-[color:var(--paper)] px-3 py-2">
          <span className="sr-only">Search by title or skill</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0 text-[color:var(--ink-soft)]"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={filters.keyword}
            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
            placeholder="Search by title or skill — e.g. Designer, TypeScript"
            className="w-full min-w-0 border-0 bg-transparent text-sm text-[color:var(--ink)] outline-none placeholder:text-[color:var(--ink-soft)]"
          />
        </label>

        <label className="relative hidden shrink-0 sm:block">
          <span className="sr-only">Availability</span>
          <select
            value={filters.availability}
            onChange={(e) => setFilters((f) => ({ ...f, availability: e.target.value }))}
            className="appearance-none rounded-md border border-[color:var(--line)] bg-[color:var(--paper)] py-2 pr-8 pl-3 text-sm text-[color:var(--ink)]"
          >
            <option value="">Any availability</option>
            {AVAILABILITY_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {AVAILABILITY_LABELS[value]}
              </option>
            ))}
          </select>
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[color:var(--ink-soft)]"
            aria-hidden
          >
            <path
              d="M1 1l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </label>

        <div className="relative shrink-0" ref={moreRef}>
          <button
            type="button"
            onClick={openMore}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
            className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--line)] bg-[color:var(--paper)] px-3.5 py-2 text-sm font-semibold text-[color:var(--ink)]"
          >
            More filters
            {moreActive ? (
              <span
                className="size-1.5 rounded-full bg-primary"
                aria-label="Filters active"
              />
            ) : null}
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              aria-hidden
              className={`transition-transform ${moreOpen ? "rotate-180" : ""}`}
            >
              <path
                d="M1 1l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {moreOpen ? (
            <div
              role="dialog"
              aria-label="More filters"
              className="fixed inset-x-0 bottom-0 z-40 rounded-t-2xl border border-[color:var(--line)] bg-white p-[18px] shadow-lg sm:absolute sm:inset-x-auto sm:top-[calc(100%+8px)] sm:right-0 sm:bottom-auto sm:w-[300px] sm:rounded-xl"
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[color:var(--line)] sm:hidden" />

              <div className="mb-3.5 sm:hidden">
                <label className="mb-1.5 block font-mono text-[10.5px] font-semibold uppercase tracking-[0.05em] text-[color:var(--ink-soft)]">
                  Availability
                </label>
                <select
                  value={filters.availability}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, availability: e.target.value }))
                  }
                  className="w-full rounded-md border border-[color:var(--line)] bg-[color:var(--paper)] px-3 py-2 text-sm text-[color:var(--ink)]"
                >
                  <option value="">Any availability</option>
                  {AVAILABILITY_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {AVAILABILITY_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3.5">
                <label className="mb-1.5 block font-mono text-[10.5px] font-semibold uppercase tracking-[0.05em] text-[color:var(--ink-soft)]">
                  Skills
                </label>
                <input
                  value={draftMore.skills}
                  onChange={(e) =>
                    setDraftMore((d) => ({ ...d, skills: e.target.value }))
                  }
                  placeholder="e.g. TypeScript, SQL"
                  className="w-full rounded-md border border-[color:var(--line)] bg-[color:var(--paper)] px-3 py-2 text-sm text-[color:var(--ink)]"
                />
              </div>

              <div className="mb-3.5">
                <label className="mb-1.5 block font-mono text-[10.5px] font-semibold uppercase tracking-[0.05em] text-[color:var(--ink-soft)]">
                  Work style
                </label>
                <select
                  value={draftMore.remoteType}
                  onChange={(e) =>
                    setDraftMore((d) => ({ ...d, remoteType: e.target.value }))
                  }
                  className="w-full rounded-md border border-[color:var(--line)] bg-[color:var(--paper)] px-3 py-2 text-sm text-[color:var(--ink)]"
                >
                  <option value="">Any</option>
                  {REMOTE_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {REMOTE_TYPE_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[10.5px] font-semibold uppercase tracking-[0.05em] text-[color:var(--ink-soft)]">
                  Min. years experience
                </label>
                <input
                  type="number"
                  min={0}
                  value={draftMore.minYearsExperience}
                  onChange={(e) =>
                    setDraftMore((d) => ({
                      ...d,
                      minYearsExperience: e.target.value,
                    }))
                  }
                  placeholder="0"
                  className="w-full rounded-md border border-[color:var(--line)] bg-[color:var(--paper)] px-3 py-2 text-sm text-[color:var(--ink)]"
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-2.5 border-t border-[color:var(--line)] pt-3.5">
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-md border border-[color:var(--line)] bg-[color:var(--paper)] px-4 py-2 text-[13.5px] font-semibold text-[color:var(--ink-soft)]"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={applyMore}
                  className="rounded-md bg-brand px-4 py-2 text-[13.5px] font-semibold text-white"
                >
                  Apply
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "…" : "Search"}
        </button>
      </form>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <p className="text-sm text-[color:var(--foreground)]/60">
        {hasActiveSearch
          ? `${total} skill profile${total === 1 ? "" : "s"} match${total === 1 ? "es" : ""} your search.`
          : `${total} skill profile${total === 1 ? "" : "s"} available.`}
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
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-5">
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
