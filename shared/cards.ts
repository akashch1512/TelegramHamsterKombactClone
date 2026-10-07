import { CATALOG, CATALOG_BY_ID, isPriced, type CatalogEntry } from './catalog.ts';
import {
  CARD_MAX_LEVEL, CARD_PROFIT_GROWTH_PCT, CARD_UPGRADE_PAYBACK_BASE_H, CARD_UPGRADE_PAYBACK_STEP_H,
} from './economy.ts';

/** Owned card levels by card id. Regions and countries are 1 once bought. */
export type CardLevels = Readonly<Record<string, number>>;

/** Hourly profit of a city card at `level` (0 when not owned). Integer compounding. */
export function cardProfitAt(entry: CatalogEntry, level: number): number {
  if (entry.kind !== 'city' || entry.baseProfitPerHour === null || level < 1) return 0;
  let profit = entry.baseProfitPerHour;
  for (let l = 1; l < Math.min(level, CARD_MAX_LEVEL); l++) {
    profit = Math.floor((profit * (100 + CARD_PROFIT_GROWTH_PCT)) / 100);
  }
  return profit;
}

/** Highest level a card can be bought to: 21 for cities, 1 for regions and countries. */
export function maxLevelOf(entry: CatalogEntry): number {
  return entry.kind === 'city' ? CARD_MAX_LEVEL : 1;
}

/** Price to go from `level` to `level + 1`, or null if not purchasable (unpriced or maxed). */
export function cardPrice(entry: CatalogEntry, level: number): number | null {
  if (!isPriced(entry) || level >= maxLevelOf(entry)) return null;
  if (level === 0) return entry.cost;
  const gain = cardProfitAt(entry, level + 1) - cardProfitAt(entry, level);
  return gain * (CARD_UPGRADE_PAYBACK_BASE_H + CARD_UPGRADE_PAYBACK_STEP_H * (level - 1));
}

/** A card can be bought once its parent (country for a city, region for a country) is owned. */
export function isUnlocked(entry: CatalogEntry, cards: CardLevels): boolean {
  return entry.parent === null || (cards[entry.parent] ?? 0) >= 1;
}

export function incomePerHour(cards: CardLevels): number {
  let total = 0;
  for (const [id, level] of Object.entries(cards)) {
    const entry = CATALOG_BY_ID.get(id);
    if (entry) total += cardProfitAt(entry, level);
  }
  return total;
}

/**
 * Drops unknown cards, clamps levels, and removes cards whose parent is not owned.
 * Used to validate saved or untrusted card data.
 */
export function sanitizeCards(raw: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (typeof raw !== 'object' || raw === null) return out;
  const input = raw as Record<string, unknown>;
  // CATALOG lists parents before children, so one pass resolves unlocks.
  for (const entry of CATALOG) {
    const level = input[entry.id];
    if (typeof level !== 'number' || !Number.isInteger(level) || level < 1) continue;
    if (!isPriced(entry) || !isUnlocked(entry, out)) continue;
    out[entry.id] = Math.min(level, maxLevelOf(entry));
  }
  return out;
}
