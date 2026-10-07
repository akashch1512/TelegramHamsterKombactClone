import { LABORS, levelFor } from '../../shared/levels.ts';
import { newPlayer } from '../../shared/rules.ts';
import type { LocalStore } from '../game/localStore.ts';
import { SAVE_KEY, SETTINGS_KEY } from '../game/persistence.ts';

/**
 * Development-only tools for checking progression by hand (Plan.md B1). Shown with
 * `npm run dev` and `?debug` in the URL; never included in production builds.
 */
export function DebugPanel({ store, onResume }: { store: LocalStore; onResume: () => void }) {
  const patch = (fn: (s: ReturnType<LocalStore['getState']>) => Partial<ReturnType<LocalStore['getState']>>) => {
    const s = store.getState();
    store.debugReplace({ ...s, ...fn(s) });
  };
  const button = 'rounded bg-black/70 px-2 py-1 text-[11px] font-semibold text-cream ring-1 ring-gold/40';
  return (
    <div className="absolute left-2 top-1/3 z-40 flex max-w-[45%] flex-wrap gap-1" aria-label="Debug tools">
      <button
        type="button"
        className={button}
        onClick={() =>
          patch((s) => {
            const next = LABORS[Math.min(levelFor(s.earnedTotal), LABORS.length - 1)].threshold - 2;
            return { earnedTotal: next, balance: Math.min(s.balance, next) };
          })
        }
      >
        Next labor −2
      </button>
      <button type="button" className={button} onClick={() => patch((s) => ({ balance: s.balance + 5_000_000, earnedTotal: s.earnedTotal + 5_000_000 }))}>
        +5M coins
      </button>
      <button type="button" className={button} onClick={() => patch(() => ({ energy: 0, energyAt: Date.now() }))}>
        Empty energy
      </button>
      <button type="button" className={button} onClick={() => {
          patch(() => ({ incomeAt: Date.now() - 5 * 3_600_000 }));
          onResume();
        }}
      >
        Away 5 h
      </button>
      <button
        type="button"
        className={button}
        onClick={() => {
          store.debugReplace(newPlayer(Date.now()));
          localStorage.removeItem(SAVE_KEY);
          localStorage.removeItem(SETTINGS_KEY);
          location.reload();
        }}
      >
        Reset
      </button>
    </div>
  );
}
