// Every tunable number in the game lives here (Plan.md §3.2, B0).
// The client uses these for instant feedback; the future server (Milestone C)
// imports the same file as the authority. All values are integers.
//
// STATUS: provisional. Tuned with `npm run simulate:economy`; results and the
// open questions for the owner are in docs/economy.md. Owner sign-off pending (D1).

export const SECOND_MS = 1_000;
export const HOUR_MS = 3_600_000;

// --- Energy (stamina) ---------------------------------------------------------

/** Energy spent by one tap. */
export const TAP_COST = 12;
/** Energy limit before any stamina boost. */
export const BASE_MAX_ENERGY = 6_500;
/** Energy regenerated per second. Must divide 1000 so regen stays on whole milliseconds. */
export const REGEN_PER_SEC = 10;
export const MS_PER_ENERGY = SECOND_MS / REGEN_PER_SEC;

// --- Stamina boost: "Energy limit" (README:172, D18 = energy limit only) -------

/** Energy added to the limit by each boost level. */
export const ENERGY_LIMIT_STEP = 500;
/** Highest boost level that can be bought. */
export const ENERGY_LIMIT_MAX_LEVEL = 10;
/** Cost of the first boost level; each further level doubles. */
export const ENERGY_LIMIT_BASE_COST = 50_000;

// --- Levels: the seven labors (README:176-183) ------------------------------

/**
 * Lifetime coins (`earnedTotal`) needed to complete each labor (D1 default:
 * thresholds are lifetime totals, so spending never lowers a level).
 */
export const LEVEL_THRESHOLDS = [
  1_000_000, 10_000_000, 200_000_000, 300_000_000, 500_000_000, 800_000_000, 1_300_000_000,
] as const;

/** README schedule: the day by which each labor should be complete (1+2+6+6+6+5+5 = 31). */
export const LEVEL_TARGET_DAY = [1, 3, 9, 15, 21, 26, 31] as const;

/**
 * Coins per tap, indexed by labors completed (0 = working on Labor 1, 7 = all done).
 * The README's card catalog is too small to fund its own schedule (Plan P2), so tapping
 * carries progression until the owner supplies the full catalog; then lower these.
 */
export const TAP_VALUE_BY_LEVEL = [250, 1_100, 4_100, 4_100, 4_500, 9_000, 15_000, 15_000] as const;

// --- Cards and mining (README:194-214) --------------------------------------

/** Highest level a city card can reach. */
export const CARD_MAX_LEVEL = 21;
/** Each city upgrade raises its hourly profit by this percentage, compounding (README: +10%). */
export const CARD_PROFIT_GROWTH_PCT = 10;
/**
 * Upgrade price = profit gained × payback hours. The first upgrade pays back in the base
 * hours; each later level takes `STEP` hours longer, so upgrades show diminishing returns.
 */
export const CARD_UPGRADE_PAYBACK_BASE_H = 100;
export const CARD_UPGRADE_PAYBACK_STEP_H = 10;

/** Passive income stops accruing after this long without the game open (D1 default: 3 h). */
export const OFFLINE_INCOME_CAP_MS = 3 * HOUR_MS;

// --- Social rewards (Milestone D) -------------------------------------------
// Referral (D10) and task (D11) reward amounts are owner decisions and are not set yet.
