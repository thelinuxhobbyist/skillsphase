import {
  AVAILABILITY_LABELS,
  type AvailabilityOption,
} from "@horizon/shared";
import Link from "next/link";
import type { PublicCandidateCard } from "@/lib/api";

const AVAILABILITY_BADGE: Record<
  AvailabilityOption,
  { label: string; dot: string; tone: string }
> = {
  immediate: {
    label: "Available now",
    dot: "bg-emerald-500",
    tone: "bg-emerald-500/10 text-emerald-800",
  },
  within_one_month: {
    label: "Available within one month",
    dot: "bg-amber-500",
    tone: "bg-amber-500/10 text-amber-900",
  },
  freelance: {
    label: AVAILABILITY_LABELS.freelance,
    dot: "bg-sky-500",
    tone: "bg-sky-500/10 text-sky-900",
  },
  permanent: {
    label: AVAILABILITY_LABELS.permanent,
    dot: "bg-slate-500",
    tone: "bg-slate-500/10 text-slate-800",
  },
};

export function PublicCandidateCardView({ card }: { card: PublicCandidateCard }) {
  const name = [card.firstName, card.lastName].filter(Boolean).join(" ");
  const title = card.professionalTitle || name || "Skill Profile";
  const meta = card.professionalTitle
    ? [name, card.city].filter(Boolean).join(" · ")
    : card.city || "";
  const availability = card.availability
    ? AVAILABILITY_BADGE[card.availability]
    : null;

  return (
    <li className="group flex h-full min-w-[min(100%,20rem)] flex-col rounded-2xl border border-[color:var(--line)]/70 bg-white p-6 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--line)] hover:shadow-[0_12px_28px_-18px_oklch(0.19_0.02_240_/_0.35)]">
      <Link
        href={`/discover-talent/${card.id}`}
        className="flex min-w-0 flex-col"
      >
        <h3 className="text-left font-sans text-xl font-semibold leading-snug tracking-tight break-words text-primary sm:text-2xl">
          {title}
        </h3>

        {meta ? (
          <p className="mt-1.5 text-left text-[0.95rem] leading-snug text-[color:var(--ink-soft)]">
            {meta}
          </p>
        ) : null}

        {(card.yearsExperience != null || card.topProject) ? (
          <div className="mt-4 space-y-1 text-left text-[0.95rem] leading-snug text-[color:var(--ink-soft)]">
            {card.yearsExperience != null ? (
              <p>{card.yearsExperience} years experience</p>
            ) : null}
            {card.topProject ? (
              <p className="line-clamp-2 break-words">{card.topProject}</p>
            ) : null}
          </div>
        ) : null}
      </Link>

      <div className="mt-auto flex flex-col gap-3 pt-5">
        {availability ? (
          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${availability.tone}`}
          >
            <span
              className={`size-1.5 shrink-0 rounded-full ${availability.dot}`}
              aria-hidden
            />
            {availability.label}
          </span>
        ) : null}
        <Link
          href={`/discover-talent/${card.id}`}
          className="btn-primary block w-full rounded-xl bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
        >
          View profile
        </Link>
      </div>
    </li>
  );
}
