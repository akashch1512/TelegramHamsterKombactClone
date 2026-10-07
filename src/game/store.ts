import type { PlayerState, PurchaseResult, TapResult } from '../../shared/rules.ts';

/** Income credited while the game was closed or hidden. */
export interface ResumeReport {
  credited: number;
  awayMs: number;
}

/**
 * The one interface the UI talks to (Plan.md §3.3). `LocalStore` backs guest mode today;
 * a server-backed `RemoteStore` will implement the same interface in Milestone C,
 * adding `claimTask` with the social features.
 */
export interface GameStore {
  getState(): PlayerState;
  subscribe(listener: () => void): () => void;
  tap(now: number): TapResult;
  buyBoost(now: number): PurchaseResult;
  buyCard(cardId: string, now: number): PurchaseResult;
  /** Settles energy and income after the game opens or becomes visible again. */
  resume(now: number): ResumeReport;
}
