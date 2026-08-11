// ─── Scoring ────────────────────────────────────────────────
// Same rules as last season: for every team, take the gap between where you
// predicted it and where it actually sits. Add those up. Lower is better,
// a perfect table is 0.

export function scorePrediction(order, standings) {
  if (!order?.length || !standings?.length) return null;
  let total = 0;
  order.forEach((tla, i) => {
    const actual = standings.findIndex((t) => t.tla === tla);
    if (actual === -1) return; // team not in the table (shouldn't happen)
    total += Math.abs(actual - i);
  });
  return total;
}

// How many teams did you nail exactly?
export function exactHits(order, standings) {
  if (!order?.length || !standings?.length) return 0;
  return order.reduce((n, tla, i) => n + (standings[i]?.tla === tla ? 1 : 0), 0);
}

// Build the ranked leaderboard. `entries` is [{ uid, name, order }].
export function buildLeaderboard(entries, standings, snapshotScores) {
  return entries
    .map(({ uid, name, order }) => {
      const score = scorePrediction(order, standings);
      const prev = snapshotScores?.[uid];
      return {
        uid,
        name,
        score,
        exact: exactHits(order, standings),
        // Negative = you've closed the gap since the last snapshot. Good.
        movement: score !== null && typeof prev === "number" ? score - prev : null,
      };
    })
    .sort((a, b) => {
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      if (a.score !== b.score) return a.score - b.score;
      if (a.exact !== b.exact) return b.exact - a.exact; // tie-break on exact hits
      return a.name.localeCompare(b.name);
    })
    .map((e, i, all) => ({
      ...e,
      // Shared rank for genuinely tied scores.
      rank: i > 0 && all[i - 1].score === e.score && all[i - 1].exact === e.exact ? all[i - 1].rank : i + 1,
    }));
}

// Reorder helper used by both drag-and-drop and the ▲▼ buttons.
export function moveInOrder(order, from, to) {
  if (to < 0 || to >= order.length || from === to) return order;
  const next = [...order];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
