// ─── Premier League 2026/27 ─────────────────────────────────
//
// The app pulls the real team list from football-data.org at runtime. This
// list is the fallback used before the API has published the new season's
// standings (which typically happens a few days before matchday 1) and to
// colour crest-less badges.
//
// 2026/27 changes from 2025/26:
//   OUT — West Ham, Burnley, Wolves          (relegated)
//   IN  — Coventry City, Ipswich Town, Hull City (promoted)

export const TEAMS_2026_27 = [
  { name: "Arsenal", tla: "ARS", color: "#EF0107" },
  { name: "Aston Villa", tla: "AVL", color: "#95BFE5" },
  { name: "Bournemouth", tla: "BOU", color: "#DA291C" },
  { name: "Brentford", tla: "BRE", color: "#E30613" },
  { name: "Brighton", tla: "BHA", color: "#0057B8" },
  { name: "Chelsea", tla: "CHE", color: "#034694" },
  { name: "Coventry City", tla: "COV", color: "#78D0F3" },
  { name: "Crystal Palace", tla: "CRY", color: "#1B458F" },
  { name: "Everton", tla: "EVE", color: "#003399" },
  { name: "Fulham", tla: "FUL", color: "#000000" },
  { name: "Hull City", tla: "HUL", color: "#F5A12D" },
  { name: "Ipswich Town", tla: "IPS", color: "#0044AA" },
  { name: "Leeds United", tla: "LEE", color: "#FFCD00" },
  { name: "Liverpool", tla: "LIV", color: "#C8102E" },
  { name: "Man City", tla: "MCI", color: "#6CABDD" },
  { name: "Man United", tla: "MUN", color: "#DA291C" },
  { name: "Newcastle", tla: "NEW", color: "#241F20" },
  { name: "Nott'm Forest", tla: "NFO", color: "#DD0000" },
  { name: "Sunderland", tla: "SUN", color: "#EB172B" },
  { name: "Tottenham", tla: "TOT", color: "#132257" },
];

// Colours keyed by TLA. Includes a few alternate/legacy codes so the app
// still renders sensibly if football-data.org reports a different one.
export const TEAM_COLORS = {
  ...Object.fromEntries(TEAMS_2026_27.map((t) => [t.tla, t.color])),
  BRI: "#0057B8", // Brighton, alternate code
  CFC: "#034694", // Chelsea, alternate code
  LFC: "#C8102E", // Liverpool, alternate code
  BUR: "#6C1D45",
  WHU: "#7A263A",
  WOL: "#FDB913",
  LEI: "#003090",
  SOU: "#D71920",
  NOR: "#00A650",
  WBA: "#122F67",
  MID: "#D81920",
};

export function getTeamColor(tla) {
  return TEAM_COLORS[tla] || "#6b7086";
}

// Alphabetical team list used to seed a brand-new prediction, so you start by
// arranging a real list rather than staring at a blank page.
export function defaultPredictionOrder(standings) {
  const source = standings?.length ? standings : TEAMS_2026_27;
  return [...source].sort((a, b) => a.name.localeCompare(b.name)).map((t) => t.tla);
}

// Shape the fallback list like an API standings row so the UI can render it
// before a ball has been kicked.
export function fallbackStandings() {
  return TEAMS_2026_27.map((t, i) => ({
    position: i + 1,
    name: t.name,
    tla: t.tla,
    crest: null,
    played: 0,
    won: 0,
    draw: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    pts: 0,
    form: null,
  }));
}
