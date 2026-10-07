import {
  BASE_MAX_ENERGY, ENERGY_LIMIT_BASE_COST, ENERGY_LIMIT_MAX_LEVEL, ENERGY_LIMIT_STEP,
} from './economy.ts';

export function maxEnergy(energyLimitLevel: number): number {
  return BASE_MAX_ENERGY + energyLimitLevel * ENERGY_LIMIT_STEP;
}

/** Price of the next energy-limit level, or null when already at the maximum. */
export function energyLimitCost(energyLimitLevel: number): number | null {
  if (energyLimitLevel >= ENERGY_LIMIT_MAX_LEVEL) return null;
  return ENERGY_LIMIT_BASE_COST * 2 ** energyLimitLevel;
}
