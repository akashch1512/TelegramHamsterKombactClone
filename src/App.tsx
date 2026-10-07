import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { maxEnergy } from '../shared/boosts.ts';
import { CATALOG_BY_ID } from '../shared/catalog.ts';
import { incomePerHour } from '../shared/cards.ts';
import { TAP_COST } from '../shared/economy.ts';
import { LABORS, levelFor } from '../shared/levels.ts';
import { msUntilFull, settle, type PurchaseResult } from '../shared/rules.ts';
import { Announcer, type Announcement } from './components/Announcer.tsx';
import { BottomNav, type Tab } from './components/BottomNav.tsx';
import { DebugPanel } from './components/DebugPanel.tsx';
import { GameShell } from './components/GameShell.tsx';
import { LevelUpDialog } from './components/LevelUpDialog.tsx';
import { OfflineIncomeDialog } from './components/OfflineIncomeDialog.tsx';
import { formatFull } from './game/format.ts';
import { LocalStore } from './game/localStore.ts';
import { loadSettings, saveSettings, type Settings } from './game/persistence.ts';
import type { ResumeReport } from './game/store.ts';
import { useNow } from './game/useNow.ts';
import { useTapSound } from './hooks/useTapSound.ts';
import { bear, coin } from './images';
import { BoostsScreen } from './screens/BoostsScreen.tsx';
import { ComingSoon } from './screens/ComingSoon.tsx';
import { IntroScreen } from './screens/IntroScreen.tsx';
import { MineScreen } from './screens/MineScreen.tsx';
import { StoryScreen } from './screens/StoryScreen.tsx';
import { TapScreen } from './screens/TapScreen.tsx';
import { haptic, initTelegram } from './telegram.ts';

/** Pop-ups wait on the Tap screen for this long without a tap, so they never interrupt a streak (Plan.md B2). */
const IDLE_BEFORE_POPUP_MS = 2_000;
/** Shorter absences aren't worth a "While you were away" dialog. */
const MIN_AWAY_FOR_DIALOG_MS = 60_000;

const PURCHASE_ERRORS: Record<string, string> = {
  insufficient: 'Not enough coins yet',
  'max-level': 'Already at the maximum level',
  locked: 'Unlock the card above it first',
  unavailable: 'Not available yet',
};

const showDebug = import.meta.env.DEV && new URLSearchParams(window.location.search).has('debug');

const App = () => {
  const [store] = useState(() => new LocalStore(Date.now()));
  const state = useSyncExternalStore(store.subscribe, store.getState);
  const tick = useNow(200);
  // Never settle the display at a time before the store's own last update.
  const viewAt = Math.max(tick, state.energyAt, state.incomeAt);
  const view = settle(state, viewAt);

  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [tab, setTab] = useState<Tab>('tap');
  const [storyOpen, setStoryOpen] = useState(false);
  const [away, setAway] = useState<ResumeReport | null>(null);
  const [message, setMessage] = useState<Announcement | null>(null);
  const coinRef = useRef<HTMLButtonElement>(null);
  const lastTapAt = useRef(Date.now()); // the idle window also starts at load
  const lastErrorAt = useRef(0);
  const emptyAnnounced = useRef(false);
  const sound = useTapSound(settings.muted);

  useEffect(() => initTelegram(), []);
  useEffect(() => store.start(), [store]);
  useEffect(() => saveSettings(settings), [settings]);

  const announce = useCallback((text: string, visible = false) => setMessage({ text, visible }), []);
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => setMessage(null), 2_500);
    return () => window.clearTimeout(t);
  }, [message]);

  // Income earned while closed or hidden.
  const resume = useCallback(() => {
    const report = store.resume(Date.now());
    if (report.credited > 0 && report.awayMs >= MIN_AWAY_FOR_DIALOG_MS) setAway(report);
  }, [store]);
  useEffect(() => {
    resume();
    const onVisible = () => {
      if (document.visibilityState === 'visible') resume();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [resume]);

  // Levels come from lifetime earnings; each completion dialog shows exactly once.
  const level = levelFor(view.earnedTotal);
  const prevLevel = useRef(level);
  useEffect(() => {
    if (level > prevLevel.current) announce(`Labor ${level} complete: ${LABORS[level - 1].title}`);
    prevLevel.current = level;
    // A reset save must not leave the celebrated level ahead of the real one.
    if (level < settings.celebratedLevel) setSettings((s) => ({ ...s, celebratedLevel: level }));
  }, [level, settings.celebratedLevel, announce]);
  const idle = tick - lastTapAt.current >= IDLE_BEFORE_POPUP_MS;
  const pendingLabor = level > settings.celebratedLevel ? settings.celebratedLevel + 1 : null;

  const handleTap = useCallback(() => {
    const t = Date.now();
    lastTapAt.current = t;
    const result = store.tap(t);
    if (result.accepted) {
      emptyAnnounced.current = false;
      sound.play();
      haptic('tap');
    } else {
      if (t - lastErrorAt.current > 600) {
        lastErrorAt.current = t;
        haptic('error');
      }
      if (!emptyAnnounced.current) {
        emptyAnnounced.current = true;
        announce('Out of energy. It refills over time.');
      }
    }
    return result;
  }, [store, sound, announce]);

  const reportPurchase = (result: PurchaseResult, success: string) => {
    if (result.ok) announce(success, true);
    else announce(PURCHASE_ERRORS[result.reason], true);
  };

  const buyBoost = () => {
    const result = store.buyBoost(Date.now());
    reportPurchase(result, `Energy limit raised to ${formatFull(maxEnergy(result.state.energyLimitLevel))}`);
  };

  const buyCard = (cardId: string) => {
    const result = store.buyCard(cardId, Date.now());
    const entry = CATALOG_BY_ID.get(cardId);
    const level = result.state.cards[cardId] ?? 0;
    const success = entry?.kind === 'city' && level > 1 ? `${entry.name} upgraded to level ${level}` : `${entry?.name ?? 'Card'} unlocked`;
    reportPurchase(result, success);
  };

  const selectTab = (next: Tab) => {
    setTab(next);
    setStoryOpen(false);
  };

  const focusCoin = useRef(false);
  const start = () => {
    sound.unlock();
    focusCoin.current = true;
    setSettings((s) => ({ ...s, introSeen: true }));
  };
  // Hand focus from Start to the coin once the intro is gone.
  useEffect(() => {
    if (settings.introSeen && focusCoin.current) coinRef.current?.focus({ preventScroll: true });
    focusCoin.current = false;
  }, [settings.introSeen]);

  if (!settings.introSeen) {
    return (
      <GameShell dim>
        <IntroScreen onStart={start} />
      </GameShell>
    );
  }

  const max = maxEnergy(view.energyLimitLevel);
  const empty = view.energy < TAP_COST;

  let screen;
  if (tab === 'tap' && storyOpen) {
    screen = <StoryScreen earnedTotal={view.earnedTotal} balance={view.balance} onBack={() => setStoryOpen(false)} />;
  } else if (tab === 'tap') {
    screen = (
      <TapScreen
        balance={view.balance}
        earnedTotal={view.earnedTotal}
        profitPerHour={incomePerHour(view.cards)}
        energy={view.energy}
        maxEnergy={max}
        msToFull={msUntilFull(view, viewAt)}
        empty={empty}
        muted={settings.muted}
        coinRef={coinRef}
        onTap={handleTap}
        onGesture={sound.unlock}
        onToggleMute={() => setSettings((s) => ({ ...s, muted: !s.muted }))}
        onOpenStory={() => setStoryOpen(true)}
        onBoost={() => selectTab('boosts')}
      />
    );
  } else if (tab === 'mine') {
    screen = <MineScreen balance={view.balance} cards={view.cards} onBuy={buyCard} />;
  } else if (tab === 'boosts') {
    screen = <BoostsScreen balance={view.balance} energyLimitLevel={view.energyLimitLevel} onBuy={buyBoost} />;
  } else if (tab === 'frens') {
    screen = (
      <ComingSoon
        title="Frens"
        icon={bear}
        heading="Invite friends, earn coins"
        body="Share your invite link and earn coins when friends join and play. Invites need player accounts, which arrive with the game server."
        balance={view.balance}
      />
    );
  } else {
    screen = (
      <ComingSoon
        title="Earn"
        icon={coin}
        heading="Follow us, earn coins"
        body="Join the Falcon Tap channels and social accounts for one-time coin rewards. Tasks arrive with the game server."
        balance={view.balance}
      />
    );
  }

  return (
    <GameShell dim={tab !== 'tap' || storyOpen}>
      <main className="flex min-h-0 flex-1 flex-col">{screen}</main>
      <BottomNav active={tab} onSelect={selectTab} />
      <Announcer message={message} />
      {showDebug && <DebugPanel store={store} onResume={resume} />}
      {away && <OfflineIncomeDialog credited={away.credited} awayMs={away.awayMs} onClose={() => setAway(null)} />}
      {!away && pendingLabor !== null && idle && tab === 'tap' && !storyOpen && (
        <LevelUpDialog
          key={pendingLabor}
          labor={pendingLabor}
          onClose={() => setSettings((s) => ({ ...s, celebratedLevel: pendingLabor }))}
          onReadStory={() => {
            setSettings((s) => ({ ...s, celebratedLevel: pendingLabor }));
            selectTab('tap');
            setStoryOpen(true);
          }}
        />
      )}
    </GameShell>
  );
};

export default App;
