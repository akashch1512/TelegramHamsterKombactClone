// Thin wrapper around the Telegram Mini App SDK (telegram-web-app.js, loaded in index.html).
// Every call is feature-checked, so the game behaves the same in a plain browser.
// Server-side checks of initData arrive with Milestone C; nothing here is trusted.

type HapticStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type HapticNotice = 'error' | 'success' | 'warning';

interface TelegramWebApp {
  initData: string;
  version: string;
  platform: string;
  isVersionAtLeast(version: string): boolean;
  ready(): void;
  expand(): void;
  disableVerticalSwipes?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  setBottomBarColor?: (color: string) => void;
  openTelegramLink?: (url: string) => void;
  BackButton?: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void };
  HapticFeedback?: { impactOccurred(style: HapticStyle): void; notificationOccurred(type: HapticNotice): void };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

/** The SDK object when running inside a Telegram client, otherwise null. */
function webApp(): TelegramWebApp | null {
  const app = window.Telegram?.WebApp;
  if (!app) return null;
  // Outside Telegram the SDK still loads, but reports an unknown platform and no init data.
  return app.initData !== '' || app.platform !== 'unknown' ? app : null;
}

const at = (version: string) => {
  const app = webApp();
  return app !== null && app.isVersionAtLeast(version) ? app : null;
};

export const isTelegram = (): boolean => webApp() !== null;

/** Colour of the game surface, used for Telegram's header, background and bottom bar. */
export const SURFACE_COLOR = '#140b06';

export function initTelegram(): void {
  const app = webApp();
  if (!app) return;
  try {
    app.ready();
    app.expand();
    at('7.7')?.disableVerticalSwipes?.(); // keep swipe-down while tapping from closing the app
    at('6.9')?.setHeaderColor?.(SURFACE_COLOR); // hex colours need 6.9+
    at('6.1')?.setBackgroundColor?.(SURFACE_COLOR);
    at('7.10')?.setBottomBarColor?.(SURFACE_COLOR);
  } catch {
    // An old or partial client must never stop the game from starting.
  }
}

export function haptic(kind: 'tap' | 'error'): void {
  const feedback = at('6.1')?.HapticFeedback;
  if (feedback) {
    if (kind === 'tap') feedback.impactOccurred('light');
    else feedback.notificationOccurred('error');
    return;
  }
  // Android browsers; iOS Safari has no vibration API.
  try {
    navigator.vibrate?.(kind === 'tap' ? 8 : [20, 40, 20]);
  } catch {
    // ignored: vibration is best-effort
  }
}

/**
 * Shows Telegram's BackButton and returns a cleanup function. Returns null outside
 * Telegram, where the caller renders its own on-screen back arrow instead.
 */
export function bindBackButton(onBack: () => void): (() => void) | null {
  const button = at('6.1')?.BackButton;
  if (!button) return null;
  button.onClick(onBack);
  button.show();
  return () => {
    button.offClick(onBack);
    button.hide();
  };
}

/** Opens a t.me link inside Telegram when possible, otherwise in a new tab. */
export function openTelegramLink(url: string): void {
  const app = at('6.1');
  if (app?.openTelegramLink) app.openTelegramLink(url);
  else window.open(url, '_blank', 'noopener');
}
