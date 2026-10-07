import { useEffect, useRef } from 'react';
import { bindBackButton, isTelegram } from '../telegram.ts';

/**
 * Sub-views use Telegram's BackButton inside Telegram and an on-screen arrow in a
 * browser (Plan.md §2.3). Returns true when the on-screen arrow should be drawn.
 */
export function useBackButton(onBack: (() => void) | undefined): boolean {
  const latest = useRef(onBack);
  latest.current = onBack;
  const active = onBack !== undefined;
  useEffect(() => {
    if (!active) return;
    return bindBackButton(() => latest.current?.()) ?? undefined;
  }, [active]);
  return active && !isTelegram();
}
