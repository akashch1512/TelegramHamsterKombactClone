import type { ReactNode } from 'react';
import { Pickaxe } from '../icons/Icons.tsx';
import { bear, coin, falconCoin, rocket } from '../images';

export type Tab = 'tap' | 'mine' | 'frens' | 'earn' | 'boosts';

const img = (src: string) => <img src={src} width={24} height={24} alt="" draggable={false} className="h-6 w-6 object-contain" />;

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: 'tap', label: 'Tap', icon: img(falconCoin) },
  { id: 'mine', label: 'Mine', icon: <Pickaxe size={24} /> },
  { id: 'frens', label: 'Frens', icon: img(bear) },
  { id: 'earn', label: 'Earn', icon: img(coin) },
  { id: 'boosts', label: 'Boosts', icon: img(rocket) },
];

/** Five-tab navigation (Plan.md A8, D6). Sits in the layout flow, never `fixed`. */
export function BottomNav({ active, onSelect }: { active: Tab; onSelect: (tab: Tab) => void }) {
  return (
    <nav aria-label="Main" className="shrink-0 px-2 pb-2 pt-1">
      <ul className="flex rounded-2xl bg-gold p-1 shadow-lg shadow-black/40">
        {TABS.map((t) => {
          const current = t.id === active;
          return (
            <li key={t.id} className="min-w-0 flex-1">
              <button
                type="button"
                aria-current={current ? 'page' : undefined}
                onClick={() => onSelect(t.id)}
                className={`flex min-h-[52px] w-full flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-bold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink ${
                  current ? 'bg-gold-deep shadow-inner' : 'active:bg-gold-deep/60'
                }`}
              >
                {t.icon}
                <span className="max-w-full truncate">{t.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
