import { buyCard, buyEnergyLimit, settle, tryTap, type PlayerState } from '../../shared/rules.ts';
import {
  parseSave, readStorage, SAVE_KEY, serializeSave, UNREADABLE_SAVE_KEY, writeStorage,
} from './persistence.ts';
import type { GameStore, ResumeReport } from './store.ts';

const SAVE_INTERVAL_MS = 1_000;

/** Guest-mode store: state lives in memory and is saved to localStorage (Plan.md A5). */
export class LocalStore implements GameStore {
  private state: PlayerState;
  private listeners = new Set<() => void>();
  private dirty = false;
  private timer: number | null = null;

  constructor(now: number) {
    const text = readStorage(SAVE_KEY);
    const loaded = parseSave(text, now);
    if (loaded.status === 'unreadable' && text !== null) writeStorage(UNREADABLE_SAVE_KEY, text);
    this.state = loaded.state;
    this.dirty = loaded.status !== 'loaded';
  }

  getState = (): PlayerState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  tap(now: number) {
    const result = tryTap(this.state, now);
    this.set(result.state);
    return result;
  }

  buyBoost(now: number) {
    const result = buyEnergyLimit(this.state, now);
    this.set(result.state);
    if (result.ok) this.save();
    return result;
  }

  buyCard(cardId: string, now: number) {
    const result = buyCard(this.state, cardId, now);
    this.set(result.state);
    if (result.ok) this.save();
    return result;
  }

  resume(now: number): ResumeReport {
    const before = this.state;
    this.set(settle(before, now));
    return { credited: this.state.balance - before.balance, awayMs: Math.max(0, now - before.incomeAt) };
  }

  /**
   * Saves about once a second while visible, and immediately when the page is hidden or
   * closed. Returns a cleanup function.
   */
  start(): () => void {
    const onHide = () => {
      if (document.visibilityState === 'hidden') this.save();
    };
    const onPageHide = () => this.save();
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onPageHide);
    this.timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      // Settling here keeps `incomeAt` current, so time spent watching the game isn't
      // later mistaken for offline time and cut by the offline cap.
      this.set(settle(this.state, Date.now()));
      if (this.dirty) this.save();
    }, SAVE_INTERVAL_MS);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onPageHide);
      if (this.timer !== null) window.clearInterval(this.timer);
      this.timer = null;
      this.save();
    };
  }

  save(): void {
    if (!this.dirty) return;
    writeStorage(SAVE_KEY, serializeSave(this.state));
    this.dirty = false;
  }

  /** Development-only helper for the debug panel (Plan.md B1 verification). */
  debugReplace(state: PlayerState): void {
    if (!import.meta.env.DEV) return;
    this.set(state);
    this.save();
  }

  private set(next: PlayerState): void {
    if (next === this.state) return;
    this.state = next;
    this.dirty = true;
    this.listeners.forEach((l) => l());
  }
}
