import { describe, expect, it } from 'vitest';
import { energyLimitCost, maxEnergy } from './boosts.ts';
import { CATALOG_BY_ID } from './catalog.ts';
import { cardPrice, cardProfitAt, incomePerHour, sanitizeCards } from './cards.ts';
import {
  BASE_MAX_ENERGY, CARD_MAX_LEVEL, ENERGY_LIMIT_MAX_LEVEL, HOUR_MS, LEVEL_THRESHOLDS, MS_PER_ENERGY,
  OFFLINE_INCOME_CAP_MS, REGEN_PER_SEC, SECOND_MS, TAP_COST,
} from './economy.ts';
import { LABORS, levelFor, levelProgress, tapValue } from './levels.ts';
import { buyCard, buyEnergyLimit, msUntilFull, msUntilTap, newPlayer, settle, tryTap, type PlayerState } from './rules.ts';

const T0 = 1_700_000_000_000;
const player = (patch: Partial<PlayerState> = {}): PlayerState => ({ ...newPlayer(T0), ...patch });

describe('economy constants', () => {
  it('regenerates on whole milliseconds', () => {
    expect(SECOND_MS % REGEN_PER_SEC).toBe(0);
  });
  it('has seven increasing thresholds', () => {
    expect(LABORS).toHaveLength(7);
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) expect(LEVEL_THRESHOLDS[i]).toBeGreaterThan(LEVEL_THRESHOLDS[i - 1]);
  });
});

describe('energy', () => {
  it('starts full', () => {
    expect(newPlayer(T0).energy).toBe(BASE_MAX_ENERGY);
  });

  it('regenerates at the configured rate and caps at the limit', () => {
    const empty = player({ energy: 0 });
    expect(settle(empty, T0 + 30 * SECOND_MS).energy).toBe(30 * REGEN_PER_SEC);
    expect(msUntilFull(empty, T0)).toBe(650 * SECOND_MS);
    expect(settle(empty, T0 + 650 * SECOND_MS).energy).toBe(BASE_MAX_ENERGY);
    expect(settle(empty, T0 + 10 * HOUR_MS).energy).toBe(BASE_MAX_ENERGY);
  });

  it('keeps partial ticks when settled often', () => {
    let s = player({ energy: 0 });
    for (let t = 1; t <= 1000; t++) s = settle(s, T0 + t * 37);
    expect(s.energy).toBe(Math.floor((1000 * 37) / MS_PER_ENERGY));
  });

  it('grants nothing when the clock moves backwards', () => {
    const s = settle(player({ energy: 100 }), T0 - HOUR_MS);
    expect(s.energy).toBe(100);
    expect(s.energyAt).toBe(T0 - HOUR_MS);
  });
});

describe('tapping', () => {
  it('scores once and spends the tap cost', () => {
    const r = tryTap(player(), T0);
    expect(r.accepted).toBe(true);
    expect(r.value).toBe(tapValue(0));
    expect(r.state.balance).toBe(tapValue(0));
    expect(r.state.earnedTotal).toBe(tapValue(0));
    expect(r.state.energy).toBe(BASE_MAX_ENERGY - TAP_COST);
  });

  it('rejects taps below the tap cost without touching the balance', () => {
    const s = player({ energy: TAP_COST - 1, balance: 500, earnedTotal: 500 });
    const r = tryTap(s, T0);
    expect(r.accepted).toBe(false);
    expect(r.value).toBe(0);
    expect(r.state.balance).toBe(500);
    expect(r.state.energy).toBe(TAP_COST - 1);
    expect(msUntilTap(s, T0)).toBe(MS_PER_ENERGY);
  });

  it('starts regenerating from the first tap after idling at full', () => {
    const idle = player();
    const r = tryTap(idle, T0 + HOUR_MS);
    expect(r.state.energy).toBe(BASE_MAX_ENERGY - TAP_COST);
    expect(settle(r.state, T0 + HOUR_MS + TAP_COST * MS_PER_ENERGY).energy).toBe(BASE_MAX_ENERGY);
  });

  it('uses the tap value of the current level', () => {
    const r = tryTap(player({ earnedTotal: LEVEL_THRESHOLDS[0] }), T0);
    expect(r.value).toBe(tapValue(1));
  });
});

describe('levels', () => {
  it('derives the level from lifetime earnings', () => {
    expect(levelFor(0)).toBe(0);
    expect(levelFor(LEVEL_THRESHOLDS[0] - 1)).toBe(0);
    expect(levelFor(LEVEL_THRESHOLDS[0])).toBe(1);
    expect(levelFor(LEVEL_THRESHOLDS[6])).toBe(7);
    expect(levelFor(Number.MAX_SAFE_INTEGER)).toBe(7);
  });

  it('reports progress toward the next labor', () => {
    const p = levelProgress(LEVEL_THRESHOLDS[0] + (LEVEL_THRESHOLDS[1] - LEVEL_THRESHOLDS[0]) / 2);
    expect(p.level).toBe(1);
    expect(p.current?.number).toBe(2);
    expect(p.percent).toBe(50);
    expect(levelProgress(LEVEL_THRESHOLDS[6]).current).toBeNull();
  });

  it('is not lowered by spending', () => {
    const s = player({ balance: 2_000_000, earnedTotal: 2_000_000 });
    const r = buyCard(s, 'asia', T0);
    expect(r.ok).toBe(true);
    expect(levelFor(r.state.earnedTotal)).toBe(1);
  });
});

describe('energy limit boost', () => {
  it('refuses when unaffordable and charges the exact cost', () => {
    const cost = energyLimitCost(0)!;
    expect(buyEnergyLimit(player({ balance: cost - 1 }), T0)).toMatchObject({ ok: false, reason: 'insufficient' });
    const r = buyEnergyLimit(player({ balance: cost }), T0);
    expect(r.ok).toBe(true);
    expect(r.state.balance).toBe(0);
    expect(r.state.energyLimitLevel).toBe(1);
    expect(maxEnergy(1)).toBeGreaterThan(BASE_MAX_ENERGY);
  });

  it('stops at the maximum level', () => {
    const r = buyEnergyLimit(player({ balance: Number.MAX_SAFE_INTEGER, energyLimitLevel: ENERGY_LIMIT_MAX_LEVEL }), T0);
    expect(r).toMatchObject({ ok: false, reason: 'max-level' });
  });
});

describe('cards', () => {
  const tehran = CATALOG_BY_ID.get('tehran')!;
  const rich = (cards: Record<string, number> = {}) => player({ balance: 1e12, earnedTotal: 1e12, cards });

  it('keeps cities locked until their country is bought', () => {
    expect(buyCard(rich(), 'tehran', T0)).toMatchObject({ ok: false, reason: 'locked' });
    expect(buyCard(rich(), 'iran', T0)).toMatchObject({ ok: false, reason: 'locked' });
    expect(buyCard(rich({ asia: 1 }), 'iran', T0).ok).toBe(true);
  });

  it('refuses unpriced cards', () => {
    expect(buyCard(rich(), 'europe', T0)).toMatchObject({ ok: false, reason: 'unavailable' });
    expect(buyCard(rich(), 'nowhere', T0)).toMatchObject({ ok: false, reason: 'unavailable' });
  });

  it('buys Tehran for 100K, adding 1,000/h', () => {
    const r = buyCard(rich({ asia: 1, iran: 1 }), 'tehran', T0);
    expect(r).toMatchObject({ ok: true, cost: 100_000 });
    expect(incomePerHour(r.state.cards)).toBe(1_000);
  });

  it('compounds profit by 10% per level and stops at level 21', () => {
    expect(cardProfitAt(tehran, 2)).toBe(1_100);
    expect(cardProfitAt(tehran, 3)).toBe(1_210);
    expect(cardPrice(tehran, CARD_MAX_LEVEL)).toBeNull();
    const r = buyCard(rich({ asia: 1, iran: 1, tehran: CARD_MAX_LEVEL }), 'tehran', T0);
    expect(r).toMatchObject({ ok: false, reason: 'max-level' });
  });

  it('refuses a second purchase of a region', () => {
    expect(buyCard(rich({ asia: 1 }), 'asia', T0)).toMatchObject({ ok: false, reason: 'max-level' });
  });

  it('sanitizes saved cards', () => {
    expect(sanitizeCards({ tehran: 3, iran: 1 })).toEqual({});
    expect(sanitizeCards({ asia: 1, iran: 1, tehran: 99, mars: 2, europe: 1 })).toEqual({ asia: 1, iran: 1, tehran: CARD_MAX_LEVEL });
    expect(sanitizeCards({ asia: 1.5, iran: '1' })).toEqual({});
    expect(sanitizeCards(null)).toEqual({});
  });
});

describe('passive income', () => {
  const owner = () => player({ cards: { asia: 1, iran: 1, tehran: 1 } });

  it('adds exactly one hour of profit after one hour, even when settled every second', () => {
    let s = owner();
    for (let t = 1; t <= 3600; t++) s = settle(s, T0 + t * SECOND_MS);
    expect(s.balance).toBe(1_000);
    expect(s.earnedTotal).toBe(1_000);
    expect(settle(owner(), T0 + HOUR_MS).balance).toBe(1_000);
  });

  it('credits only the offline cap after a long absence', () => {
    const s = settle(owner(), T0 + 10 * HOUR_MS);
    expect(s.balance).toBe((1_000 * OFFLINE_INCOME_CAP_MS) / HOUR_MS);
  });

  it('grants nothing when the clock moves backwards', () => {
    expect(settle(owner(), T0 - HOUR_MS).balance).toBe(0);
  });
});
