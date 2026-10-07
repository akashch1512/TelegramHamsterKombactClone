import { useState } from 'react';
import { CATALOG_BY_ID, childrenOf } from '../../shared/catalog.ts';
import { incomePerHour, type CardLevels } from '../../shared/cards.ts';
import { OFFLINE_INCOME_CAP_MS } from '../../shared/economy.ts';
import { CardTile } from '../components/CardTile.tsx';
import { ScreenHeader } from '../components/ScreenHeader.tsx';
import { formatFull, formatSpan } from '../game/format.ts';

const LIST_LABEL = { region: 'Countries', country: 'Cities', city: '' } as const;

/** Cards and mining: regions → countries → cities (Plan.md B5, README:194-214). */
export function MineScreen({ balance, cards, onBuy }: { balance: number; cards: CardLevels; onBuy: (cardId: string) => void }) {
  const [path, setPath] = useState<string[]>([]);
  const parentId = path.length > 0 ? path[path.length - 1] : null;
  const parent = parentId ? CATALOG_BY_ID.get(parentId) ?? null : null;
  const back = path.length > 0 ? () => setPath((p) => p.slice(0, -1)) : undefined;

  return (
    <>
      <ScreenHeader title={parent ? parent.name : 'Mine'} balance={balance} onBack={back} />
      <div className="scroll min-h-0 flex-1 px-4 pb-4">
        <div className="rounded-2xl bg-panel/90 p-3 text-sm ring-1 ring-gold/20">
          <p>
            <span className="text-sand">Profit per hour </span>
            <span className="tabular font-bold text-gold">+{formatFull(incomePerHour(cards))}</span>
          </p>
          <p className="mt-1 text-xs text-sand">
            Cards earn coins every hour, including up to {formatSpan(OFFLINE_INCOME_CAP_MS)} while you are away.
          </p>
        </div>
        <h2 className="mb-2 mt-4 text-sm font-bold uppercase tracking-wide text-sand">
          {parent ? LIST_LABEL[parent.kind] : 'Regions'}
        </h2>
        <ul className="flex flex-col gap-2">
          {childrenOf(parentId).map((entry) => (
            <li key={entry.id}>
              <CardTile
                entry={entry}
                level={cards[entry.id] ?? 0}
                balance={balance}
                onBuy={() => onBuy(entry.id)}
                onOpen={() => setPath((p) => [...p, entry.id])}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
