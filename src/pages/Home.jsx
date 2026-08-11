import { useState } from "react";
import { Link } from "react-router-dom";
import { S, C, G, ZONE_COLOR, zoneOf } from "../styles.js";
import { useLeague } from "../league.jsx";
import { useAuth } from "../auth.jsx";
import { Crest, EmptyState, LockBar, Movement, PrimaryLink, SectionHeading, ZoneLegend } from "../components/ui.jsx";
import { SEASON_LABEL } from "../config.js";

export default function Home() {
  const { standings, preseason, members, entries, leaderboard, locked, picksVisible, snapshot } = useLeague();
  const { user } = useAuth();
  const [sortByRank, setSortByRank] = useState(true);

  const withPicks = entries.filter((e) => e.order);
  const rankOf = Object.fromEntries(leaderboard.map((e) => [e.uid, e]));

  // Order the player columns: leaderboard order once there's a table to rank
  // against, otherwise the order people joined.
  const columns = sortByRank && !preseason
    ? [...withPicks].sort((a, b) => (rankOf[a.uid]?.rank ?? 999) - (rankOf[b.uid]?.rank ?? 999))
    : withPicks;

  return (
    <main style={S.mainWide}>
      <LockBar />

      {/* ── Leaderboard strip ── */}
      {!preseason && leaderboard.length > 0 && (
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, marginBottom: 24 }}>
          {leaderboard.slice(0, 5).map((e) => (
            <div
              key={e.uid}
              style={{
                ...S.card,
                padding: "12px 16px",
                minWidth: 150,
                flexShrink: 0,
                ...(e.rank === 1 ? { border: `1px solid rgba(139,92,246,0.4)`, background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.05))" } : {}),
              }}
            >
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>
                {e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : e.rank === 3 ? "🥉" : `#${e.rank}`}{" "}
                <span style={{ color: C.textBright, fontWeight: 600 }}>{e.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: S.mono, fontSize: 22, fontWeight: 700, color: "#fff" }}>{e.score}</span>
                <span style={{ fontSize: 10, color: C.mutedDim }}>off</span>
                <Movement value={e.movement} style={{ fontSize: 11, marginLeft: "auto" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <SectionHeading
        title={`Premier League ${SEASON_LABEL}`}
        sub={
          preseason
            ? "The season hasn't kicked off yet — this is the team list everyone is predicting."
            : "The live table on the left, everyone's predicted table alongside it. Scroll sideways for more players."
        }
      >
        {columns.length > 1 && !preseason && (
          <button
            style={{ ...S.btn, ...(sortByRank ? S.btnToggleOn : {}) }}
            onClick={() => setSortByRank((v) => !v)}
          >
            {sortByRank ? "🏆 Sorted by rank" : "↕️ Sort by leaderboard"}
          </button>
        )}
      </SectionHeading>

      {/* ── Nobody has signed up yet ── */}
      {members.length === 0 && (
        <EmptyState icon="🎯">
          Nobody has made a prediction yet.
          <br />
          <PrimaryLink to={user ? "/predictions" : "/login"} style={{ marginTop: 16 }}>
            {user ? "Make your prediction" : "Create an account"}
          </PrimaryLink>
        </EmptyState>
      )}

      {/* ── Picks are still under wraps ── */}
      {members.length > 0 && !picksVisible && (
        <div style={{ ...S.card, textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🤫</div>
          <p style={{ ...S.emptyText, marginBottom: 14 }}>
            <strong style={{ color: C.textBright }}>
              {members.length} {members.length === 1 ? "person has" : "people have"} joined.
            </strong>
            <br />
            Everyone's picks stay hidden until the deadline, so nobody can copy. They'll all appear here the moment
            predictions lock.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {members.map((m) => (
              <span key={m.uid} style={{ ...S.weekBadge, fontFamily: S.sans, fontSize: 12, padding: "6px 12px" }}>
                {m.name} {entries.find((e) => e.uid === m.uid)?.submitted ? "✓" : "…"}
              </span>
            ))}
          </div>
          {!locked && (
            <p style={{ ...S.formNote, marginTop: 16 }}>
              ✓ = prediction submitted · … = still deciding
            </p>
          )}
        </div>
      )}

      {/* ── The grid ── */}
      {standings && (
        <>
          <div style={G.wrap}>
            <table style={G.table}>
              <thead>
                <tr>
                  <th style={G.thPos}>#</th>
                  <th style={G.thTeam}>Team</th>
                  <th style={G.th}>P</th>
                  <th style={G.th}>Pts</th>
                  <th style={{ ...G.th, ...G.divider }}>GD</th>
                  {picksVisible &&
                    columns.map((p, i) => (
                      <th
                        key={p.uid}
                        style={{
                          ...G.thPlayer,
                          borderRight: i < columns.length - 1 ? `1px solid ${C.line}` : "none",
                        }}
                      >
                        {sortByRank && !preseason && rankOf[p.uid] && (
                          <div style={G.playerRank}>
                            {rankOf[p.uid].rank === 1 ? "🥇" : rankOf[p.uid].rank === 2 ? "🥈" : rankOf[p.uid].rank === 3 ? "🥉" : `#${rankOf[p.uid].rank}`}
                          </div>
                        )}
                        <Link to={`/everyone/${p.uid}`} style={{ ...G.playerName, textDecoration: "none", display: "block" }}>
                          {p.name}
                        </Link>
                        <div style={G.playerScore}>{rankOf[p.uid]?.score ?? "—"}</div>
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {standings.map((row, pos) => {
                  const zone = preseason ? null : zoneOf(pos, standings.length);
                  const stripe =
                    pos === 4 ? `2px solid ${ZONE_COLOR.el}`
                    : pos === 6 ? `2px solid ${ZONE_COLOR.ecl}`
                    : pos === standings.length - 3 ? `2px solid ${ZONE_COLOR.rel}`
                    : undefined;

                  return (
                    <tr
                      key={row.tla}
                      style={{
                        ...S.tr,
                        ...(pos % 2 === 0 ? S.trEven : {}),
                        ...(stripe && !preseason ? { borderTop: stripe } : {}),
                      }}
                    >
                      <td style={G.tdPos}>
                        <span
                          style={{
                            ...S.rankBadge,
                            background: zone ? ZONE_COLOR[zone] : "transparent",
                            color: zone ? "#fff" : C.text,
                          }}
                        >
                          {pos + 1}
                        </span>
                      </td>
                      <td style={G.tdTeam}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Crest team={row} size={20} />
                          <span style={{ color: C.textBright, fontWeight: 500, fontSize: 12 }}>{row.name}</span>
                        </div>
                      </td>
                      <td style={G.td}>{row.played}</td>
                      <td style={{ ...G.td, color: "#fff", fontWeight: 700 }}>{row.pts}</td>
                      <td
                        style={{
                          ...G.td,
                          ...G.divider,
                          fontWeight: 600,
                          color: row.gd > 0 ? C.green : row.gd < 0 ? C.red : "#8a8f98",
                        }}
                      >
                        {row.gd > 0 ? `+${row.gd}` : row.gd}
                      </td>

                      {picksVisible &&
                        columns.map((p, i) => {
                          const predTla = p.order?.[pos];
                          const border = i < columns.length - 1 ? "1px solid rgba(30,34,48,0.5)" : "none";
                          if (!predTla) return <td key={p.uid} style={{ ...G.td, borderRight: border }}>—</td>;

                          const predTeam = standings.find((t) => t.tla === predTla);
                          const actualIdx = standings.findIndex((t) => t.tla === predTla);
                          const exact = predTla === row.tla;
                          const near = !exact && actualIdx !== -1 && Math.abs(actualIdx - pos) <= 1;

                          return (
                            <td
                              key={p.uid}
                              style={{
                                ...G.td,
                                ...(preseason ? {} : exact ? G.hit : near ? G.near : {}),
                                borderRight: border,
                              }}
                              title={`${p.name}: ${predTeam?.name || predTla} at ${pos + 1}`}
                            >
                              <div style={G.cellCentre}>
                                <Crest team={predTeam || { tla: predTla }} size={22} />
                              </div>
                            </td>
                          );
                        })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ZoneLegend showExact={picksVisible && !preseason} />

          {snapshot && !preseason && (
            <p style={{ ...S.formNote, marginTop: 12 }}>
              ▲▼ compares each score against matchday {snapshot.matchday}.
            </p>
          )}
        </>
      )}
    </main>
  );
}
