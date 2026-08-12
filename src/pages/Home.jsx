import { useState } from "react";
import { Link } from "react-router-dom";
import { S, C, G, ZONE_COLOR, zoneOf } from "../styles.js";
import { useLeague } from "../league.jsx";
import { useAuth } from "../auth.jsx";
import { Crest, EmptyState, Kicker, LockBar, Movement, PrimaryLink, SectionHeading, ZoneLegend } from "../components/ui.jsx";
import { SEASON_LABEL } from "../config.js";

export default function Home() {
  const { standings, preseason, members, entries, leaderboard, picksVisible, snapshot } = useLeague();
  const { user } = useAuth();
  const [sortByRank, setSortByRank] = useState(true);

  const withPicks = entries.filter((e) => e.order);
  const rankOf = Object.fromEntries(leaderboard.map((e) => [e.uid, e]));

  const columns =
    sortByRank && !preseason
      ? [...withPicks].sort((a, b) => (rankOf[a.uid]?.rank ?? 999) - (rankOf[b.uid]?.rank ?? 999))
      : withPicks;

  return (
    <main style={S.mainWide}>
      <LockBar />

      {/* ── Leader strip ── */}
      {!preseason && picksVisible && leaderboard.length > 0 && (
        <>
          <Kicker>Standing</Kicker>
          <div
            style={{
              display: "flex",
              overflowX: "auto",
              borderTop: S.RULE_INK,
              borderBottom: `1px solid ${C.n300}`,
              marginBottom: 24,
            }}
          >
            {leaderboard.map((e) => (
              <div
                key={e.uid}
                style={{
                  flex: "0 0 auto",
                  minWidth: 112,
                  padding: "10px 14px 12px",
                  borderRight: `1px solid ${C.n300}`,
                  background: e.rank === 1 ? C.accent100 : C.surface,
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, ...S.listRank, width: "auto" }}>
                  <span className="u-num">{e.rank}.</span>
                  <span style={{ color: C.text, textTransform: "uppercase" }}>{e.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: 6 }}>
                  <span className="u-num" style={{ fontFamily: S.font, fontWeight: 800, fontSize: 26, lineHeight: 1, letterSpacing: "-0.02em" }}>
                    {e.score}
                  </span>
                  <span style={S.offLabel}>off</span>
                  <Movement value={e.movement} style={{ marginLeft: "auto", fontSize: 11 }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <SectionHeading
        title={preseason ? `Premier League ${SEASON_LABEL}` : "The table, side by side"}
        sub={
          preseason
            ? "The season hasn't kicked off yet — this is the team list everyone is predicting."
            : "Live standings on the left, everyone's picks alongside."
        }
      >
        {columns.length > 1 && !preseason && picksVisible && (
          <button className="btn-ink u-tap" style={S.btnInk} onClick={() => setSortByRank((v) => !v)}>
            {sortByRank ? "By rank" : "By join order"}
          </button>
        )}
      </SectionHeading>

      {/* ── Nobody has joined ── */}
      {members.length === 0 && (
        <div style={{ marginBottom: 24 }}>
          <EmptyState>
            Nobody has made a prediction yet.
            <div style={{ marginTop: 14 }}>
              <PrimaryLink to={user ? "/predictions" : "/login"}>
                {user ? "Make your prediction" : "Create an account"}
              </PrimaryLink>
            </div>
          </EmptyState>
        </div>
      )}

      {/* ── Picks still sealed ── */}
      {members.length > 0 && !picksVisible && (
        <div style={{ marginBottom: 24 }}>
          <EmptyState>
            <strong style={S.strong}>
              {members.length} {members.length === 1 ? "person has" : "people have"} joined.
            </strong>
            <br />
            Everyone's picks stay hidden until the deadline, so nobody can copy. They all appear here the moment
            predictions lock.
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
              {members.map((m) => {
                const done = entries.find((e) => e.uid === m.uid)?.submitted;
                return (
                  <span
                    key={m.uid}
                    style={{
                      border: `1px solid ${done ? C.text : C.n400}`,
                      color: done ? C.text : C.n600,
                      padding: "5px 10px",
                      fontFamily: S.font,
                      fontWeight: 800,
                      fontSize: 11,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {m.name} {done ? "✓" : "…"}
                  </span>
                );
              })}
            </div>
            <p style={{ ...S.fineprint, marginTop: 12 }}>✓ submitted · … still deciding</p>
          </EmptyState>
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
                  <th style={G.th}>Pl</th>
                  <th style={G.thPts}>Pts</th>
                  <th style={G.thGd}>GD</th>
                  {picksVisible &&
                    columns.map((p) => (
                      <th key={p.uid} style={G.thPlayer}>
                        {sortByRank && !preseason && rankOf[p.uid] && (
                          <div style={G.playerRank}>{rankOf[p.uid].rank}.</div>
                        )}
                        <Link to={`/everyone/${p.uid}`} style={G.playerName}>{p.name}</Link>
                        <div style={G.playerScore}>{rankOf[p.uid]?.score ?? "—"}</div>
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {standings.map((row, pos) => {
                  const zone = preseason ? null : zoneOf(pos, standings.length);
                  const isBreak = !preseason && (pos === 4 || pos === 6 || pos === standings.length - 3);

                  return (
                    <tr key={row.tla} style={isBreak ? G.zoneBreak : undefined}>
                      <td style={{ ...G.tdPos, borderLeft: `3px solid ${zone ? ZONE_COLOR[zone] : "transparent"}` }}>
                        {pos + 1}
                      </td>
                      <td style={G.tdTeam}>
                        <span style={S.teamRow}>
                          <Crest team={row} size={14} />
                          <span style={S.tla}>{row.tla}</span>
                          <span style={{ ...S.teamNameSoft, maxWidth: 96 }}>{row.name}</span>
                        </span>
                      </td>
                      <td style={G.td}>{row.played}</td>
                      <td style={G.tdPts}>{row.pts}</td>
                      <td style={{ ...G.tdGd, color: row.gd < 0 ? C.accent700 : C.n800 }}>
                        {row.gd > 0 ? `+${row.gd}` : row.gd}
                      </td>

                      {picksVisible &&
                        columns.map((p) => {
                          const predTla = p.order?.[pos];
                          if (!predTla) return <td key={p.uid} style={G.tdCell}>—</td>;

                          const predTeam = standings.find((t) => t.tla === predTla) || { tla: predTla };
                          const actualIdx = standings.findIndex((t) => t.tla === predTla);
                          const exact = predTla === row.tla;
                          const near = !exact && actualIdx !== -1 && Math.abs(actualIdx - pos) <= 1;

                          return (
                            <td
                              key={p.uid}
                              style={{
                                ...G.tdCell,
                                ...(preseason ? {} : exact ? G.hit : near ? G.near : {}),
                              }}
                              title={`${p.name}: ${predTeam.name || predTla} at ${pos + 1}`}
                            >
                              <span style={G.cellInner}>
                                <Crest team={predTeam} size={10} />
                                <span style={{ ...G.cellTla, color: exact ? C.accent800 : C.text }}>{predTla}</span>
                              </span>
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

          {snapshot && !preseason && picksVisible && (
            <p style={{ ...S.fineprint, marginTop: 12 }}>
              ▲▼ compares each score against matchday {snapshot.matchday}.
            </p>
          )}
        </>
      )}
    </main>
  );
}
