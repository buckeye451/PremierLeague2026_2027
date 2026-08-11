// ─── football-data.org client ───────────────────────────────
// Lives on the server so the API key never reaches a browser, and so ten
// friends refreshing at once costs one upstream call instead of ten. The
// free tier allows 10 requests/minute, which this comfortably respects.

import { SEASON } from "../src/config.js";
import { fallbackStandings } from "../src/teams.js";

const BASE = "https://api.football-data.org/v4";
const TTL = 3 * 60 * 1000;

const cache = new Map();

async function api(path, params = {}) {
  const qs = new URLSearchParams({ season: String(SEASON), ...params }).toString();
  const key = `${path}?${qs}`;

  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.data;

  if (!process.env.FOOTBALL_API_KEY) throw new Error("FOOTBALL_API_KEY is not set");

  const res = await fetch(`${BASE}/${path}?${qs}`, {
    headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`football-data.org responded ${res.status}`);

  const data = await res.json();
  cache.set(key, { data, at: Date.now() });
  return data;
}

const shapeRow = (row) => ({
  position: row.position,
  name: row.team.shortName || row.team.name,
  tla: row.team.tla,
  crest: row.team.crest,
  played: row.playedGames,
  won: row.won,
  draw: row.draw,
  lost: row.lost,
  gf: row.goalsFor,
  ga: row.goalsAgainst,
  gd: row.goalDifference,
  pts: row.points,
  form: row.form,
});

const shapeMatch = (m) => ({
  id: m.id,
  status: m.status,
  matchday: m.matchday,
  date: m.utcDate,
  home: { name: m.homeTeam.shortName || m.homeTeam.name, tla: m.homeTeam.tla, crest: m.homeTeam.crest },
  away: { name: m.awayTeam.shortName || m.awayTeam.name, tla: m.awayTeam.tla, crest: m.awayTeam.crest },
  homeScore: m.score?.fullTime?.home,
  awayScore: m.score?.fullTime?.away,
  minute: m.minute,
});

// Returns { table, currentMatchday, preseason, stale }.
// Never throws: a table always comes back, even if it's the built-in list,
// so a football-data outage degrades the site instead of breaking it.
export async function getStandings() {
  try {
    const data = await api("competitions/PL/standings");
    const total = data.standings?.find((s) => s.type === "TOTAL");
    if (total?.table?.length) {
      const table = total.table.map(shapeRow);
      return {
        table,
        currentMatchday: data.season?.currentMatchday || 1,
        preseason: table.every((t) => t.played === 0),
        stale: false,
      };
    }
  } catch (err) {
    console.warn("[football] standings unavailable:", err.message);
  }

  // Before the season opens there's no table, but the squad list exists.
  try {
    const data = await api("competitions/PL/teams");
    if (data.teams?.length) {
      const table = data.teams
        .map((t) => ({
          name: t.shortName || t.name,
          tla: t.tla,
          crest: t.crest,
          played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: null,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((t, i) => ({ ...t, position: i + 1 }));
      return { table, currentMatchday: 1, preseason: true, stale: false };
    }
  } catch (err) {
    console.warn("[football] team list unavailable:", err.message);
  }

  return { table: fallbackStandings(), currentMatchday: 1, preseason: true, stale: true };
}

export async function getMatches() {
  const grab = async (status) => {
    try {
      const data = await api("competitions/PL/matches", { status });
      return (data.matches || []).map(shapeMatch);
    } catch {
      return [];
    }
  };

  const [finished, live, scheduled] = await Promise.all([
    grab("FINISHED"),
    grab("IN_PLAY,PAUSED"),
    grab("SCHEDULED,TIMED"),
  ]);

  return {
    recent: finished.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10),
    live,
    upcoming: scheduled.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 10),
  };
}
