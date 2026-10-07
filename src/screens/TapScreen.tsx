import type { Ref } from 'react';
import type { TapResult } from '../../shared/rules.ts';
import { EnergyMeter } from '../components/EnergyMeter.tsx';
import { LevelBadge } from '../components/LevelBadge.tsx';
import { TapCoin } from '../components/TapCoin.tsx';
import { formatCompact, formatFull } from '../game/format.ts';
import { SoundOff, SoundOn } from '../icons/Icons.tsx';
import { coin } from '../images';

interface Props {
  balance: number;
  earnedTotal: number;
  profitPerHour: number;
  energy: number;
  maxEnergy: number;
  msToFull: number;
  empty: boolean;
  muted: boolean;
  coinRef: Ref<HTMLButtonElement>;
  onTap: () => TapResult;
  onGesture: () => void;
  onToggleMute: () => void;
  onOpenStory: () => void;
  onBoost: () => void;
}

/** The core loop (Plan.md §2.1): level, income, balance above the coin, coin, energy. */
export function TapScreen(p: Props) {
  return (
    <>
      <h1 className="sr-only">Falcon Tap</h1>
      <header className="shrink-0 px-4 pt-3">
        <LevelBadge earnedTotal={p.earnedTotal} onOpenStory={p.onOpenStory} />
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="flex min-h-[36px] items-center gap-1.5 rounded-full bg-panel/85 px-3 text-sm ring-1 ring-gold/20">
            <span className="text-sand">Profit per hour</span>
            <span className="tabular font-bold text-gold">+{formatCompact(p.profitPerHour)}</span>
          </p>
          <button
            type="button"
            onClick={p.onToggleMute}
            aria-label={p.muted ? 'Turn sound on' : 'Turn sound off'}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-panel/85 text-gold ring-1 ring-gold/20 active:bg-panel"
          >
            {p.muted ? <SoundOff size={22} /> : <SoundOn size={22} />}
          </button>
        </div>
      </header>

      <p className="flex shrink-0 items-center justify-center gap-2 px-4 pt-2 text-shadow">
        <img src={coin} width={40} height={40} alt="" draggable={false} className="h-9 w-9" />
        <span className="balance tabular font-extrabold leading-none">{formatFull(p.balance)}</span>
        <span className="sr-only">coins</span>
      </p>

      <div className="coin-area">
        <TapCoin ref={p.coinRef} empty={p.empty} onTap={p.onTap} onGesture={p.onGesture} />
      </div>

      <EnergyMeter energy={p.energy} max={p.maxEnergy} msToFull={p.msToFull} empty={p.empty} onBoost={p.onBoost} />
    </>
  );
}
