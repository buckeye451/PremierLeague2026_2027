// ============================================================
//  SEASON CONFIG — the handful of knobs you may want to turn.
// ============================================================

// football-data.org identifies a season by the year it starts in.
// 2026 == the 2026/27 Premier League season.
export const SEASON = 2026;
export const SEASON_LABEL = "2026/27";

// ─── Prediction lock ────────────────────────────────────────
// Friday 21 August 2026, 8:00 PM Eastern = 2026-08-22T00:00:00Z.
//
// Note: on that date the US East Coast is on EDT (UTC−4), so "8 PM Eastern"
// is UTC−4. If you literally meant EST (UTC−5), use 1787360400000 instead.
//
// The server reads this same constant and refuses to write predictions past
// it, so the deadline holds regardless of what any browser thinks the time is.
export const LOCK_AT = 1787356800000;

// Keep everyone's picks hidden from each other until the deadline, so nobody
// can copy. Your own picks are always visible to you.
//
// The server enforces this — it strips other people's orders out of the
// response rather than trusting the browser to hide them. Set this to false
// if you'd rather everyone could see the picks as they come in.
export const HIDE_PICKS_UNTIL_LOCK = true;

// How often to re-fetch live data.
export const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
export const LIVE_REFRESH_INTERVAL = 60 * 1000; // 1 minute while matches are in play
