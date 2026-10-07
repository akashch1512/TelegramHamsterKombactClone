import { levelProgress } from '../../shared/levels.ts';
import { ScreenHeader } from '../components/ScreenHeader.tsx';
import { CHAPTERS } from '../content/shahnameh.ts';
import { Lock } from '../icons/Icons.tsx';

/** The seven labors: completed chapters are readable, later ones stay locked (Plan.md B2). */
export function StoryScreen({ earnedTotal, balance, onBack }: { earnedTotal: number; balance: number; onBack: () => void }) {
  const { level, percent } = levelProgress(earnedTotal);
  return (
    <>
      <ScreenHeader title="The Seven Labors" balance={balance} onBack={onBack} />
      <div className="scroll min-h-0 flex-1 px-4 pb-4">
        <p className="mb-3 text-sm leading-relaxed text-sand">
          From Ferdowsi&apos;s Shahnameh. Complete a labor to unlock its chapter.
        </p>
        <ol className="flex flex-col gap-3">
          {CHAPTERS.map((c) => {
            const done = c.number <= level;
            const current = c.number === level + 1;
            return (
              <li key={c.number} className={`rounded-2xl p-4 ring-1 ${done ? 'bg-panel/95 ring-gold/30' : 'bg-panel/70 ring-white/10'}`}>
                <h2 className="flex items-center gap-2 font-extrabold">
                  {!done && <Lock size={16} className="shrink-0 text-sand" />}
                  <span className="text-gold">Labor {c.number}</span>
                  <span className="min-w-0 truncate">{c.title}</span>
                </h2>
                {done ? (
                  <>
                    <p className="mt-2 text-sm leading-relaxed">{c.challenge}</p>
                    <p className="mt-2 text-sm leading-relaxed text-sand">
                      <span className="font-bold text-cream">Meaning:</span> {c.symbolism}
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-sand">
                      {c.facts.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-sand">{current ? `In progress: ${percent}% complete.` : 'Locked.'}</p>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
