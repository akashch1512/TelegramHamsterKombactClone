// Card catalog: regions → countries → cities (README:194-214).
// Only Asia, Iran and Tehran have prices in the README. Every other entry is named in
// the README but has no price yet, so `cost` is null and the game shows it as
// "Coming soon". The owner fills in the numbers here; nothing else needs to change.

export type CardKind = 'region' | 'country' | 'city';

export interface CatalogEntry {
  id: string;
  name: string;
  kind: CardKind;
  /** The card that must be owned before this one can be bought. */
  parent: string | null;
  /** Region/country: one-time unlock price. City: price of level 1. Null = not priced yet. */
  cost: number | null;
  /** City only: hourly profit at level 1. */
  baseProfitPerHour: number | null;
}

const region = (id: string, name: string, cost: number | null): CatalogEntry =>
  ({ id, name, kind: 'region', parent: null, cost, baseProfitPerHour: null });
const country = (id: string, name: string, parent: string, cost: number | null): CatalogEntry =>
  ({ id, name, kind: 'country', parent, cost, baseProfitPerHour: null });
const city = (id: string, name: string, parent: string, cost: number | null, baseProfitPerHour: number | null): CatalogEntry =>
  ({ id, name, kind: 'city', parent, cost, baseProfitPerHour });

export const CATALOG: readonly CatalogEntry[] = [
  region('asia', 'Asia', 1_000_000),
  region('europe', 'Europe', null),
  region('africa', 'Africa', null),
  region('americas', 'Americas', null),
  region('oceania', 'Oceania', null),

  country('iran', 'Iran', 'asia', 500_000),
  country('china', 'China', 'asia', null),
  country('india', 'India', 'asia', null),
  country('japan', 'Japan', 'asia', null),
  country('south-korea', 'South Korea', 'asia', null),

  city('tehran', 'Tehran', 'iran', 100_000, 1_000),
  city('isfahan', 'Isfahan', 'iran', null, null),
  city('shiraz', 'Shiraz', 'iran', null, null),
  city('mashhad', 'Mashhad', 'iran', null, null),
  city('tabriz', 'Tabriz', 'iran', null, null),
];

export const CATALOG_BY_ID: ReadonlyMap<string, CatalogEntry> = new Map(CATALOG.map((e) => [e.id, e]));

export function childrenOf(parent: string | null): CatalogEntry[] {
  return CATALOG.filter((e) => e.parent === parent);
}

/** True when the owner has priced the entry, so it can be bought. */
export function isPriced(entry: CatalogEntry): boolean {
  return entry.cost !== null && (entry.kind !== 'city' || entry.baseProfitPerHour !== null);
}
