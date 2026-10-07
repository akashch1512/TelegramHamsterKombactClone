import { OFFLINE_INCOME_CAP_MS } from '../../shared/economy.ts';
import { formatFull, formatSpan } from '../game/format.ts';
import { coin } from '../images';
import { Dialog } from './Dialog.tsx';

/** "While you were away": passive income credited on return (Plan.md B5). */
export function OfflineIncomeDialog({ credited, awayMs, onClose }: { credited: number; awayMs: number; onClose: () => void }) {
  const capped = awayMs > OFFLINE_INCOME_CAP_MS;
  return (
    <Dialog labelledBy="offline-title" onClose={onClose}>
      <h2 id="offline-title" className="text-center text-xl font-extrabold">While you were away</h2>
      <p className="mt-3 flex items-center justify-center gap-2 text-3xl font-extrabold text-gold">
        <img src={coin} width={32} height={32} alt="" draggable={false} />
        <span className="tabular">+{formatFull(credited)}</span>
      </p>
      <p className="mt-3 text-center text-sm leading-relaxed text-sand">
        Your cards mined this in {formatSpan(capped ? OFFLINE_INCOME_CAP_MS : awayMs)}.
        {capped && ` You were away ${formatSpan(awayMs)}, but cards stop mining after ${formatSpan(OFFLINE_INCOME_CAP_MS)} away.`}
      </p>
      <button type="button" autoFocus onClick={onClose} className="mt-4 min-h-[48px] w-full rounded-2xl bg-gold font-bold text-ink">
        Continue
      </button>
    </Dialog>
  );
}
