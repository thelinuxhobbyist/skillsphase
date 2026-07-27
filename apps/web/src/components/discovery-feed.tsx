"use client";

import { useAuth } from "@clerk/nextjs";
import {
  AVAILABILITY_LABELS,
  AVAILABILITY_OPTIONS,
  REMOTE_TYPE_LABELS,
  REMOTE_TYPES,
} from "@horizon/shared";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiRequestError,
  getDiscoveryFeed,
  reviewCandidate,
  type CandidateCard,
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

export function DiscoveryFeed({
  initialCards,
}: {
  initialCards: CandidateCard[];
}) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [cards, setCards] = useState(initialCards);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragX, setDragX] = useState(0);
  const dragging = useRef(false);
  const dragStartX = useRef(0);

  const token = useCallback(async () => {
    const value = await getToken();
    if (!value) throw new Error("Missing session token");
    return value;
  }, [getToken]);

  const loadFeed = useCallback(
    async (nextFilters: Filters) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getDiscoveryFeed(await token(), {
          skills: nextFilters.skills || undefined,
          availability: nextFilters.availability || undefined,
          remoteType: nextFilters.remoteType || undefined,
          minYearsExperience: nextFilters.minYearsExperience
            ? Number(nextFilters.minYearsExperience)
            : undefined,
          keyword: nextFilters.keyword || undefined,
        });
        setCards(result);
        setIndex(0);
      } catch (err) {
        setError(
          err instanceof ApiRequestError || err instanceof Error
            ? err.message
            : "Unable to load candidates.",
        );
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  const current = cards[index];

  const advance = useCallback(() => {
    setDragX(0);
    setIndex((i) => i + 1);
  }, []);

  const skip = useCallback(() => {
    if (!current) return;
    void (async () => {
      try {
        await reviewCandidate(await token(), current.id, "skip");
      } catch {
        // non-blocking
      }
    })();
    advance();
  }, [current, advance, token]);

  const viewProfile = useCallback(() => {
    if (!current) return;
    router.push(`/employer/discover/${current.id}`);
  }, [current, router]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        skip();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        viewProfile();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [skip, viewProfile]);

  return (
    <div className="space-y-6">
      <form
        className="flex flex-wrap gap-3 rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void loadFeed(filters);
        }}
      >
        <input
          value={filters.keyword}
          onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
          placeholder="Keyword (title, summary)"
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
          {loading ? "Loading…" : "Apply filters"}
        </button>
      </form>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col items-center gap-6">
        {current ? (
          <div
            className="relative w-full max-w-md touch-pan-y select-none"
            style={{
              transform: `translateX(${dragX}px) rotate(${dragX / 20}deg)`,
              transition: dragging.current ? "none" : "transform 200ms ease",
            }}
            onTouchStart={(event) => {
              dragging.current = true;
              dragStartX.current = event.touches[0]!.clientX;
            }}
            onTouchMove={(event) => {
              if (!dragging.current) return;
              setDragX(event.touches[0]!.clientX - dragStartX.current);
            }}
            onTouchEnd={() => {
              dragging.current = false;
              if (dragX > 100) {
                viewProfile();
              } else if (dragX < -100) {
                skip();
              } else {
                setDragX(0);
              }
            }}
          >
            <CandidateCardView card={current} />
          </div>
        ) : (
          <div className="w-full max-w-md rounded-lg border border-dashed border-[color:var(--line)] bg-[color:var(--surface)] p-10 text-center">
            <p className="font-semibold text-primary">You’re all caught up</p>
            <p className="mt-2 text-sm text-[color:var(--foreground)]/70">
              No more candidates match your filters right now.
            </p>
            <button
              type="button"
              className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
              onClick={() => void loadFeed(filters)}
            >
              Refresh feed
            </button>
          </div>
        )}

        {current ? (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={skip}
              className="rounded-full border border-[color:var(--line)] bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm transition hover:bg-red-50"
              aria-keyshortcuts="ArrowLeft"
            >
              ← Skip
            </button>
            <button
              type="button"
              onClick={viewProfile}
              className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              aria-keyshortcuts="ArrowRight"
            >
              View Profile →
            </button>
          </div>
        ) : null}
        <p className="text-xs text-[color:var(--foreground)]/50">
          Desktop: use ← Skip / → View Profile. Mobile: swipe left to skip, right to view.
        </p>
      </div>
    </div>
  );
}

function CandidateCardView({ card }: { card: CandidateCard }) {
  const name = [card.firstName, card.lastName].filter(Boolean).join(" ") || "Candidate";
  return (
    <div className="rounded-2xl border border-[color:var(--line)] bg-white p-6 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-primary">
            {card.professionalTitle || name}
          </h2>
          <p className="text-sm text-[color:var(--foreground)]/70">{name}</p>
          {card.city ? (
            <p className="text-sm text-[color:var(--foreground)]/60">{card.city}</p>
          ) : null}
        </div>
        {card.availability ? (
          <span className="shrink-0 rounded-full bg-brand-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-accent">
            {AVAILABILITY_LABELS[card.availability]}
          </span>
        ) : null}
      </div>

      {card.skills.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
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
    </div>
  );
}
