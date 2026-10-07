import { LEVEL_THRESHOLDS, TAP_VALUE_BY_LEVEL } from './economy.ts';

export interface Labor {
  /** 1-7 */
  number: number;
  title: string;
  /** Lifetime coins needed to complete this labor. */
  threshold: number;
  /**
   * Background art key. All labors use the shared Shahnameh scene until the seven
   * level backgrounds are supplied (Plan B3, [Asset]).
   */
  background: 'shahnameh';
}

const TITLES = ['The Lion', 'The Desert', 'The Dragon', 'The Sorceress', 'The Demon', 'The Simurgh', 'The Rescue'];

export const LABORS: readonly Labor[] = TITLES.map((title, i) => ({
  number: i + 1,
  title,
  threshold: LEVEL_THRESHOLDS[i],
  background: 'shahnameh',
}));

export const LABOR_COUNT = LABORS.length;

/** Number of labors completed (0-7) for a lifetime total. */
export function levelFor(earnedTotal: number): number {
  let level = 0;
  while (level < LABOR_COUNT && earnedTotal >= LABORS[level].threshold) level++;
  return level;
}

export function tapValue(level: number): number {
  return TAP_VALUE_BY_LEVEL[Math.min(Math.max(level, 0), TAP_VALUE_BY_LEVEL.length - 1)];
}

export interface LevelProgress {
  level: number;
  /** The labor being worked on, or null once all seven are complete. */
  current: Labor | null;
  /** Coins earned since the previous threshold, and the span to the next one. */
  into: number;
  span: number;
  /** Whole percent, 0-100. */
  percent: number;
}

export function levelProgress(earnedTotal: number): LevelProgress {
  const level = levelFor(earnedTotal);
  if (level >= LABOR_COUNT) return { level, current: null, into: 0, span: 0, percent: 100 };
  const floor = level === 0 ? 0 : LABORS[level - 1].threshold;
  const span = LABORS[level].threshold - floor;
  const into = earnedTotal - floor;
  return { level, current: LABORS[level], into, span, percent: Math.floor((into * 100) / span) };
}
