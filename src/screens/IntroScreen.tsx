import { shahnamehWide } from '../images';

/** First-run intro, replacing public/persian_theme.html (Plan.md A11, D5). */
export function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="scroll flex min-h-0 flex-1 flex-col px-6 py-6">
      <div className="m-auto flex w-full max-w-[340px] flex-col items-center gap-6 text-center">
        <img
          src={shahnamehWide}
          width={1280}
          height={720}
          alt="Rostam and Sohrab face each other beneath a Persian arch"
          draggable={false}
          className="aspect-video w-full rounded-3xl object-cover shadow-xl shadow-black/60 ring-2 ring-gold/60"
        />
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Tap to Earn</p>
          <h1 className="mt-1 text-4xl font-extrabold text-shadow">Falcon Tap</h1>
          <p className="mt-3 leading-relaxed text-sand">
            Tap the Falcon coin, build up your energy and follow Rostam through the Seven Labors of the Shahnameh.
          </p>
        </div>
        <button
          type="button"
          autoFocus
          onClick={onStart}
          className="min-h-[52px] w-full max-w-[280px] rounded-2xl bg-gold text-lg font-extrabold text-ink shadow-lg shadow-black/40 active:bg-gold-deep"
        >
          Start
        </button>
      </div>
    </main>
  );
}
