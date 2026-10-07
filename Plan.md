# Falcon Tap: Implementation Plan

This plan covers two things:

- **The existing game:** fixing the defects found in the code and making it a polished, mobile-first tap game that also looks right on a laptop.
- **[README.md](README.md):** building every requirement the README lists. These are the Telegram bot, the 7 Shahnameh levels, stamina boosts, cards and mining, friend invites, social tasks, educational pop-ups, the 31-day schedule and token rewards.

**Labels used in this plan**

| Label | Meaning |
|---|---|
| **Essential** | Needed for a reliable game, or explicitly required by the README |
| **Optional** | Improves the game but isn't required |
| **[Dn]** | Needs an owner decision (see §7). Each step states the default it assumes |
| **[Asset]** | Needs art or written content that isn't in the repo |

**How to verify:** use real phones and DevTools device mode, plus `npm run build` and `npm run lint`. The phones to cover are iOS Safari, Android Chrome, and Telegram on iOS, Android and Desktop. Adding a test runner for the pure game rules and the server is recommended ([D17]).

---

## 1. Current state

### 1.1 How the game works today

- **Entry:** [index.html](index.html) → [src/main.tsx](src/main.tsx) → [src/App.tsx](src/App.tsx). One component holds all state. [src/App.css](src/App.css) is never imported.
- **Dev start page:** [vite.config.ts:7-9](vite.config.ts#L7-L9) opens the static page `public/persian_theme.html` when the dev server starts. Its Start link goes to `/`. A production build serves the game directly at `/`.
- **State:** `points=0`, `energy=2652`, `clicks[]` (the floating numbers) and `notcoinPressed`.
- **Rules:** +2 points and −12 energy per tap ([App.tsx:11-12](src/App.tsx#L11-L12)).
- **Input:** the coin wrapper has both `onClick` and `onTouchStart` ([App.tsx:161](src/App.tsx#L161)). Touch input branches on `e.touches.length` (1, 2 or 3 fingers).
- **Regeneration:** `setInterval` adds +1 energy every 100 ms, capped at `level_points = 1,000,000` ([App.tsx:100-106](src/App.tsx#L100-L106)).
- **UI:** the score is under the coin; it was above the coin until commit `8fdfb74`. A fixed bottom bar holds the energy count "/ 6500", the Frens/Earn/Boosts buttons (no handlers) and the energy bar.
- **Not present:** a backend, the Telegram SDK, any storage, levels, cards, referrals, tasks or Web3. A search for `localStorage|sessionStorage|indexedDB|Telegram|WebApp|fetch(|vibrate|visibilitychange|safe-area|dvh|viewport-fit` finds nothing in the source files.

### 1.2 Gameplay bugs

| # | Bug | Evidence | Effect |
|---|---|---|---|
| B1 | Phone taps count twice. *Inferred; confirm on a device.* | React 18 registers `touchstart` as passive, so `e.preventDefault()` does nothing ([App.tsx:49](src/App.tsx#L49)). The browser still fires a click, which runs `handleMouseClick` | +4 points, −24 energy, two floats and two sounds per phone tap. A mouse gets +2/−12 |
| B2 | Out-of-energy taps remove points | The "Deduct 2 points" line ([App.tsx:51-53](src/App.tsx#L51-L53)) is normally overwritten by the stale `setPoints` at [App.tsx:20](src/App.tsx#L20). Below 12 energy, `handleClick` exits early, so the deduction stands. A 4th finger hits `default` and only deducts | Each touch costs 2 points when energy is empty |
| B3 | Stale closures | `handleClick` reads render-time `points`, `energy` and `clicks` ([App.tsx:20-22](src/App.tsx#L20-L22)). `e.touches` includes fingers already held down. IDs come from `Date.now()` | The 2/3-finger "bonus" collapses into one update and one float. Adding a finger re-scores the held ones. React keys can be duplicated |
| B4 | Energy cap mismatch | The regen cap is 1,000,000, but the UI shows "/ 6500" and the bar width is `energy/6500` ([App.tsx:132](src/App.tsx#L132), [App.tsx:156](src/App.tsx#L156)) | After about 6.4 minutes idle, energy passes 6500 and the bar overflows |
| B5 | Wrong or missing feedback | The float always shows the constant `2` ([App.tsx:174](src/App.tsx#L174)). The press class stays on for 200 ms ([App.tsx:23-32](src/App.tsx#L23-L32)). Nothing happens on empty energy | Wrong numbers, a press animation that doesn't restart, and a silent fail when empty |
| B6 | Sound | A `new Audio()` per tap, with the `play()` promise rejection unhandled ([App.tsx:26-27](src/App.tsx#L26-L27)) | Lag and console errors, and no mute |
| B7 | No persistence | No storage, and regen runs on `setInterval` | A refresh resets to 0 points. Regen stalls in a background tab |

### 1.3 Layout, touch and accessibility

- **L1 Page overflow.** `.bg-gradient-main` sets `margin:12px` + `width:100vw` + `height:100vh` ([index.css:35-42](src/index.css#L35-L42)). The page scrolls by about 24 px and shows a white strip at the top and left.
- **L2 Mobile viewport.**
  - It uses `100vh`, and there's no `viewport-fit=cover` or safe-area padding ([index.html:6](index.html#L6)).
  - The `fixed` bottom bar reserves no space, so it likely overlaps the score on short screens.
  - The energy block plus the nav needs about 416 px, so it likely overflows at 320 px wide.
- **L3 No touch hygiene.** Expect double-tap zoom, the iOS long-press "Save image" callout, text selection and image dragging.
- **L4 Laptop.** The bars span the whole browser width ([App.tsx:125](src/App.tsx#L125)), with a 160 px coin in the middle. The coin is stretched about 6% (160×180 against a native 484×515).
- **L5 Contrast.**
  - White text sits on a white body until the 2.7 MB background loads.
  - Nav labels are white on `#fad258`, about 1.5:1.
  - The scrims are commented out ([index.css:45-54](src/index.css#L45-L54)).
- **L6 Accessibility.** The tap target is a non-focusable `div`, and the nav buttons do nothing.
- **L7 Dead code.**
  - `z-1` and `text-large` aren't Tailwind classes.
  - There are empty overlay divs ([App.tsx:111-114](src/App.tsx#L111-L114)) and an empty fixed header ([App.tsx:118-123](src/App.tsx#L118-L123)).
  - These are unused: `App.css`, `Arrow.tsx`, `react.svg`, `trophy.png` and `Genie`. `Genie` (`sample_genie_lamp.png`) is actually a "WISE esports CS:GO" logo.

### 1.4 Welcome page and deployment

- **Broken image in production.** [persian_theme.html:51](public/persian_theme.html#L51) loads `../src/images/Advanced_Two_Person_image.png`. That works only in dev, because production doesn't serve `src/`.
- **Copyrighted art.** The image is Disney's Aladdin/Jasmine artwork.
- **Other page bugs.** The `<a><button>` nesting is invalid, and the `url('./public/Images/')` at line 36 is broken.
- **`src/_redirects` is never deployed,** because only `public/` is copied into the build. If it were moved there as written, `/` would serve the welcome page and Start (`href="/"`) would loop back to it.

### 1.5 README requirements against the code

| README requirement | Where | In code today |
|---|---|---|
| Tap to earn coins | [README.md:13](README.md#L13), [171](README.md#L171) | Partly. Has the bugs B1–B7 |
| Stamina limit, boostable with coins | [172](README.md#L172) | Energy exists. The boost doesn't; the Boosts button is dead |
| Invite friends to earn coins | [173](README.md#L173) | Missing; the Frens button is dead |
| Follow social media to earn coins | [174](README.md#L174) | Missing; the Earn button is dead |
| 7 levels (the seven labors), coin thresholds 1M → 1,300M | [48-80](README.md#L48-L80), [176-183](README.md#L176-L183) | Missing. `level_points=1,000,000` is misused as the energy cap |
| Per-level schedule totalling 31 days | [168](README.md#L168), [185-192](README.md#L185-L192) | Missing |
| Cards: regions → countries → cities, upgrades to level 21, hourly profit | [194-214](README.md#L194-L214) | Missing |
| Character progression (young → wise warrior); L1 with a lion, L7 against the White Demon | [216-219](README.md#L216-L219) | Missing. **[Asset]** none in the repo |
| 7 level backgrounds | [92-93](README.md#L92-L93) | 1 background exists. **[Asset]** "ask Akash" |
| Educational pop-ups about the Shahnameh | [225](README.md#L225) | Missing |
| Clean, minimal, portrait UI; boost/invite/social buttons at the bottom | [221-224](README.md#L221-L224) | Partly. The buttons exist and do nothing |
| Telegram bot: `/start`, `/tap`, `/score` | [10](README.md#L10), [26-29](README.md#L26-L29) | Missing. No bot code or SDK |
| Web3: ERC-20 on Ethereum via Web3.js; rewards per tap | [11](README.md#L11), [14](README.md#L14), [19-20](README.md#L19-L20), [33-34](README.md#L33-L34) | Missing. See problems P3–P5 |
| Node.js backend; Node v18.20.3 / npm v10.8.1 | [229-230](README.md#L229-L230) | No backend. The local machine has Node 24 |
| Run guide in `run_pro.txt` | [38](README.md#L38) | The file doesn't exist |

### 1.6 Problems in the README requirements

- **P1: Leaked secret.** [README.md:23](README.md#L23) contains the Telegram bot token, and it's in git history. Revoke it with @BotFather; deleting the line isn't enough.
- **P2: The economy can't reach its own targets.** The current rules cap sustained tapping at 10 energy/s ÷ 12 per tap × 2 = **1.67 coins/s, or 144,000/day** even with non-stop tapping. The README's example city card (Tehran: 1,000/h, +10% per level, max level 21) peaks at about **6,727/h** if the +10% compounds, or 3,000/h if it doesn't. The README's targets need far more:

  | Level (labor) | Coins | Days | By day | Coins/day if thresholds are lifetime totals | Coins/day if each level needs its own amount |
  |---|---|---|---|---|---|
  | 1 Lion | 1M | 1 | 1 | 1.0M | 1.0M |
  | 2 Desert | 10M | 2 | 3 | 4.5M | 5.0M |
  | 3 Dragon | 200M | 6 | 9 | 31.7M | 33.3M |
  | 4 Sorceress | 300M | 6 | 15 | 16.7M | 50.0M |
  | 5 Demon | 500M | 6 | 21 | 33.3M | 83.3M |
  | 6 Simurgh | 800M | 5 | 26 | 60.0M | 160.0M |
  | 7 Rescue | 1,300M | 5 | 31 | 100.0M | 260.0M |

  - Level 1 alone needs about 7× the theoretical tapping maximum.
  - Level 7 needs about 4.2M coins/hour of passive income.
  - The jump from 10M to 200M makes the pacing uneven; confirm Level 3.
  - The card catalog, boosts and tap value must be designed together and checked with a simulation (step B0, [D1]).
- **P3: Telegram's platform rules conflict with "ERC-20 on Ethereum".** Telegram's [Blockchain Guidelines for Mini Apps](https://core.telegram.org/bots/blockchain-guidelines) require that Mini Apps use **only TON** to create and distribute tokens, and connect wallets **only through TON Connect**. Issuing tokens on other chains isn't permitted. This blocks Milestone E until [D12] is decided.
- **P4: web3.js has been retired.** ChainSafe [archived web3.js in March 2025](https://blog.chainsafe.io/web3-js-sunset/) and points developers to ethers.js or viem.
- **P5: "A token every time a player taps" can't work on-chain.** Per-tap transactions cost fees and take seconds. Coins have to stay off-chain and convert to tokens in a periodic or end-of-season claim ([D13]).
- **P6: Story content needs review.**
  - The README says players help **Sohrab** through the trials, but the Haft Khan are **Rostam's** labors.
  - Labors 5–6 differ from the commonly cited sequence (5: capture of Olad, 6: Arzhang Div). The Simurgh belongs to the Esfandiyar episode.
  - Educational pop-ups should be checked by someone who knows the Shahnameh ([D14]).
- **P7: Missing inputs.**
  - The README doesn't give:
    - the full card catalog (only Asia, Iran and Tehran are given)
    - the upgrade cost curve
    - referral and task reward amounts
    - social media URLs
    - the token conversion rate
  - Not in the repo:
    - the 7 backgrounds
    - character art
    - `run_pro.txt`
- **P8: Node 18 is end-of-life** (April 2025). Use a current LTS release ([D16]).

---

## 2. Target experience

### 2.1 On a phone (Tap screen)

```
+--------------------------------------+
| Labor 1: The Lion      [####---] 34% |  level badge + progress to the next level
| +1.2K/h              [wallet] [mute] |  passive income, wallet (Milestone E), sound
|            (coin) 124,480            |  balance, above the coin, not under the hand
|                                      |
|              ( FALCON )              |  coin: ~70% width, shrinks with height
|                                      |
| Energy 2,652/6,500 Full 6:25 [Boost] |  energy row + stamina boost shortcut
| ##########-------------------------- |  energy bar, clamped
| [Tap] [Mine] [Frens] [Earn] [Boosts] |  bottom nav (README: boost/invite/social)
+--------------------------------------+  padded by the safe-area inset
```

- **Taps.** Each finger counts as one tap. Each tap gives a press animation, a float showing the real amount, sound (if on) and a light haptic.
- **Empty energy.** The coin dims and wiggles, the row shows "full in m:ss", and the balance never goes down.
- **Long numbers.** Balances up to 1.3B fit at 280 px wide. Costs and profit use compact notation (1.2K, 3.4M).
- **Reload or reopen.** State is restored. Energy and passive income include the time away, with the offline cap from [D1].

### 2.2 On a laptop

- **Same game.** The same screens appear inside a phone-like surface.
- **Size:** height `min(100dvh − 48px, 900px)`, width `clamp(360px, height × 0.5, 430px)`, centered, with about 32 px rounded corners and a shadow.
- **Outside the surface:** the Shahnameh background, blurred and darkened, with nothing interactive.
- **Input:** a click is one tap. Space or Enter on the focused coin is one tap, with no key repeat.
- **Breakpoints:**
  - Below 600 px wide (this includes the Telegram Desktop Mini App window), the surface is full-bleed.
  - At 600 px or wider, it becomes a centered column, framed when the height is at least 640 px.

### 2.3 Screens (all inside the surface)

| Screen | Purpose | Source |
|---|---|---|
| Intro (first run) | Title, Rostam/Sohrab art and Start. Replaces `persian_theme.html` | Existing welcome page |
| Tap | Core loop, level badge, profit/h, energy and boost shortcut | Existing + README |
| Mine | Cards: regions → countries → cities; buy and upgrade; profit/h | README:194-214 |
| Frens | Invite link, share, invited friends, rewards | README:173 |
| Earn | Social and channel tasks with one-time rewards | README:174 |
| Boosts | Stamina (energy limit) upgrade; optional extras [D18] | README:172 |
| Story | The 7 labors: unlocked chapters, educational cards | README:48-80, 225 |
| Level-up dialog | The labor is complete; story card; next labor | README:176-183 |
| "While you were away" | Passive income earned offline | Follows from the cards |
| Wallet / Airdrop | Connect a TON wallet, see the allocation, claim | README:11, 19-20 (as adjusted by P3) |

Sub-views use Telegram's BackButton inside Telegram and an on-screen back arrow in a browser. Sub-views include country and city drill-down, Story and Wallet. The unused [Arrow.tsx](src/icons/Arrow.tsx) can serve as that arrow.

### 2.4 Progression loop

1. Tap to earn coins.
2. Spend coins on boosts and cards.
3. Cards produce passive income.
4. Lifetime earnings unlock the 7 labors on roughly the README schedule.
5. Each labor unlocks a story chapter, a new background and new character art.
6. After 31 days the season ends and off-chain coins convert into a token allocation ([D13], [D15]).

### 2.5 Outside Telegram (guest mode, [D7])

- **What works:** the full core loop, levels, boosts and cards, saved in `localStorage`. This covers local development and anyone opening the Netlify URL directly.
- **What doesn't:** Frens, Earn and Wallet show "Open in Telegram to …" with a link to the Mini App.
- **No migration:** guest progress is never moved into a Telegram account, because it's trivially editable.

### 2.6 Telegram bot

| Command | What it does |
|---|---|
| `/start [ref_<id>]` | Registers the player (recording the inviter, if any) and replies with a **Play** button that opens the Mini App |
| `/score` | Balance, labor, profit/h, and the token allocation once Milestone E exists |
| `/tap` | One server-side tap under the same energy rules; replies with the result. Rate-limited |

---

## 3. Architecture

### 3.1 Repository layout

```
/                    existing Vite + React app (stays at the root to avoid churn)
  src/               frontend: components/, screens/, game/, content/, telegram.ts
  shared/            pure TypeScript game rules + economy data, used by both the client and the server
  server/            Node.js service: HTTP API + Telegram bot webhook (own package.json)
  contracts/         TON jetton contract + deploy scripts (Milestone E only)
  docs/economy.md    economy tables and simulation results (B0)
```

- `tsconfig.json` adds `"shared"` to `include`.
- The server's tsconfig includes `../shared` and builds with `tsc`, which is already a devDependency.

### 3.2 Shared rules (one source of truth)

- `shared/` holds only pure functions and data. No React, DOM or Node APIs.
- Functions include `settle(state, now)`, `tryTap(state, now)`, `buyBoost(...)`, `buyCard(...)`, `levelFor(earnedTotal)`, `incomePerHour(cards)` and `offlineIncome(state, now)`.
- **Integer math only.**
- **All tunable numbers live in `shared/economy.ts`.**
- The client runs these functions for instant feedback. The server runs the same functions as the authority.

### 3.3 Two state modes behind one interface

- **`GameStore` interface:** `getState`, `tap`, `buyBoost`, `buyCard`, `claimTask`, `subscribe`.
- **`LocalStore`:** used for guest mode and built first (Milestone A/B).
- **`RemoteStore`:** used inside Telegram (Milestone C).
  - **Taps:** applied optimistically, then sent in batches every ~2 s, every ~25 taps, or when the page hides.
  - **Purchases:** confirmed by the server before the UI shows them.
  - **Replies:** the server returns the full authoritative `PlayerState`. The client replaces its state with it, then re-applies taps not yet sent.

### 3.4 Server API (sketch)

| Endpoint | Purpose |
|---|---|
| `GET /api/state` | Authoritative player state, with energy and income settled on server time |
| `POST /api/taps` `{count, seq}` | Credits `min(count, affordable taps)`. `seq` makes retries idempotent |
| `POST /api/boosts/:id/buy` | Validated against the balance in a DB transaction |
| `POST /api/cards/:id/buy` | Buy or upgrade; checks unlock rules, balance and max level 21 |
| `GET /api/frens` | Invited friends and rewards |
| `GET /api/tasks`, `POST /api/tasks/:id/claim` | Task list and one-time claims |
| `POST /api/wallet` | Links a TON wallet using a TON Connect `ton_proof` (Milestone E) |
| `POST /telegram/webhook` | Bot updates. Checks the `X-Telegram-Bot-Api-Secret-Token` header |

Every `/api` request carries `Telegram.WebApp.initData`. The server validates it with Telegram's documented HMAC-SHA256 scheme and uses `user.id` as the player ID.

### 3.5 Data model (PostgreSQL; coins are `bigint`)

| Table | Columns |
|---|---|
| `players` | `id` (Telegram user ID, PK), `username`, `first_name`, `created_at`, `referrer_id`, `balance`, `earned_total`, `energy`, `energy_at`, `energy_limit_level`, `last_income_at`, `wallet_address`, `tap_seq` |
| `player_cards` | (`player_id`, `card_id`) PK, `level` |
| `referrals` | `inviter_id`, `invitee_id` (unique), `rewarded_at` |
| `task_claims` | (`player_id`, `task_id`) unique, `claimed_at` |
| `token_allocations` | `player_id`, `season_id`, `amount`, `status`, `tx_hash` (Milestone E) |

The level is derived from `earned_total`, which is lifetime coins earned. Spending never lowers a level ([D1]).

### 3.6 Secrets and config

- **Server environment only:** `BOT_TOKEN`, `WEBHOOK_SECRET`, `DATABASE_URL`, `ALLOWED_ORIGIN` and the TON keys.
- **Never prefix a secret with `VITE_`.** Vite puts those variables into the client bundle.
- **Commit a `server/.env.example`,** never a real `.env`.

---

## 4. Milestones at a glance

| Milestone | What it delivers | Priority | Depends on |
|---|---|---|---|
| **A. Core game** | Bug-free tap and energy loop, local save, mobile shell, laptop frame, 5-tab navigation, intro, Telegram Mini App integration | Essential, first | Nothing |
| **B. Progression** | Economy model, 7 levels, story and educational pop-ups, level art, stamina boost, cards and passive income | Essential (README) | A; [D1] for B1–B5 |
| **C. Backend and bot** | Node service, Telegram auth, server-authoritative state, `/start` `/tap` `/score` | Essential (README) | A; B's shared rules |
| **D. Social** | Frens (referrals), Earn (social tasks) | Essential (README) | C; [D10], [D11] |
| **E. Token rewards** | TON jetton, TON Connect wallet, season-end allocation and claim | Essential (README); **blocked** | C; [D12], [D13]; legal review |
| **F. Season and launch** | 31-day season, device QA, docs, naming and IP cleanup | Essential | B–E |

The order follows the README's own "Next Steps" ([README.md:232-238](README.md#L232-L238)): tapping, stamina, friends and social, cards, UI, education. Two things move earlier: the UI shell, because every screen depends on it, and the economy model, because levels, boosts and cards all depend on its numbers.

---

## 5. Implementation steps

### Milestone A: Core game (client)

**A0 · Secure the bot and record a baseline** (Essential)
- **Outcome:**
  - Revoke the bot token with @BotFather and remove it from [README.md:23](README.md#L23). The new token will live only in the server environment (C1).
  - Run `npm ci`, `npm run dev`, `npm run build` and `npm run lint`.
  - Reproduce B1–B4 on a real phone.
- **Files:** `README.md`.
- **Verify:**
  - The Bot API `getMe` call with the old token returns 401.
  - Baseline results are written down. Lint is expected to fail on `no-case-declarations` at [App.tsx:61-88](src/App.tsx#L61-L88).

**A1 · Shared rules module** (Essential)
- **Outcome:**
  - Constants in `shared/economy.ts`: `TAP_POINTS=2`, `TAP_COST=12`, `MAX_ENERGY=6500`, `REGEN_PER_SEC=10`. These are the current values; B0 retunes them.
  - Pure functions in `shared/rules.ts`: `settle`, `tryTap → {state, accepted}` and `msUntilFull`.
  - Energy is time-based: store `{energy, energyAt}` and compute the current value, capped at the max.
- **Files:** `shared/economy.ts`, `shared/rules.ts`, `tsconfig.json`.
- **Depends on:** A0.
- **Verify:** after idling at full, energy reads exactly 6500. Empty to full takes 650 s.

**A2 · Game store and hook** (Essential)
- **Outcome:**
  - The `GameStore` interface plus `LocalStore`, and `useGame` built on `useReducer`.
  - Handlers never read values captured at render time.
  - Floats live in state, with IDs from a counter and a cap of about 30.
  - Sound, haptics and storage stay out of the reducer, because StrictMode runs reducers twice in dev.
- **Files:** `src/game/store.ts`, `src/game/localStore.ts`, `src/game/useGame.ts`, [App.tsx](src/App.tsx).
- **Depends on:** A1.
- **Verify:** no duplicate-key warnings during rapid taps.

**A3 · Pointer input on a real button** (Essential)
- **Outcome:**
  - The coin becomes a `<button>`. `onPointerDown` fires once per finger, and mouse buttons other than the left are ignored.
  - `onKeyDown` handles Space/Enter with `!e.repeat`. There's no `onClick`.
  - The coin gets `touch-action:none`.
  - Remove the `onTouchStart` switch and the points deduction.
- **Files:** `src/components/TapCoin.tsx`.
- **Depends on:** A2.
- **Verify:**
  - One phone tap gives exactly +2/−12.
  - Two fingers landing together give +4/−24 and two floats.
  - A finger that's already down never scores again.

**A4 · Feedback and the empty state** (Essential)
- **Outcome:**
  - The press animation restarts on every tap (Web Animations API), and floats show the real amount.
  - Below the tap cost, the coin is `aria-disabled` and wiggles, and the row shows "full in m:ss".
  - Numbers are formatted, the score uses tabular figures, and the bar is clamped to 0–100%.
- **Files:** `TapCoin.tsx`, `src/components/EnergyMeter.tsx`, [index.css](src/index.css).
- **Depends on:** A2.
- **Verify:** at 11 energy, taps change no numbers and show the empty state.

**A5 · Local save (guest mode)** (Essential)
- **Outcome:**
  - Save `{v, points, energy, energyAt}` under `falcon-tap:v1`. Include a schema version and migrations, because B adds fields.
  - Validate on load and clamp values. Treat timestamps in the future as "now".
  - Wrap storage access in try/catch.
  - Save about once a second while playing, and on `visibilitychange` (hidden) and `pagehide`.
  - New players start at full energy ([D2]).
- **Files:** `src/game/localStore.ts`.
- **Depends on:** A2.
- **Verify:**
  - Reload: the score is identical.
  - Close for 30 s: energy is +300 on return.
  - A corrupt key loads defaults without crashing.

**A6 · Document and viewport** (Essential)
- **Outcome:**
  - Add `viewport-fit=cover` and `theme-color`. Don't disable zoom globally.
  - `html`, `body` and `#root` get `height:100%`, `overflow:hidden`, `overscroll-behavior:none`, and a dark background so the first paint isn't white.
  - Remove the `.bg-gradient-main` sizing.
- **Files:** [index.html](index.html), [index.css](src/index.css).
- **Depends on:** nothing.
- **Verify:** no scrollbars, no white strip and no pull-to-refresh.

**A7 · Game surface: phone and laptop** (Essential)
- **Outcome:** a `GameShell` that implements §2.2: full-bleed, centered column, or framed. It clips overlays and sits on the blurred, darkened backdrop.
- **Files:** `src/components/GameShell.tsx`, `index.css`.
- **Depends on:** A6.
- **Verify:**
  - Phones: 280×653, 320×568, 375×667, 390×844 and 430×932.
  - Laptops: 1366×768 and 1920×1080, plus window resizing.
  - Telegram Desktop.

**A8 · Layout and 5-tab navigation** (Essential)
- **Outcome:**
  - **Layout:** header / `flex-1 min-h-0` main / footer, with no `fixed` elements. The coin fits the remaining space at 484:515, and the score sits above it.
  - **Navigation:** Tap · Mine · Frens · Earn · Boosts. Tab state lives in `App`, with no router dependency.
  - **Placeholders:** screens that aren't built yet say what's coming, so no button is dead.
  - **Contrast:** nav text is `#4A2511` on `#fad258` (about 9:1). Add scrims and a text shadow.
  - **Cleanup:** remove the dead markup and classes.
  - **[Asset]** Mine has no icon; use an inline SVG until art exists.
- **Files:** `App.tsx`, `src/components/BottomNav.tsx`, `src/screens/{Tap,Mine,Frens,Earn,Boosts}Screen.tsx`.
- **Depends on:** A4 and A7.
- **Verify:** no overlap at any A7 size; the nav sits above the home indicator; every tab responds.

**A9 · Touch hygiene** (Essential)
- **Outcome:**
  - Across the surface: `user-select:none`, `-webkit-touch-callout:none`, a transparent tap highlight, and `touch-action:manipulation`.
  - On images: `draggable={false}`, and no context menu on the coin.
- **Files:** `index.css`, `TapCoin.tsx`.
- **Depends on:** A7.
- **Verify:** on iOS, there's no callout and rapid taps don't zoom. On desktop, the coin can't be dragged.

**A10 · Sound, motion and haptics** (Essential; tilt is Optional)
- **Outcome:**
  - Load the sound once, using Web Audio or a pool of four elements, and catch `play()` rejections.
  - Add a mute toggle, saved in `falcon-tap:settings`.
  - Respect `prefers-reduced-motion`.
  - Haptics use Telegram's `HapticFeedback` (after A12), or else `navigator.vibrate`.
  - Optional: tilt the coin toward the tap point.
- **Files:** `src/hooks/useTapSound.ts`, `TapCoin.tsx`, `index.css`.
- **Depends on:** A3 and A5.
- **Verify:** 20 rapid taps produce no console errors, and mute persists.

**A11 · Intro screen replaces `persian_theme.html`** (Essential)
- **Outcome:**
  - A first-run overlay using the Rostam/Sohrab background in place of the Disney art, keeping "Tap to Earn" and Start.
  - Start also unlocks audio on iOS.
  - Remove `server.open` from [vite.config.ts](vite.config.ts), retire `public/persian_theme.html`, and delete or rewrite `src/_redirects`.
- **Files:** `src/screens/IntroScreen.tsx`, `vite.config.ts`, `public/`, `src/_redirects`.
- **Depends on:** A5 and A7.
- **Verify:** `npm run build && npm run preview`. The intro shows once, then the game opens directly, and there are no 404s.

**A12 · Telegram Mini App integration (frontend)** (Essential; the README sets Telegram as the platform)
- **Outcome:**
  - Load `https://telegram.org/js/telegram-web-app.js` in `index.html`.
  - A `src/telegram.ts` wrapper detects the Telegram environment and gates calls with `isVersionAtLeast`.
  - Call `ready()`, `expand()` and `disableVerticalSwipes()` (7.7+).
  - Read the safe-area CSS variables (8.0+) into the `GameShell` padding.
  - Use the `BackButton` for sub-views and set the header and background colors to match the game.
  - Everything still works in a plain browser.
- **Files:** `index.html`, `src/telegram.ts`, `GameShell.tsx`.
- **Depends on:** A7 and A8.
- **Verify:**
  - On Telegram iOS and Android, a swipe-down while tapping doesn't close the app.
  - Content clears the notch and the home bar.
  - On Telegram Desktop, the layout is full-bleed.

**A13 · Asset weight and dead files** (Recommended)
- **Outcome:**
  - Resize the 5760×3240, 2.7 MB background to about 1600 px wide (target under 300 KB). This is a one-time edit.
  - Compress `notcoin.png` (394 KB).
  - Delete `App.css`, `react.svg` and the unused exports.
- **Verify:** DevTools Network shows the new transfer sizes, and `npm run build` and `npm run lint` pass with zero warnings.

### Milestone B: Progression (README game mechanics)

**B0 · Economy model** (Essential; **gate for B1–B5**, [D1])
- **Outcome:** every number lives in `shared/economy.ts`:
  - level thresholds (README) and whether they count lifetime coins
  - tap value per level
  - the energy-limit boost curve
  - card unlock costs, upgrade cost and profit curves (L1–L21)
  - the offline-income cap
  - referral and task rewards
- **Simulation:** model a "regular" player (about 6 sessions a day) and a "dedicated" player over 31 days. Do this in a spreadsheet or a small script that imports `shared/`. Results go in `docs/economy.md`.
- **Files:** `shared/economy.ts`, `docs/economy.md`.
- **Depends on:** A1.
- **Verify:**
  - The regular player completes each labor within about one day of the README schedule.
  - The owner signs off on the table.

**B1 · Levels: the 7 labors** (Essential)
- **Outcome:**
  - `levelFor(earnedTotal)` decides the level. Save schema v2 adds `earnedTotal`, migrated from `points`.
  - A `LevelBadge` shows the name and progress to the next level.
  - A `LevelUpDialog` shows once per level.
  - Completing Level 7 shows a "season complete" state ([D15]).
- **Files:** `shared/levels.ts`, `src/components/LevelBadge.tsx`, `src/components/LevelUpDialog.tsx`, `localStore.ts`.
- **Depends on:** B0 and A8.
- **Verify:**
  - Set `earnedTotal` to the threshold minus 2 (dev-only debug panel) and tap: the dialog appears once and the badge updates.
  - The level survives a reload.
  - Spending coins never lowers the level.

**B2 · Story and educational pop-ups** (Essential)
- **Outcome:**
  - `src/content/shahnameh.ts` holds 7 chapters, starting from [README.md:52-78](README.md#L52-L78) (challenge and symbolism) plus 2–3 short facts each. **[Asset]** Content review ([D14]).
  - Chapters appear in the level-up dialog and in a Story screen opened from the level badge.
  - Pop-ups never interrupt tapping: they wait until about 2 s without a tap and stay dismissible.
- **Files:** `src/content/shahnameh.ts`, `src/screens/StoryScreen.tsx`.
- **Depends on:** B1.
- **Verify:**
  - Locked chapters are hidden or blurred.
  - A pop-up never appears during a tap streak.
  - Story text is readable at 280 px.

**B3 · Level backgrounds and character art** (Essential once assets arrive) **[Asset]**
- **Outcome:**
  - Each level entry carries its own background and character image (young warrior → wise warrior; Level 1 with a lion, Level 7 against the White Demon).
  - The current JPEG is the fallback until the 7 backgrounds arrive from Akash.
  - Preload the next level's background.
- **Files:** `shared/levels.ts` (image keys), `src/images/levels/`, `GameShell.tsx`.
- **Depends on:** B1.
- **Verify:** each level change swaps the art with no layout shift. Images stay under about 300 KB each.

**B4 · Boosts: stamina** (Essential)
- **Outcome:**
  - An "Energy limit" upgrade bought with coins (README:172), using the B0 curve. It spends `balance`, not `earnedTotal`.
  - The Boosts screen and the energy-row shortcut both open it.
  - Optional extras follow [D18]: a daily free refill, faster recharge, or multitap.
- **Files:** `shared/boosts.ts`, `src/screens/BoostsScreen.tsx`.
- **Depends on:** B0 and A8.
- **Verify:**
  - When the player can't afford it, the button is disabled with the shortfall shown.
  - After buying, the max energy rises, the bar rescales, and both persist.

**B5 · Cards and mining** (Essential)
- **Outcome:**
  - **Catalog:** `shared/catalog.ts` is seeded from the README.
    - Asia costs 1M and unlocks Iran, China, India, Japan and South Korea.
    - Iran costs 500K and unlocks Tehran, Isfahan, Shiraz, Mashhad and Tabriz.
    - Tehran costs 100K, earns 1,000/h, and adds +10% per level up to level 21.
    - **[Asset]** The remaining regions, countries and cities come from the owner.
  - **Mine screen:** drill-down by region, country and city, with locked states, buy and upgrade, and the next level's profit gain shown.
  - **Income:** profit/h is shown in the header and passive income ticks up live.
  - **Offline:** offline income is capped ([D1]) and shown in a "While you were away" dialog.
- **Files:** `shared/catalog.ts`, `shared/cards.ts`, `src/screens/MineScreen.tsx`, `src/components/CardTile.tsx`, `src/components/OfflineIncomeDialog.tsx`.
- **Depends on:** B0 and A8.
- **Verify:**
  - Buying Tehran at L1 raises profit/h by 1,000.
  - One simulated hour adds 1,000.
  - L21 disables the upgrade.
  - Cities stay locked until their country is bought.
  - Offline time beyond the cap credits only the cap.

**B6 · Big numbers** (Essential)
- **Outcome:** compact notation (`Intl.NumberFormat`, `notation: 'compact'`) for costs and profit, and the full figure for the balance.
- **Verify:** a balance of 1,300,000,000 and a cost of 999.9M fit at 280 px without wrapping into other elements.

### Milestone C: Backend and Telegram bot

**C1 · Server scaffold** (Essential)
- **Outcome:**
  - A `server/` Node LTS service ([D16]) in TypeScript, using `node:http` or Fastify ([D8]).
  - PostgreSQL through `pg`, with SQL migrations.
  - Environment-based config with a `server/.env.example` and a `/health` endpoint.
  - The server imports `shared/`.
- **Files:** `server/package.json`, `server/tsconfig.json`, `server/src/*`, `server/migrations/*.sql`.
- **Depends on:** A1.
- **Verify:** `/health` returns OK, and the migrations apply to an empty database.

**C2 · Telegram authentication** (Essential)
- **Outcome:**
  - Validate `initData` with the HMAC-SHA256 scheme, rejecting an `auth_date` older than 24 hours (configurable).
  - Create the player on first contact.
  - Record `start_param` as the referrer **only when the account is created**.
- **Files:** `server/src/auth.ts`.
- **Depends on:** C1.
- **Verify:**
  - Tampered or expired `initData` returns 401.
  - A valid request creates the player row.

**C3 · Server-authoritative state and sync** (Essential)
- **Outcome:**
  - The §3.4 endpoints, using the shared rules on server time.
  - Batched optimistic taps with an idempotency `seq`.
  - Purchases run in DB transactions with a row lock.
  - `RemoteStore` implements `GameStore`, with an offline queue and retries.
  - Guest mode stays local ([D7]).
- **Files:** `server/src/routes/*`, `src/game/remoteStore.ts`, `useGame.ts`.
- **Depends on:** C2, plus B1–B5 for the purchase endpoints.
- **Verify:**
  - Two devices on one account converge.
  - A forged batch of 10,000 taps credits only the affordable taps.
  - A replayed `seq` is ignored.
  - Parallel purchases can't push the balance below zero.
  - Killing the app loses at most about 2 s of taps.

**C4 · Telegram bot** (Essential)
- **Outcome:**
  - A webhook registered with a `secret_token`.
  - Commands as in §2.6, registered with `setMyCommands`; the menu button opens the Mini App.
  - Library choice: [D9].
- **Files:** `server/src/bot.ts`.
- **Depends on:** C3.
- **Verify:**
  - In Telegram, `/start` shows Play.
  - `/score` matches the app.
  - `/tap` spends energy exactly like the app and is refused when energy is empty.

**C5 · Hardening** (Essential before launch)
- **Outcome:**
  - Per-user and per-IP rate limits, CORS restricted to the Netlify origin, and request schema validation.
  - Structured logs, error monitoring and database backups.
  - No secrets in the client bundle.
- **Verify:** a build-output grep finds neither the bot token nor `DATABASE_URL`, and a burst test returns 429s.

### Milestone D: Social

**D1 · Frens (referrals)** (Essential)
- **Outcome:**
  - **Invite link:** `https://t.me/<bot>/<app>?startapp=ref_<id>`. The README's app is `t.me/Arshian_Pahlevan_Bot/FalconTapGAme`.
  - **Sharing:** through `openTelegramLink('https://t.me/share/url?url=…&text=…')`, with a copy-link fallback.
  - **Server rules:** no self-referral and no reassigning an inviter.
  - **Rewards:** paid by the [D10] rule (for example, once the invitee reaches Level 1).
  - **Frens screen:** lists invited friends and the rewards earned.
- **Files:** `server/src/routes/frens.ts`, `src/screens/FrensScreen.tsx`.
- **Depends on:** C3.
- **Verify:**
  - A new account opened from the link appears in the inviter's list, and the reward is paid exactly once.
  - Opening a second link doesn't change the inviter.

**D2 · Earn (social tasks)** (Essential)
- **Outcome:**
  - A server-side task catalog ([D11]).
  - Telegram channel joins are verified with `getChatMember`, which requires the bot to be a channel admin.
  - Other networks use a clearly labeled honor system: open the link, then Claim after a short delay.
  - The database enforces one claim per task.
- **Files:** `server/src/routes/tasks.ts`, `src/screens/EarnScreen.tsx`.
- **Depends on:** C3.
- **Verify:**
  - A channel claim fails until the user has joined.
  - A double claim is rejected.
  - The balance updates exactly once.

### Milestone E: Token rewards (blocked on [D12], [D13] and a legal review)

**E1 · Decide the chain and model** (Essential gate)
- **Outcome:**
  - A written decision on the chain. Telegram's guidelines require TON and TON Connect inside Mini Apps, which conflicts with the README's Ethereum ERC-20 and web3.js (P3, P4).
  - A written decision on the conversion rate and timing; the recommended timing is end of season.
  - A legal review of distributing tokens to players.
- **Verify:** the decision is recorded in this file (§7).

**E2 · Token contract** (Essential once E1 is decided)
- **Outcome:**
  - TON's reference jetton contract (TEP-74), kept in `contracts/`.
  - Deployed to **testnet** first.
  - The admin key is held offline or behind a multisig, never on the game server.
- **Verify:** a testnet mint and transfer show up in an explorer.

**E3 · Wallet connection** (Essential)
- **Outcome:**
  - A Wallet screen using `@tonconnect/ui-react`, with `public/tonconnect-manifest.json`.
  - The server checks a TON Connect `ton_proof` before storing the address.
- **Files:** `src/screens/WalletScreen.tsx`, `server/src/routes/wallet.ts`.
- **Depends on:** C3 and E1.
- **Verify:** connect, disconnect and reconnect work, and an address without a valid proof is rejected.

**E4 · Allocation and claim** (Essential)
- **Outcome:**
  - At season end, compute the allocations from off-chain coins.
  - Distribute by the [D13] method, with idempotent records that hold transaction hashes.
  - `/score` and the Wallet screen show the allocation.
- **Verify:**
  - A testnet run end-to-end with 3 accounts.
  - A double claim is impossible.
  - Totals match the database.

### Milestone F: Season and launch

**F1 · 31-day season** (Essential)
- **Outcome:**
  - The server stores the season start and end; the Tap header shows a countdown.
  - End-of-season behavior follows [D15].
- **Verify:** fast-forward the season in a test database: the countdown, freeze and allocation trigger.

**F2 · Device QA and performance** (Essential)
- **Outcome:**
  - Run the §6 checks on the device matrix, including a low-end Android inside Telegram.
  - Run Lighthouse for mobile.
- **Verify:** all §6 checks pass. Track the tap-to-feedback delay; there's no fixed target yet, so measure it.

**F3 · Documentation** (Essential)
- **Outcome:** rewrite the README with:
  - what the game is
  - setup for the frontend, server, database and bot webhook
  - the environment variables
  - deployment (Netlify plus the server host)
  - the Node version, via `engines` and `.nvmrc`
  - real run steps, replacing the missing `run_pro.txt`
- **Verify:** a fresh clone runs by following only the README.

**F4 · Naming and IP** (Essential before public launch)
- **Outcome:**
  - Rename the `notcoin-telegram-mini-app-clone` package and the `notcoin` identifiers.
  - Remove the Disney image and the "WISE esports" logo.
- **Verify:** `git grep -i notcoin` returns only intentional matches.

---

## 6. Acceptance criteria

**Core loop**
- A mouse click, a phone tap, or Space/Enter each give exactly one tap's points and energy cost, one float showing the real amount, and at most one sound.
- N fingers landing together give N taps. A finger that's already down never scores again.
- Energy stays between 0 and the max, and the bar never leaves its track.
- Below the tap cost, taps change nothing and show the empty state. The balance never drops from tapping.
- Regeneration matches the configured rate, including time spent in the background or closed.

**Touch and pointer**
- On iOS Safari, Android Chrome and Telegram:
  - no zoom (double-tap or multi-finger)
  - no callout
  - no text selection
  - no scrolling, bouncing or swipe-to-close while tapping
- A right-click doesn't score, and holding a key doesn't repeat taps.

**Responsive layout**
- At 280–430 px wide, there's no horizontal scroll and nothing overlaps, on every screen. The nav sits above the home indicator.
- Showing or hiding the Safari URL bar never hides the nav.
- At 1366×768, 1440×900 and 1920×1080:
  - the surface is at most 430 px wide, centered, with at least 24 px of margin
  - there are no scrollbars
  - the backdrop has nothing interactive

**Usability and accessibility**
- Text contrast is at least 4.5:1, and touch targets are at least 44 px.
- The coin is a named `<button>`, and the energy and level bars use `role="progressbar"` with their values.
- "Out of energy" and "Level up" are announced once through a polite live region.
- Dialogs and sheets close with Esc or a backdrop tap and return focus.
- Reduced motion is respected, mute persists, and the first paint is readable before images load.

**Progression**
- The level comes from lifetime earnings. Spending never lowers it, and each level-up dialog shows exactly once.
- Story chapters unlock with their level, and pop-ups never interrupt a tap streak.
- Boost and card purchases are refused when the player can't afford them. They deduct the exact cost and respect unlock rules and max level 21.
- Passive income matches profit/h, and offline income respects the cap.
- The B0 simulation shows a regular player on the README schedule, within about one day per level.

**Saving**
- **Guest mode:** a reload keeps the exact balance, cards and boosts. Corrupt or missing storage, or a clock moved backwards, never crashes the game or grants free resources.
- **Telegram:** progress follows the account across devices. The server's state wins, and taps sent offline are reconciled.

**Server and bot**
- Requests without valid `initData` are rejected.
- Forged or replayed tap batches can't credit more than the energy allows.
- `/start`, `/score` and `/tap` behave as in §2.6 and match the app.
- No secrets appear in the client bundle or the repository.

**Social**
- A referral is credited once per new account, never to yourself, and never reassigned.
- Each task can be claimed once. Channel tasks verify membership.

**Token rewards (testnet)**
- Wallet linking requires a valid `ton_proof`.
- Allocations equal the configured conversion of each player's coins, and claims are idempotent and auditable.

**Build**
- `npm run build` and `npm run lint` pass with zero warnings, as does the server build.

---

## 7. Decisions

| ID | Decision | Default this plan assumes | Blocks |
|---|---|---|---|
| D1 | Economy: thresholds as lifetime totals or per level; tap value; boost and card curves; offline cap | README thresholds as **lifetime** totals. Curves tuned by simulation. Offline income capped at 3 h | B1–B5 |
| D2 | A new player's starting energy | Full (not 2652) | A5 |
| D3 | Multi-touch scoring | Each finger is a normal tap. The 4/6 "bonus" never worked | A3 |
| D4 | Score position | Above the coin, reverting `8fdfb74` | A8 |
| D5 | Welcome page | Move it into React as the intro | A11 |
| D6 | Navigation | Tap · Mine · Frens · Earn · Boosts; wallet in the header | A8 |
| D7 | Play outside Telegram | Guest mode, local only; never migrated into accounts | C3 |
| D8 | Server hosting and stack | One Node service + PostgreSQL on a Node host; frontend stays on Netlify. Alternative: Netlify Functions + managed Postgres | C1 |
| D9 | Bot library | Raw Bot API calls with `fetch` (no dependency), or grammY if more commands follow | C4 |
| D10 | Referral rewards and anti-abuse | Pay once the invitee reaches Level 1. Amount from B0 | D1 |
| D11 | Social tasks | Owner provides the accounts and URLs; Telegram channel verified; others honor-based | D2 |
| D12 | Blockchain | **TON + TON Connect**, which Telegram requires for Mini Apps, instead of the README's Ethereum ERC-20 | E |
| D13 | Token conversion and distribution | Off-chain coins convert at season end. Method (server-signed claims or batch transfers) chosen in E1 | E |
| D14 | Story framing and accuracy | Keep the README chapters as a draft; a Shahnameh-literate reviewer approves before launch | B2 |
| D15 | What happens after day 31 | Tapping freezes, the claim screen opens, and a new season can start later | F1 |
| D16 | Node version | Node 24 LTS (installed locally) instead of the README's Node 18 (EOL) | C1 |
| D17 | Test runner | Add Vitest for `shared/` and the server; there are no tests today | B0, C3 |
| D18 | Boosts beyond the energy limit | Energy limit only (README). Daily refill, recharge speed and multitap are optional | B4 |

---

## 8. Risks

- **Leaked bot token** (P1). Until it's revoked, anyone with repo access can control the bot.
- **Economy balance** (P2). If B0 is skipped, the README schedule is impossible or trivial. Every progression feature depends on it.
- **Platform rules** (P3). An Ethereum token inside the Mini App breaks Telegram's guidelines and risks the app being removed.
- **Legal and regulatory.** Distributing tokens to players can raise securities, tax and KYC questions. Get advice before mainnet.
- **Cheating.** Without server authority (C3), balances, referrals and claims are trivially forged. Never give rewards to guest-mode progress.
- **Referral farming.** Fake accounts can farm invite rewards. Mitigate with conditional rewards ([D10]) and rate limits.
- **Missing content.** The 7 backgrounds, character art, the full card catalog and social URLs aren't in the repo. B3, B5 and D2 can ship with placeholders but can't be finished without them.
- **Content accuracy** (P6). Educational pop-ups that misstate the Shahnameh undermine the game's purpose.
- **iOS audio.** Sound needs a user gesture first and is affected by the silent switch.
- **Browser support.** `dvh` needs iOS 15.4+ / Chrome 108+, so keep a `vh` fallback.
- **Telegram webview storage.** It can be cleared, which affects guest mode only. Accounts are saved on the server.
- **Unconfirmed defect.** B1 is inferred from how React handles touch events. Confirm it in A0 before relying on the fix order.
- **Intellectual property.** The Disney art, the esports logo, and the Notcoin-derived names in `package.json` and the code all need replacing before a public launch.

---

## Sources

- Telegram, [Blockchain Guidelines for Mini Apps](https://core.telegram.org/bots/blockchain-guidelines)
- ChainSafe, [Web3.js sunset announcement](https://blog.chainsafe.io/web3-js-sunset/)
