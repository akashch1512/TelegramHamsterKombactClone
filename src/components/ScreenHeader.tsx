import { formatFull } from '../game/format.ts';
import Arrow from '../icons/Arrow.tsx';
import { coin } from '../images';
import { useBackButton } from '../hooks/useBackButton.ts';

interface Props {
  title: string;
  balance: number;
  onBack?: () => void;
}

export function ScreenHeader({ title, balance, onBack }: Props) {
  const showArrow = useBackButton(onBack);
  return (
    <header className="flex shrink-0 items-center gap-2 px-4 pb-2 pt-3">
      {showArrow && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gold active:bg-white/10"
        >
          <Arrow size={20} className="rotate-180" />
        </button>
      )}
      <h1 className="min-w-0 flex-1 truncate text-xl font-extrabold text-shadow">{title}</h1>
      <p className="flex shrink-0 items-center gap-1.5 rounded-full bg-panel/90 px-3 py-1.5 ring-1 ring-gold/25">
        <img src={coin} width={18} height={18} alt="" draggable={false} />
        <span className="tabular text-sm font-bold">{formatFull(balance)}</span>
        <span className="sr-only">coins</span>
      </p>
    </header>
  );
}
