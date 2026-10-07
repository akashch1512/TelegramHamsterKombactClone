// Guest-mode save data in localStorage (Plan.md A5, D7). Everything read back is
// validated, because storage can be missing, corrupt, edited, or written by a future version.

import { maxEnergy } from '../../shared/boosts.ts';
import { sanitizeCards } from '../../shared/cards.ts';
import { ENERGY_LIMIT_MAX_LEVEL, HOUR_MS } from '../../shared/economy.ts';
import { newPlayer, type PlayerState } from '../../shared/rules.ts';

export const SAVE_KEY = 'falcon-tap:v1';
export const SETTINGS_KEY = 'falcon-tap:settings';
/** Where an unreadable save is copied before defaults replace it, so it can be recovered by hand. */
export const UNREADABLE_SAVE_KEY = 'falcon-tap:unreadable';
export const SAVE_VERSION = 1;

/** Upper bound for any coin amount; far above the 1.3B season target. */
const MAX_COINS = 1e15;

export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // storage disabled, e.g. some private modes
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Quota exceeded or storage disabled: the game keeps running unsaved.
  }
}

function int(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.floor(value), min), max);
}

/** A timestamp that is missing, invalid or in the future counts as `now`. */
function time(value: unknown, now: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= now ? Math.floor(value) : now;
}

/** Turns untrusted data into a valid PlayerState. Never grants more than the data claims. */
export function sanitizeState(raw: unknown, now: number): PlayerState {
  const fresh = newPlayer(now);
  if (typeof raw !== 'object' || raw === null) return fresh;
  const r = raw as Record<string, unknown>;
  const balance = int(r.balance, 0, MAX_COINS, 0);
  const energyLimitLevel = int(r.energyLimitLevel, 0, ENERGY_LIMIT_MAX_LEVEL, 0);
  return {
    balance,
    // Coins are only ever spent, so lifetime earnings can't be below the balance.
    earnedTotal: Math.max(int(r.earnedTotal, 0, MAX_COINS, 0), balance),
    energyLimitLevel,
    energy: int(r.energy, 0, maxEnergy(energyLimitLevel), fresh.energy),
    energyAt: time(r.energyAt, now),
    cards: sanitizeCards(r.cards),
    incomeAt: time(r.incomeAt, now),
    incomeRem: int(r.incomeRem, 0, HOUR_MS - 1, 0),
  };
}

export type LoadResult = { state: PlayerState; status: 'new' | 'loaded' | 'unreadable' };

/** Parses a stored save. Unknown versions are treated as unreadable rather than guessed at. */
export function parseSave(text: string | null, now: number): LoadResult {
  if (text === null) return { state: newPlayer(now), status: 'new' };
  try {
    const data: unknown = JSON.parse(text);
    if (typeof data === 'object' && data !== null && (data as { v?: unknown }).v === SAVE_VERSION) {
      return { state: sanitizeState((data as { state?: unknown }).state, now), status: 'loaded' };
    }
  } catch {
    // fall through
  }
  return { state: newPlayer(now), status: 'unreadable' };
}

export function serializeSave(state: PlayerState): string {
  return JSON.stringify({ v: SAVE_VERSION, state });
}

export interface Settings {
  muted: boolean;
  introSeen: boolean;
  /** Highest labor whose completion dialog has been shown. */
  celebratedLevel: number;
}

const DEFAULT_SETTINGS: Settings = { muted: false, introSeen: false, celebratedLevel: 0 };

export function loadSettings(): Settings {
  const text = readStorage(SETTINGS_KEY);
  if (text === null) return DEFAULT_SETTINGS;
  try {
    const raw = JSON.parse(text) as Partial<Record<keyof Settings, unknown>>;
    return {
      muted: raw.muted === true,
      introSeen: raw.introSeen === true,
      celebratedLevel: int(raw.celebratedLevel, 0, 7, 0),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  writeStorage(SETTINGS_KEY, JSON.stringify(settings));
}
