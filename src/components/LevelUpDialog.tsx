import { LABOR_COUNT, LABORS, tapValue } from '../../shared/levels.ts';
import { CHAPTERS } from '../content/shahnameh.ts';
import { formatFull } from '../game/format.ts';
import { trophy } from '../images';
import { Dialog } from './Dialog.tsx';

interface Props {
  /** The labor just completed (1-7). */
  labor: number;
  onClose: () => void;
  onReadStory: () => void;
}

/** Shown once per completed labor, never during a tap streak (Plan.md B1, B2). */
export function LevelUpDialog({ labor, onClose, onReadStory }: Props) {
  const chapter = CHAPTERS[labor - 1];
  const next = labor < LABOR_COUNT ? LABORS[labor] : null;
  return (
    <Dialog labelledBy="level-up-title" onClose={onClose}>
      <div className="text-center">
        <img src={trophy} width={64} height={64} alt="" className="mx-auto" draggable={false} />
        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gold">Labor {labor} complete</p>
        <h2 id="level-up-title" className="mt-1 text-2xl font-extrabold">{chapter.title}</h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed">{chapter.challenge}</p>
      <p className="mt-2 text-sm leading-relaxed text-sand">
        <span className="font-bold text-cream">Meaning:</span> {chapter.symbolism}
      </p>
      <div className="mt-3 rounded-2xl bg-black/30 p-3 text-sm leading-relaxed">
        <p className="font-bold text-gold">Did you know?</p>
        <p className="mt-1">{chapter.facts[0]}</p>
      </div>
      <p className="mt-3 text-sm font-semibold">
        {next
          ? `Next: Labor ${next.number}, ${next.title}. Each tap now earns ${formatFull(tapValue(labor))} coins.`
          : 'Season complete! You have finished all seven labors.'}
      </p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onReadStory}
          className="min-h-[48px] flex-1 rounded-2xl bg-black/30 px-3 font-bold text-gold ring-1 ring-gold/40"
        >
          Read the story
        </button>
        <button type="button" autoFocus onClick={onClose} className="min-h-[48px] flex-1 rounded-2xl bg-gold px-3 font-bold text-ink">
          Continue
        </button>
      </div>
    </Dialog>
  );
}
