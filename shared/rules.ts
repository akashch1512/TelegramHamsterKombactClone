// Pure game rules shared by the client and the future server (Plan.md §3.2).
// No React, DOM or Node APIs. All coin and energy values are integers; `now` is
// always passed in so callers decide whose clock is authoritative.

import { energyLimitCost, maxEnergy } from './boosts.ts';
import { CATALOG_BY_ID } from './catalog.ts';
import { cardPrice, incomePerHour, isUnlocked, type CardLevels } from './cards.ts';
import { ENERGY_LIMIT_MAX_LEVEL, HOUR_MS, MS_PER_ENERGY, OFFLINE_INCOME_CAP_MS, TAP_COST } from './economy.ts';
import { levelFor, tapValue } from './levels.ts';

export interface PlayerState {
  /** Spendable coins. */
  balance: number;
  /** Lifetime coins earned; decides the level and never decreases. */
  earnedTotal: number;
  /** Energy as of `energyAt`; the current value is derived with `settle`. */
  energy: number;
  energyAt: number;
  energyLimitLevel: number;
  cards: CardLevels;
  /** Passive income has been credited up to this time. */
  incomeAt: number;
  /** Carried fraction of a coin, in coin·ms per hour units (0 ≤ rem < HOUR_MS). */
  incomeRem: number;
}

export function newPlayer(now: number): PlayerState {
  return {
    balance: 0,
    earnedTotal: 0,
    energy: maxEnergy(0), // D2: new players start full
    energyAt: now,
    energyLimitLevel: 0,
    cards: {},
    incomeAt: now,
    incomeRem: 0,
  };
}

/**
 * Brings energy regeneration and passive income up to `now`.
 * A clock that moved backwards grants nothing; offline income is capped.
 */
export function settle(state: PlayerState, now: number): PlayerState {
  const max = maxEnergy(state.energyLimitLevel);
  let { energy, energyAt } = state;
  if (now < energyAt) energyAt = now;
  const gained = Math.floor((now - energyAt) / MS_PER_ENERGY);
  if (energy + gained >= max) {
    energy = max;
    energyAt = now;
  } else {
    energy += gained;
    energyAt += gained * MS_PER_ENERGY; // keep the partial tick
  }

  const rate = incomePerHour(state.cards);
  let earned = 0;
  let incomeRem = 0;
  if (rate > 0) {
    const elapsed = Math.min(Math.max(now - state.incomeAt, 0), OFFLINE_INCOME_CAP_MS);
    const total = rate * elapsed + state.incomeRem;
    earned = Math.floor(total / HOUR_MS);
    incomeRem = total % HOUR_MS;
  }

  if (energy === state.energy && energyAt === state.energyAt && earned === 0 &&
      incomeRem === state.incomeRem && now === state.incomeAt) {
    return state;
  }
  return {
    ...state,
    energy,
    energyAt,
    balance: state.balance + earned,
    earnedTotal: state.earnedTotal + earned,
    incomeAt: now,
    incomeRem,
  };
}

export interface TapResult {
  state: PlayerState;
  accepted: boolean;
  /** Coins this tap earned (0 when rejected). */
  value: number;
}

export function tryTap(state: PlayerState, now: number): TapResult {
  const s = settle(state, now);
  if (s.energy < TAP_COST) return { state: s, accepted: false, value: 0 };
  const value = tapValue(levelFor(s.earnedTotal));
  return {
    state: { ...s, energy: s.energy - TAP_COST, balance: s.balance + value, earnedTotal: s.earnedTotal + value },
    accepted: true,
    value,
  };
}

/** Milliseconds until energy is full again (0 when already full). */
export function msUntilFull(state: PlayerState, now: number): number {
  const s = settle(state, now);
  const max = maxEnergy(s.energyLimitLevel);
  if (s.energy >= max) return 0;
  return (max - s.energy) * MS_PER_ENERGY - (now - s.energyAt);
}

/** Milliseconds until there is enough energy for one tap (0 when a tap is possible). */
export function msUntilTap(state: PlayerState, now: number): number {
  const s = settle(state, now);
  if (s.energy >= TAP_COST) return 0;
  return (TAP_COST - s.energy) * MS_PER_ENERGY - (now - s.energyAt);
}

export type PurchaseError = 'max-level' | 'insufficient' | 'locked' | 'unavailable';

export type PurchaseResult =
  | { ok: true; state: PlayerState; cost: number }
  | { ok: false; state: PlayerState; reason: PurchaseError };

/** Buys the next energy-limit level. Spends `balance`, never `earnedTotal`. */
export function buyEnergyLimit(state: PlayerState, now: number): PurchaseResult {
  const s = settle(state, now);
  const cost = energyLimitCost(s.energyLimitLevel);
  if (cost === null || s.energyLimitLevel >= ENERGY_LIMIT_MAX_LEVEL) return { ok: false, state: s, reason: 'max-level' };
  if (s.balance < cost) return { ok: false, state: s, reason: 'insufficient' };
  // Energy carries over; only the limit rises, so the bar rescales and keeps regenerating.
  return { ok: true, cost, state: { ...s, balance: s.balance - cost, energyLimitLevel: s.energyLimitLevel + 1 } };
}

/** Buys a card or upgrades a city card by one level. */
export function buyCard(state: PlayerState, cardId: string, now: number): PurchaseResult {
  const s = settle(state, now);
  const entry = CATALOG_BY_ID.get(cardId);
  if (!entry) return { ok: false, state: s, reason: 'unavailable' };
  if (!isUnlocked(entry, s.cards)) return { ok: false, state: s, reason: 'locked' };
  const level = s.cards[cardId] ?? 0;
  const cost = cardPrice(entry, level);
  if (cost === null) return { ok: false, state: s, reason: level > 0 ? 'max-level' : 'unavailable' };
  if (s.balance < cost) return { ok: false, state: s, reason: 'insufficient' };
  return {
    ok: true,
    cost,
    state: { ...s, balance: s.balance - cost, cards: { ...s.cards, [cardId]: level + 1 } },
  };
}
