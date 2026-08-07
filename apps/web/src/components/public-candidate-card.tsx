import {
  AVAILABILITY_LABELS,
  type AvailabilityOption,
} from "@horizon/shared";
import Link from "next/link";
import type { PublicCandidateCard } from "@/lib/api";
import { mediaUrl } from "@/lib/api";

const AVAILABILITY_STATUS: Record<
  AvailabilityOption,
  { label: string; dot: string }
> = {
  immediate: {
    label: "Available now",
    dot: "bg-emerald-500",
  },
  one_week: {
    label: "1 week notice",
    dot: "bg-emerald-500",
  },
  two_weeks: {
    label: "2 weeks notice",
    dot: "bg-amber-500",
  },
  within_one_month: {
    label: "Available in 1 month",
    dot: "bg-amber-500",
  },
  negotiable: {
    label: "Negotiable",
    dot: "bg-sky-500",
  },
  freelance: {
    label: AVAILABILITY_LABELS.freelance,
    dot: "bg-sky-500",
  },
  permanent: {
    label: AVAILABILITY_LABELS.permanent,
    dot: "bg-slate-500",
  },
};


function initialsFor(card: PublicCandidateCard) {
  const first = card.firstName?.trim()?.[0];
  const last = card.lastName?.trim()?.[0];
  if (first || last) {
    return `${first ?? ""}${last ?? ""}`.toUpperCase();
  }
  const title = card.professionalTitle?.trim();
  if (title) return title.slice(0, 2).toUpperCase();
  return "?";
}

export function PublicCandidateCardView({ card }: { card: PublicCandidateCard }) {
  const name =
    [card.firstName, card.lastName].filter(Boolean).join(" ") || "Skill Profile";
  const role = card.professionalTitle?.trim() || null;
  const location = card.city?.trim() || null;
  const availability = card.availability
    ? AVAILABILITY_STATUS[card.availability]
    : null;
  const photoSrc = card.profilePhotoUrl
    ? mediaUrl(card.profilePhotoUrl)
    : null;
  const initials = initialsFor(card);
  const capability = card.primaryCapability?.trim() || null;
  const additional = card.additionalCapability?.trim() || null;
  const project = card.topProject?.trim() || null;
  const hasEvidence = capability != null || project != null;
  const skills = card.skills.slice(0, 3);

  return (
    <li className="h-full min-w-[min(100%,20rem)]">
      <Link
        href={`/discover-talent/${card.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-[10px] border border-[color:var(--line)] bg-white transition duration-[180ms] ease-out hover:-translate-y-[3px] hover:border-brand hover:shadow-[0_14px_30px_-18px_oklch(0.19_0.02_240_/_0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35"
      >
        <div className="flex flex-1 flex-col px-5 pb-[18px] pt-5">
          <div className="mb-4 flex items-start gap-3">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt=""
                className="size-[42px] shrink-0 rounded-lg object-cover"
              />
            ) : (
              <span
                className="inline-flex size-[42px] shrink-0 items-center justify-center rounded-lg bg-brand/10 font-display text-[15px] font-semibold text-primary"
                aria-hidden
              >
                {initials}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <h3 className="font-display text-[17px] font-semibold leading-snug tracking-[-0.01em] break-words text-[color:var(--ink)]">
                {name}
              </h3>
              {role ? (
                <p className="mt-0.5 text-[13px] font-semibold leading-snug text-primary">
                  {role}
                </p>
              ) : null}
              {location ? (
                <p className="mt-0.5 text-[12.5px] leading-snug text-[color:var(--ink-soft)]">
                  {location}
                </p>
              ) : null}
            </div>
          </div>

          {hasEvidence ? (
            <div className="mb-4 space-y-3 border-y border-dashed border-[color:var(--line)] py-3">
              {capability ? (
                <div>
                  <p className="mb-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-[color:var(--ink-soft)]">
                    Primary Capability
                  </p>
                  <p className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-[color:var(--ink)]">
                    {capability}
                  </p>
                  {additional ? (
                    <p className="mt-1.5 line-clamp-1 text-[12.5px] leading-snug text-[color:var(--ink-soft)]">
                      + {additional}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {project ? (
                <div>
                  <p className="mb-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-[color:var(--ink-soft)]">
                    Proof of Ability
                  </p>
                  <p className="line-clamp-2 text-[13.5px] leading-snug text-[color:var(--ink)]">
                    {project}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {skills.length > 0 ? (
            <div className="mb-[18px] flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-[color:var(--line)] bg-[color:var(--paper)] px-[9px] py-1 text-[11.5px] font-medium text-[color:var(--ink-soft)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-auto flex items-center justify-between gap-2.5">
            {availability ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--ink-soft)]">
                <span
                  className={`size-[7px] shrink-0 rounded-full ${availability.dot}`}
                  aria-hidden
                />
                {availability.label}
              </span>
            ) : (
              <span />
            )}

            <span className="inline-flex items-center gap-1.5 py-[7px] text-[13px] font-semibold text-primary">
              View
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
                className="transition-transform duration-150 group-hover:translate-x-[3px]"
              >
                <path
                  d="M2 6h8M6 2l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
