const full = new Intl.NumberFormat('en-US');
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

/** Full figure with separators, for the balance and energy (1,300,000,000). */
export const formatFull = (n: number): string => full.format(n);

/** Short figure for costs and profit (1.2K, 999.9M). */
export const formatCompact = (n: number): string => compact.format(n);

/** m:ss, or h:mm:ss for an hour or more. Rounds up so "0:00" only shows when done. */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

/** "3 h 5 min" style text for longer spans such as time away. */
export function formatSpan(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
