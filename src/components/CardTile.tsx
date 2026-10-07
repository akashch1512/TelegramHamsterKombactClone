import type { CatalogEntry } from '../../shared/catalog.ts';
import { childrenOf, isPriced } from '../../shared/catalog.ts';
import { cardPrice, cardProfitAt, maxLevelOf } from '../../shared/cards.ts';
import { formatCompact, formatFull } from '../game/format.ts';
import Arrow from '../icons/Arrow.tsx';

interface Props {
  entry: CatalogEntry;
  level: number;
  balance: number;
  onBuy: () => void;
  onOpen: () => void;
}

const row = 'flex w-full items-center gap-3 rounded-2xl bg-panel/90 px-4 py-3 text-left ring-1';

/** One card in the Mine screen: region, country or city (Plan.md B5). */
export function CardTile({ entry, level, balance, onBuy, onOpen }: Props) {
  if (!isPriced(entry)) {
    return (
      <div className={`${row} ring-white/10`}>
        <p className="min-w-0 flex-1 truncate font-bold text-sand">{entry.name}</p>
        <span className="shrink-0 rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-sand">Coming soon</span>
      </div>
    );
  }

  const isCity = entry.kind === 'city';
  if (!isCity && level >= 1) {
    const priced = childrenOf(entry.id).filter(isPriced).length;
    return (
      <button type="button" onClick={onOpen} className={`${row} min-h-[56px] ring-gold/30 active:bg-panel`}>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold">{entry.name}</span>
          <span className="block text-xs text-sand">
            Owned · {priced} of {childrenOf(entry.id).length} available
          </span>
        </span>
        <span className="shrink-0 text-sm font-bold text-gold">Open</span>
        <Arrow size={16} className="shrink-0 text-gold" />
      </button>
    );
  }

  const price = cardPrice(entry, level);
  const shortfall = price === null ? 0 : Math.max(0, price - balance);
  const profit = cardProfitAt(entry, level);
  const gain = isCity ? cardProfitAt(entry, level + 1) - profit : 0;
  const action = level === 0 ? 'Buy' : 'Upgrade';

  return (
    <div className={`${row} ring-gold/20`}>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{entry.name}</p>
        {isCity ? (
          <p className="text-xs text-sand">
            {level > 0 ? `Level ${level} of ${maxLevelOf(entry)} · +${formatFull(profit)}/h` : `Earns +${formatFull(gain)}/h`}
            {level > 0 && price !== null && <span className="block text-gold">Next level: +{formatFull(gain)}/h</span>}
          </p>
        ) : (
          <p className="text-xs text-sand">Unlocks {childrenOf(entry.id).map((c) => c.name).join(', ')}</p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {price === null ? (
          <span className="rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-sand">Max level</span>
        ) : (
          <>
            <button
              type="button"
              onClick={onBuy}
              disabled={shortfall > 0}
              aria-label={`${action} ${entry.name} for ${formatFull(price)} coins`}
              className="min-h-[44px] rounded-xl bg-gold px-3 text-sm font-extrabold text-ink active:bg-gold-deep disabled:bg-[#5a4a2a] disabled:text-sand"
            >
              {action} · <span className="tabular">{formatCompact(price)}</span>
            </button>
            {shortfall > 0 && <span className="tabular text-[11px] text-sand">Need {formatCompact(shortfall)} more</span>}
          </>
        )}
      </div>
    </div>
  );
}
