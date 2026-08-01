import {
  AVAILABILITY_LABELS,
  REMOTE_TYPE_LABELS,
} from "@horizon/shared";
import Link from "next/link";
import type { PublicCandidateCard } from "@/lib/api";

export function PublicCandidateCardView({ card }: { card: PublicCandidateCard }) {
  const name = [card.firstName, card.lastName].filter(Boolean).join(" ");
  const title = card.professionalTitle || name || "Skill Profile";
  const meta = [name, card.city].filter(Boolean).join(" · ");

  return (
    <li className="flex min-w-0 flex-col rounded-lg border border-[color:var(--line)] bg-white p-5 shadow-sm sm:p-6">
      <Link href={`/discover-talent/${card.id}`} className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-sans text-lg font-semibold leading-snug text-primary [overflow-wrap:anywhere]">
              {title}
            </h3>
            {meta ? (
              <p className="mt-1 text-sm text-[color:var(--foreground)]/70">
                {meta}
              </p>
            ) : null}
          </div>
          {card.availability ? (
            <span className="shrink-0 rounded-full bg-brand-accent/10 px-2.5 py-0.5 text-xs font-medium text-primary-accent whitespace-nowrap">
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
              <dd className="inline">
                {REMOTE_TYPE_LABELS[card.remotePreference]}
              </dd>
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
          href={`/discover-talent/${card.id}`}
          className="btn-primary block rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
        >
          View profile →
        </Link>
      </div>
    </li>
  );
}
