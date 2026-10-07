// Economy simulation for Plan.md step B0. Run with `npm run simulate:economy`
// (Node 22.18+ runs this TypeScript file directly). It plays the shared rules for
// 31 days with two player profiles and prints Markdown tables for docs/economy.md.

import { energyLimitCost, maxEnergy } from '../shared/boosts.ts';
import { CATALOG, childrenOf, isPriced, type CatalogEntry } from '../shared/catalog.ts';
import { cardPrice, cardProfitAt, incomePerHour, isUnlocked } from '../shared/cards.ts';
import { HOUR_MS, LEVEL_TARGET_DAY, TAP_COST } from '../shared/economy.ts';
import { LABORS, levelFor, tapValue } from '../shared/levels.ts';
import { buyCard, buyEnergyLimit, newPlayer, settle, tryTap, type PlayerState } from '../shared/rules.ts';

const DAYS = 31;
const TAP_INTERVAL_MS = 167; // about 6 taps per second

interface Profile {
  name: string;
  description: string;
  /** Hours of the day at which a session starts. */
  sessionHours: number[];
}

const PROFILES: Profile[] = [
  { name: 'Regular', description: '6 sessions a day (08, 11, 14, 17, 20, 23 h)', sessionHours: [8, 11, 14, 17, 20, 23] },
  {
    name: 'Dedicated',
    description: '16 sessions a day (hourly, 08-23 h)',
    sessionHours: Array.from({ length: 16 }, (_, i) => 8 + i),
  },
];

/** Hourly profit an unlock-only card leads to: the best priced city underneath it. */
function bestCityGain(entry: CatalogEntry): number {
  if (entry.kind === 'city') return cardProfitAt(entry, 1);
  return Math.max(0, ...childrenOf(entry.id).filter(isPriced).map(bestCityGain));
}

/** Greedy shopping: energy boosts first, then the card with the shortest payback that ends before the season does. */
function shop(state: PlayerState, now: number, hoursLeft: number): PlayerState {
  for (;;) {
    const boost = energyLimitCost(state.energyLimitLevel);
    if (boost !== null && boost <= state.balance && hoursLeft >= 24) {
      const r = buyEnergyLimit(state, now);
      if (r.ok) { state = r.state; continue; }
    }
    let best: { id: string; payback: number } | null = null;
    for (const entry of CATALOG) {
      if (!isUnlocked(entry, state.cards)) continue;
      const level = state.cards[entry.id] ?? 0;
      const price = cardPrice(entry, level);
      if (price === null || price > state.balance) continue;
      const gain = entry.kind === 'city' ? cardProfitAt(entry, level + 1) - cardProfitAt(entry, level) : bestCityGain(entry);
      if (gain <= 0) continue;
      const payback = price / gain;
      if (payback < hoursLeft && (!best || payback < best.payback)) best = { id: entry.id, payback };
    }
    if (!best) return state;
    const r = buyCard(state, best.id, now);
    if (!r.ok) return state;
    state = r.state;
  }
}

interface Outcome {
  laborDay: (number | null)[];
  tapsPerDay: number;
  final: PlayerState;
}

function run(profile: Profile): Outcome {
  const start = 0;
  let state = newPlayer(start);
  const laborDay: (number | null)[] = LABORS.map(() => null);
  let taps = 0;
  for (let day = 0; day < DAYS; day++) {
    for (const hour of profile.sessionHours) {
      let now = start + day * 24 * HOUR_MS + hour * HOUR_MS;
      state = settle(state, now);
      for (;;) {
        const r = tryTap(state, now);
        state = r.state;
        if (!r.accepted) break;
        taps++;
        now += TAP_INTERVAL_MS;
      }
      state = shop(state, now, (DAYS - day) * 24 - hour);
      const level = levelFor(state.earnedTotal);
      for (let i = 0; i < level; i++) laborDay[i] ??= day + 1;
    }
  }
  return { laborDay, tapsPerDay: Math.round(taps / DAYS), final: state };
}

const fmt = (n: number) => n.toLocaleString('en-US');
const outcomes = PROFILES.map((p) => ({ profile: p, ...run(p) }));

const lines: string[] = [];
lines.push(`Profiles: ${PROFILES.map((p) => `**${p.name}**: ${p.description}`).join('; ')}.`);
lines.push('Each session taps until energy runs out (about 6 taps/s), then buys boosts and cards greedily.', '');
lines.push(`| Labor | Lifetime coins | README day | ${PROFILES.map((p) => `${p.name} day`).join(' | ')} |`);
lines.push(`|---|---|---|${PROFILES.map(() => '---').join('|')}|`);
LABORS.forEach((labor, i) => {
  const cells = outcomes.map((o) => {
    const d = o.laborDay[i];
    if (d === null) return 'not reached';
    const diff = d - LEVEL_TARGET_DAY[i];
    return `${d} (${diff === 0 ? 'on time' : diff > 0 ? `+${diff}` : diff})`;
  });
  lines.push(`| ${labor.number} ${labor.title} | ${fmt(labor.threshold)} | ${LEVEL_TARGET_DAY[i]} | ${cells.join(' | ')} |`);
});
lines.push('', `| After 31 days | ${PROFILES.map((p) => p.name).join(' | ')} |`, `|---|${PROFILES.map(() => '---').join('|')}|`);
const row = (label: string, f: (o: Outcome) => string) => lines.push(`| ${label} | ${outcomes.map(f).join(' | ')} |`);
row('Taps per day', (o) => fmt(o.tapsPerDay));
row('Lifetime coins', (o) => fmt(o.final.earnedTotal));
row('Energy limit', (o) => `${fmt(maxEnergy(o.final.energyLimitLevel))} (level ${o.final.energyLimitLevel})`);
row('Profit per hour', (o) => fmt(incomePerHour(o.final.cards)));
row('Cards owned', (o) => Object.entries(o.final.cards).map(([id, l]) => `${id} ${l}`).join(', ') || 'none');
row('Final tap value', (o) => fmt(tapValue(levelFor(o.final.earnedTotal))));
lines.push('', `Tap cost: ${TAP_COST} energy.`);

console.log(lines.join('\n'));
