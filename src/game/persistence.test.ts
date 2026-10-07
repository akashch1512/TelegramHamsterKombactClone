import { describe, expect, it } from 'vitest';
import { maxEnergy } from '../../shared/boosts.ts';
import { BASE_MAX_ENERGY, ENERGY_LIMIT_MAX_LEVEL, HOUR_MS } from '../../shared/economy.ts';
import { newPlayer, settle, tryTap } from '../../shared/rules.ts';
import { parseSave, sanitizeState, serializeSave } from './persistence.ts';

const NOW = 1_700_000_000_000;

describe('save data', () => {
  it('round-trips a save exactly', () => {
    let s = newPlayer(NOW - 5_000);
    for (let i = 0; i < 10; i++) s = tryTap(s, NOW - 5_000 + i * 100).state;
    s = { ...s, cards: { asia: 1, iran: 1, tehran: 4 }, energyLimitLevel: 2 };
    const loaded = parseSave(serializeSave(s), NOW);
    expect(loaded.status).toBe('loaded');
    expect(loaded.state).toEqual(s);
  });

  it('starts a new player when nothing is saved', () => {
    expect(parseSave(null, NOW)).toEqual({ state: newPlayer(NOW), status: 'new' });
  });

  it('treats corrupt or unknown-version data as unreadable without crashing', () => {
    for (const text of ['{not json', '42', 'null', '[]', JSON.stringify({ v: 99, state: {} })]) {
      expect(parseSave(text, NOW)).toEqual({ state: newPlayer(NOW), status: 'unreadable' });
    }
  });

  it('regenerates energy for time spent closed', () => {
    const saved = { ...newPlayer(NOW - 30_000), energy: 1_000 };
    const s = settle(parseSave(serializeSave(saved), NOW).state, NOW);
    expect(s.energy).toBe(1_300);
  });

  it('treats future timestamps as now, so a moved clock grants nothing', () => {
    const s = sanitizeState({ ...newPlayer(NOW), energy: 0, energyAt: NOW + HOUR_MS, incomeAt: NOW + HOUR_MS }, NOW);
    expect(s.energyAt).toBe(NOW);
    expect(s.incomeAt).toBe(NOW);
    expect(settle(s, NOW).energy).toBe(0);
  });

  it('clamps out-of-range and wrongly typed values', () => {
    const s = sanitizeState(
      {
        balance: -5,
        earnedTotal: 'lots',
        energy: 1e9,
        energyAt: Number.NaN,
        energyLimitLevel: 999,
        cards: { tehran: 3 },
        incomeAt: 'yesterday',
        incomeRem: HOUR_MS * 10,
      },
      NOW,
    );
    expect(s).toEqual({
      balance: 0,
      earnedTotal: 0,
      energy: maxEnergy(ENERGY_LIMIT_MAX_LEVEL),
      energyAt: NOW,
      energyLimitLevel: ENERGY_LIMIT_MAX_LEVEL,
      cards: {},
      incomeAt: NOW,
      incomeRem: HOUR_MS - 1,
    });
  });

  it('keeps lifetime earnings at least as high as the balance', () => {
    expect(sanitizeState({ balance: 500, earnedTotal: 100 }, NOW).earnedTotal).toBe(500);
  });

  it('gives missing energy a full bar only for a missing field, not for a wrong one', () => {
    expect(sanitizeState({}, NOW).energy).toBe(BASE_MAX_ENERGY);
    expect(sanitizeState({ energy: -20 }, NOW).energy).toBe(0);
  });
});
