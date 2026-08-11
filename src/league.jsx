// ─── League data context ────────────────────────────────────
// Owns everything the pages read: live football data, the shared state of who
// has picked what, and whether the deadline has passed.
//
// Live data is polled. Shared state is pushed — when anyone saves a
// prediction the server sends an event and every open browser refetches.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api, subscribeToUpdates } from "./api.js";
import { useAuth } from "./auth.jsx";
import { buildLeaderboard } from "./scoring.js";
import { LIVE_REFRESH_INTERVAL, LOCK_AT, REFRESH_INTERVAL } from "./config.js";

const LeagueContext = createContext(null);

// Ticks once a second until the deadline passes, then stops.
export function useCountdown(target = LOCK_AT) {
  const [now, setNow] = useState(() => Date.now());
  const expired = now >= target;

  useEffect(() => {
    if (expired) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [expired, target]);

  const s = Math.floor(Math.max(0, target - now) / 1000);
  return {
    expired,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export function LeagueProvider({ children }) {
  const { user } = useAuth();

  const [live, setLive] = useState(null);
  const [state, setState] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [stateError, setStateError] = useState(null);
  const [liveReady, setLiveReady] = useState(false);
  const [stateReady, setStateReady] = useState(false);

  const { expired: deadlinePassed } = useCountdown(LOCK_AT);

  // ── Live football data ──
  const refreshLive = useCallback(async () => {
    try {
      const data = await api.live();
      setLive(data);
      setLastRefresh(new Date());
      setApiError(
        data.stale
          ? "Live data from football-data.org is unavailable right now — showing the built-in team list. Predictions still work."
          : null
      );
    } catch (err) {
      setApiError(`Couldn't load live data — ${err.message}. Showing the last values we had.`);
    } finally {
      setLiveReady(true);
    }
  }, []);

  // ── Shared state ──
  const refreshState = useCallback(async () => {
    try {
      setState(await api.state());
      setStateError(null);
    } catch (err) {
      setStateError(err.message);
    } finally {
      setStateReady(true);
    }
  }, []);

  useEffect(() => {
    refreshLive();
    const t = setInterval(refreshLive, REFRESH_INTERVAL);
    return () => clearInterval(t);
  }, [refreshLive]);

  // Matches in play? Check more often.
  const liveCount = live?.matches?.live?.length || 0;
  useEffect(() => {
    if (liveCount === 0) return;
    const t = setInterval(refreshLive, LIVE_REFRESH_INTERVAL);
    return () => clearInterval(t);
  }, [liveCount, refreshLive]);

  // Refetch on sign-in/out too: what you're allowed to see depends on who you are.
  useEffect(() => { refreshState(); }, [refreshState, user?.uid]);

  // Push updates from the server.
  useEffect(() => subscribeToUpdates(refreshState), [refreshState]);

  // The moment the deadline passes, everyone's picks become visible — but the
  // server decides that, so ask it again rather than assuming.
  const wasLocked = useRef(deadlinePassed);
  useEffect(() => {
    if (deadlinePassed && !wasLocked.current) refreshState();
    wasLocked.current = deadlinePassed;
  }, [deadlinePassed, refreshState]);

  const standings = live?.table || null;
  const locked = state?.locked ?? deadlinePassed;
  const picksVisible = state?.picksVisible ?? false;

  const members = useMemo(() => state?.users || [], [state]);

  const entries = useMemo(
    () =>
      members.map((m) => {
        const p = state?.predictions?.[m.uid];
        return { ...m, order: p?.order || null, submitted: Boolean(p) };
      }),
    [members, state]
  );

  const leaderboard = useMemo(
    () => buildLeaderboard(entries.filter((e) => e.order), standings, state?.snapshot?.scores),
    [entries, standings, state]
  );

  const savePrediction = useCallback(
    async (order) => {
      await api.savePrediction(order);
      await refreshState();
    },
    [refreshState]
  );

  const value = useMemo(
    () => ({
      standings,
      matchday: live?.currentMatchday || 1,
      preseason: live?.preseason ?? true,
      matches: live?.matches || { recent: [], live: [], upcoming: [] },
      lastRefresh,
      apiError,
      dbError: stateError,
      refresh: refreshLive,
      members,
      entries,
      leaderboard,
      snapshot: state?.snapshot || null,
      locked,
      picksVisible,
      myOrder: user ? state?.predictions?.[user.uid]?.order || null : null,
      savePrediction,
      loading: !liveReady || !stateReady,
    }),
    [
      standings, live, lastRefresh, apiError, stateError, refreshLive, members, entries,
      leaderboard, state, locked, picksVisible, user, savePrediction, liveReady, stateReady,
    ]
  );

  return <LeagueContext.Provider value={value}>{children}</LeagueContext.Provider>;
}

export function useLeague() {
  const ctx = useContext(LeagueContext);
  if (!ctx) throw new Error("useLeague must be used inside <LeagueProvider>");
  return ctx;
}
