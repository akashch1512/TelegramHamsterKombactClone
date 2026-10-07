import { formatDuration, formatFull } from '../game/format.ts';
import { highVoltage, rocket } from '../images';

interface Props {
  energy: number;
  max: number;
  msToFull: number;
  empty: boolean;
  onBoost: () => void;
}

/** Energy count, refill timer, boost shortcut and a clamped bar (Plan.md A4, B4). */
export function EnergyMeter({ energy, max, msToFull, empty, onBoost }: Props) {
  const percent = Math.min(100, Math.max(0, (energy / max) * 100));
  return (
    <section aria-label="Energy" className="px-4 pb-3">
      <div className="flex items-center gap-2">
        <img src={highVoltage} width={32} height={32} alt="" draggable={false} className="shrink-0" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="energy-figure tabular whitespace-nowrap font-bold text-shadow">
            {formatFull(energy)} <span className="text-sm font-semibold text-sand">/ {formatFull(max)}</span>
          </p>
          <p className={`text-xs font-semibold text-shadow ${empty ? 'text-gold' : 'text-sand'}`}>
            {msToFull === 0 ? 'Energy full' : `${empty ? 'Out of energy · ' : ''}Full in ${formatDuration(msToFull)}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onBoost}
          className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl bg-panel/90 px-2.5 text-sm font-bold text-gold ring-1 ring-gold/30 active:bg-panel"
        >
          <img src={rocket} width={20} height={20} alt="" draggable={false} />
          Boost
        </button>
      </div>
      <div
        role="progressbar"
        aria-label="Energy"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={energy}
        aria-valuetext={`${formatFull(energy)} of ${formatFull(max)}`}
        className="mt-2 h-3 overflow-hidden rounded-full bg-black/50 ring-1 ring-gold/25"
      >
        <div className="bar-fill h-full rounded-full bg-gradient-to-r from-gold-deep to-[#fffad0]" style={{ width: `${percent}%` }} />
      </div>
    </section>
  );
}
