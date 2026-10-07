import { LABOR_COUNT, levelProgress } from '../../shared/levels.ts';
import Arrow from '../icons/Arrow.tsx';
import { trophy } from '../images';

/** Current labor and progress to the next one; opens the Story screen (Plan.md B1, B2). */
export function LevelBadge({ earnedTotal, onOpenStory }: { earnedTotal: number; onOpenStory: () => void }) {
  const p = levelProgress(earnedTotal);
  const title = p.current ? `Labor ${p.current.number}: ${p.current.title}` : 'All seven labors complete';
  return (
    <div className="min-w-0 flex-1 rounded-2xl bg-panel/85 px-3 py-2 ring-1 ring-gold/20">
      <button
        type="button"
        onClick={onOpenStory}
        className="flex min-h-[44px] w-full items-center gap-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
      >
        <img src={trophy} width={28} height={28} alt="" draggable={false} className="shrink-0" />
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-sand">
            Story · {Math.min(p.level + 1, LABOR_COUNT)} of {LABOR_COUNT}
          </span>
          <span className="block truncate text-sm font-bold">{title}</span>
        </span>
        <Arrow size={16} className="shrink-0 text-gold" />
      </button>
      <div className="mt-1 flex items-center gap-2">
        <div
          role="progressbar"
          aria-label={p.current ? `Progress to complete Labor ${p.current.number}` : 'Season progress'}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={p.percent}
          className="h-2 flex-1 overflow-hidden rounded-full bg-black/50"
        >
          <div className="bar-fill h-full rounded-full bg-gold" style={{ width: `${p.percent}%` }} />
        </div>
        <span className="tabular w-9 text-right text-xs font-semibold text-sand">{p.percent}%</span>
      </div>
    </div>
  );
}
