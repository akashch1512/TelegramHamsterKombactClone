import { useEffect, useState } from 'react';

/**
 * The current time, refreshed every `intervalMs` while the page is visible.
 * Displayed values (energy, balance) are derived from it with the pure `settle`.
 */
export function useNow(intervalMs: number): number {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    let timer: number | null = null;
    const start = () => {
      if (timer !== null) return;
      setNow(Date.now());
      timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    };
    const stop = () => {
      if (timer !== null) window.clearInterval(timer);
      timer = null;
    };
    const onVisibility = () => (document.visibilityState === 'visible' ? start() : stop());
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [intervalMs]);
  return now;
}
