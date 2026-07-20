/** UK-facing date helpers. Store ISO (YYYY-MM-DD); display DD/MM/YYYY. */

export function isoToUk(iso: string | null | undefined): string {
  if (!iso) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return iso;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

/**
 * Expand a 2-digit year to 4 digits.
 * 00–49 → 2000–2049, 50–99 → 1950–1999 (common UK form convention).
 */
export function expandTwoDigitYear(yy: number): number {
  if (yy < 0 || yy > 99) return yy;
  return yy <= 49 ? 2000 + yy : 1900 + yy;
}

/** Parse UK-style dates, including DD/MM/YY → full year. */
export function ukToIso(uk: string): string | null {
  const trimmed = uk.trim();
  if (!trimmed) return null;

  const isoAlready = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoAlready) return trimmed;

  const match = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/.exec(trimmed);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  let year = Number(match[3]);
  if (match[3]!.length === 2) {
    year = expandTwoDigitYear(year);
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Normalise typed input to DD/MM/YYYY when valid; otherwise return original. */
export function normaliseUkDateInput(value: string): string {
  const iso = ukToIso(value);
  return iso ? isoToUk(iso) : value;
}

export function formatUkDateLabel(iso: string | null | undefined): string {
  const uk = isoToUk(iso);
  return uk || "—";
}
