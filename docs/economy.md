# Economy model (Plan.md step B0)

**Status: provisional. Needs owner sign-off (Plan.md decision D1).**

All numbers live in [`shared/economy.ts`](../shared/economy.ts), and the card catalog lives in [`shared/catalog.ts`](../shared/catalog.ts). The client uses them today, and the planned server will import the same files. To re-run the simulation after changing a value:

```bash
npm run simulate:economy
```

## Current values

| Setting | Value | Source |
|---|---|---|
| Tap cost | 12 energy | Original game |
| Starting energy limit | 6,500 | Original game |
| Regeneration | 10 energy/s (empty to full in 650 s) | Original game |
| Starting energy for a new player | Full | D2 default |
| Level thresholds | 1M, 10M, 200M, 300M, 500M, 800M, 1,300M **lifetime** coins | README; D1 default (lifetime) |
| Coins per tap by labors completed (0 to 7) | 250, 1,100, 4,100, 4,100, 4,500, 9,000, 15,000, 15,000 | Tuned by simulation |
| Energy-limit boost | +500 per level, 10 levels (max 11,500). Costs 50K, doubling each level (last level 25.6M) | Tuned by simulation; D18 default (energy limit only) |
| Cards | Asia 1M, Iran 500K, Tehran 100K at 1,000/h, +10% profit per level compounding, max level 21 | README |
| Card upgrade price | Profit gained × (100 h + 10 h per level already owned) | Tuned; first Tehran upgrade costs 10,000 |
| Offline income cap | 3 hours | D1 default |
| Referral and task rewards | Not set | D10, D11 (owner) |

Tap values never go down when a labor is completed, so a level-up never makes a tap worth less.

## Simulation (31 days)

Output of `npm run simulate:economy` with the values above:

Profiles: **Regular**: 6 sessions a day (08, 11, 14, 17, 20, 23 h); **Dedicated**: 16 sessions a day (hourly, 08-23 h).
Each session taps until energy runs out (about 6 taps/s), then buys boosts and cards greedily.

| Labor | Lifetime coins | README day | Regular day | Dedicated day |
|---|---|---|---|---|
| 1 The Lion | 1,000,000 | 1 | 1 (on time) | 1 (on time) |
| 2 The Desert | 10,000,000 | 3 | 3 (on time) | 1 (-2) |
| 3 The Dragon | 200,000,000 | 9 | 10 (+1) | 4 (-5) |
| 4 The Sorceress | 300,000,000 | 15 | 14 (-1) | 5 (-10) |
| 5 The Demon | 500,000,000 | 21 | 20 (-1) | 8 (-13) |
| 6 The Simurgh | 800,000,000 | 26 | 25 (-1) | 10 (-16) |
| 7 The Rescue | 1,300,000,000 | 31 | 30 (-1) | 12 (-19) |

| After 31 days | Regular | Dedicated |
|---|---|---|
| Taps per day | 6,528 | 17,658 |
| Lifetime coins | 1,425,005,900 | 6,600,455,900 |
| Energy limit | 11,500 (level 10) | 11,500 (level 10) |
| Profit per hour | 0 | 0 |
| Cards owned | none | none |
| Final tap value | 15,000 | 15,000 |

**Result:** the regular player completes every labor within one day of the README schedule, which meets the B0 target.

## Findings the owner needs to decide on

1. **Cards don't pay for themselves.** Reaching Tehran costs 1.6M (Asia 1M + Iran 500K + Tehran 100K) for 1,000 coins/h. That takes 1,600 hours to pay back, and the season lasts only 744 hours. Even fully upgraded to level 21, Tehran earns 6,727/h. The schedule needs roughly 4M/h of passive income by Labor 7 (Plan.md P2). So the simulated players never buy a card, and **tapping carries all progression for now**.
   - When the full catalog arrives (the other regions, countries and cities, with prices), passive income should take over the late game, and the late tap values should come down. Re-run the simulation after each catalog change.
   - Only Asia, Iran and Tehran have prices. Every other region, country and city named in the README shows as "Coming soon" in the game.
2. **Dedicated players finish far ahead of schedule** (day 12 instead of 31), because the energy loop rewards checking in every hour. If the 31-day season should pace everyone, consider a daily tap or energy cap, or more passive income and lower tap values.
3. **Level 3 pacing.** The jump from 10M to 200M (Labor 3) and then only +100M for Labor 4 forces a trade-off when tap values never decrease. With these values Labor 3 lands a day late and Labor 4 a day early. Confirm the Labor 3 threshold.
4. **Large numbers per tap.** A tap is worth 250 coins at the start and 15,000 by the end, because the README thresholds are in the hundreds of millions. Lower thresholds would allow smaller, more familiar tap values.
5. **Referral (D10) and social-task (D11) rewards** are not set. They also add income, so re-run the simulation once they are.
