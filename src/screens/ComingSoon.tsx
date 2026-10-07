import { ScreenHeader } from '../components/ScreenHeader.tsx';
import { TELEGRAM_MINI_APP_URL } from '../config.ts';
import { isTelegram, openTelegramLink } from '../telegram.ts';

interface Props {
  title: string;
  icon: string;
  heading: string;
  body: string;
  balance: number;
}

/**
 * Honest placeholder for features that need the game server (Milestones C and D), so no
 * tab is a dead end. In a browser it also offers the Telegram Mini App (Plan.md §2.5).
 */
export function ComingSoon({ title, icon, heading, body, balance }: Props) {
  const telegram = isTelegram();
  return (
    <>
      <ScreenHeader title={title} balance={balance} />
      <div className="scroll flex min-h-0 flex-1 flex-col px-4 pb-4">
        <section className="m-auto flex w-full flex-col items-center rounded-3xl bg-panel/90 p-6 text-center ring-1 ring-gold/25">
          <img src={icon} width={72} height={72} alt="" draggable={false} />
          <p className="mt-3 rounded-full bg-black/40 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gold">Coming soon</p>
          <h2 className="mt-3 text-xl font-extrabold">{heading}</h2>
          <p className="mt-2 text-sm leading-relaxed text-sand">{body}</p>
          {!telegram && (
            <>
              <p className="mt-4 text-sm leading-relaxed text-sand">
                You are playing in guest mode. Progress here stays on this device. This feature will be available when you play
                in Telegram.
              </p>
              <button
                type="button"
                onClick={() => openTelegramLink(TELEGRAM_MINI_APP_URL)}
                className="mt-4 min-h-[48px] w-full rounded-2xl bg-gold px-4 font-extrabold text-ink active:bg-gold-deep"
              >
                Open in Telegram
              </button>
            </>
          )}
        </section>
      </div>
    </>
  );
}
