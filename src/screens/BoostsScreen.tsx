import { energyLimitCost, maxEnergy } from '../../shared/boosts.ts';
import { ENERGY_LIMIT_MAX_LEVEL, ENERGY_LIMIT_STEP, REGEN_PER_SEC } from '../../shared/economy.ts';
import { ScreenHeader } from '../components/ScreenHeader.tsx';
import { formatCompact, formatFull } from '../game/format.ts';
import { highVoltage } from '../images';

/** Stamina boost: raise the energy limit with coins (Plan.md B4, README:172). */
export function BoostsScreen({ balance, energyLimitLevel, onBuy }: { balance: number; energyLimitLevel: number; onBuy: () => void }) {
  const cost = energyLimitCost(energyLimitLevel);
  const shortfall = cost === null ? 0 : Math.max(0, cost - balance);
  const now = maxEnergy(energyLimitLevel);

  return (
    <>
      <ScreenHeader title="Boosts" balance={balance} />
      <div className="scroll min-h-0 flex-1 px-4 pb-4">
        <section aria-labelledby="energy-limit" className="rounded-2xl bg-panel/90 p-4 ring-1 ring-gold/25">
          <div className="flex items-center gap-3">
            <img src={highVoltage} width={44} height={44} alt="" draggable={false} />
            <div className="min-w-0 flex-1">
              <h2 id="energy-limit" className="text-lg font-extrabold">Energy limit</h2>
              <p className="text-sm text-sand">
                Level {energyLimitLevel} of {ENERGY_LIMIT_MAX_LEVEL}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-sand">
            Each level adds {formatFull(ENERGY_LIMIT_STEP)} energy, so you can tap longer before recharging. Energy refills at{' '}
            {REGEN_PER_SEC} per second.
          </p>
          <p className="tabular mt-3 text-base font-bold">
            Max energy {formatFull(now)}
            {cost !== null && <span className="text-gold"> → {formatFull(maxEnergy(energyLimitLevel + 1))}</span>}
          </p>
          {cost === null ? (
            <p className="mt-4 rounded-xl bg-black/30 py-3 text-center font-bold text-gold">Max level reached</p>
          ) : (
            <>
              <button
                type="button"
                onClick={onBuy}
                disabled={shortfall > 0}
                className="mt-4 min-h-[48px] w-full rounded-2xl bg-gold font-extrabold text-ink active:bg-gold-deep disabled:bg-[#5a4a2a] disabled:text-sand"
              >
                Upgrade · <span className="tabular">{formatFull(cost)}</span>
              </button>
              {shortfall > 0 && (
                <p className="tabular mt-2 text-center text-sm text-sand">You need {formatCompact(shortfall)} more coins</p>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
