import { Link, useParams } from "react-router-dom";
import { S, C, ZONE_COLOR, zoneOf } from "../styles.js";
import { useLeague } from "../league.jsx";
import { useAuth } from "../auth.jsx";
import { Crest, EmptyState, LockBar, Movement, PrimaryLink, SectionHeading } from "../components/ui.jsx";
import { scorePrediction } from "../scoring.js";
import { ExtraPicks } from "./Predictions.jsx";

// ── /everyone — who's in, and what they went for ──
export default function Everyone() {
  const { uid } = useParams();
  const { members, entries, leaderboard, standings, preseason, picksVisible } = useLeague();
  const { user } = useAuth();

  if (uid) return <PlayerDetail uid={uid} />;

  const rankOf = Object.fromEntries(leaderboard.map((e) => [e.uid, e]));

  if (members.length === 0) {
    return (
      <main style={S.main}>
        <LockBar />
        <SectionHeading title="Everyone" />
        <EmptyState icon="👥">
          Nobody's joined yet. Be the first.
          <br />
          <PrimaryLink to={user ? "/predictions" : "/login"} style={{ marginTop: 16 }}>
            {user ? "Make your prediction" : "Create an account"}
          </PrimaryLink>
        </EmptyState>
      </main>
    );
  }

  return (
    <main style={S.main}>
      <LockBar />
      <SectionHeading
        title="Everyone"
        sub={
          picksVisible
            ? "Tap anyone to see their full predicted table next to the real one."
            : "Picks stay sealed until the deadline. Here's who's in so far."
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {entries.map((p) => {
          const rank = rankOf[p.uid];
          const isMe = user?.uid === p.uid;
          const canOpen = picksVisible || isMe;

          const inner = (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, color: C.textBright, fontSize: 15 }}>
                  {p.name}
                  {isMe && <span style={{ color: C.accentSoft, fontSize: 11, marginLeft: 6 }}>(you)</span>}
                </span>
                {rank && !preseason && (
                  <span style={{ fontSize: 13 }}>
                    {rank.rank === 1 ? "🥇" : rank.rank === 2 ? "🥈" : rank.rank === 3 ? "🥉" : `#${rank.rank}`}
                  </span>
                )}
              </div>

              <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 8 }}>
                {!p.submitted ? (
                  <span style={{ color: C.muted, fontSize: 13 }}>No prediction submitted</span>
                ) : !canOpen ? (
                  <span style={{ color: C.muted, fontSize: 13 }}>🔒 Sealed until the deadline</span>
                ) : preseason ? (
                  <span style={{ color: C.green, fontSize: 13 }}>✓ Prediction in</span>
                ) : (
                  <>
                    <span style={{ fontFamily: S.mono, fontSize: 24, fontWeight: 700, color: "#fff" }}>
                      {rank?.score ?? "—"}
                    </span>
                    <span style={{ fontSize: 11, color: C.mutedDim }}>off</span>
                    <span style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "baseline" }}>
                      {rank?.exact > 0 && (
                        <span style={{ fontSize: 11, color: C.green }}>{rank.exact} exact</span>
                      )}
                      <Movement value={rank?.movement} style={{ fontSize: 11 }} />
                    </span>
                  </>
                )}
              </div>
            </>
          );

          return canOpen && p.order ? (
            <Link key={p.uid} to={`/everyone/${p.uid}`} style={{ ...S.card, textDecoration: "none", display: "block" }}>
              {inner}
            </Link>
          ) : (
            <div key={p.uid} style={{ ...S.card, opacity: p.submitted ? 1 : 0.65 }}>{inner}</div>
          );
        })}
      </div>

      {/* Side-by-side comparison of the two free-text calls, so you don't have
          to open every player to see who backed whom. */}
      {picksVisible && entries.some((e) => e.topScorer || e.manager) && (
        <div style={{ marginTop: 32 }}>
          <SectionHeading title="Golden Boot & Manager calls" sub="Settled by argument, not by the scoreboard." />
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, textAlign: "left" }}>Player</th>
                  <th style={{ ...S.th, textAlign: "left" }}>⚽ Golden Boot</th>
                  <th style={{ ...S.th, textAlign: "left" }}>🧠 Manager of the Season</th>
                </tr>
              </thead>
              <tbody>
                {entries
                  .filter((e) => e.submitted)
                  .map((e, i) => (
                    <tr key={e.uid} style={{ ...S.tr, ...(i % 2 === 0 ? S.trEven : {}) }}>
                      <td style={{ ...S.td, textAlign: "left", fontWeight: 600, color: C.textBright }}>
                        {e.name}
                        {user?.uid === e.uid && (
                          <span style={{ color: C.accentSoft, fontSize: 11, marginLeft: 6 }}>(you)</span>
                        )}
                      </td>
                      <td style={{ ...S.td, textAlign: "left" }}>{e.topScorer || "—"}</td>
                      <td style={{ ...S.td, textAlign: "left" }}>{e.manager || "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!standings && <p style={{ ...S.formNote, marginTop: 16 }}>Waiting for the live table…</p>}
    </main>
  );
}

// ── /everyone/:uid — one person's full predicted table ──
function PlayerDetail({ uid }) {
  const { entries, standings, preseason, picksVisible, leaderboard } = useLeague();
  const { user } = useAuth();

  const player = entries.find((e) => e.uid === uid);
  const rank = leaderboard.find((e) => e.uid === uid);
  const isMe = user?.uid === uid;

  if (!player) {
    return (
      <main style={S.main}>
        <SectionHeading title="Player not found" />
        <EmptyState icon="🤷">
          No player with that link.
          <br />
          <PrimaryLink to="/everyone" style={{ marginTop: 16 }}>Back to everyone</PrimaryLink>
        </EmptyState>
      </main>
    );
  }

  if (!player.order || (!picksVisible && !isMe)) {
    return (
      <main style={S.main}>
        <LockBar />
        <SectionHeading title={`${player.name}'s prediction`} />
        <EmptyState icon={player.submitted ? "🔒" : "—"}>
          {player.submitted
            ? "Sealed until predictions lock. No peeking."
            : `${player.name} hasn't submitted a prediction.`}
          <br />
          <PrimaryLink to="/everyone" style={{ marginTop: 16 }}>Back to everyone</PrimaryLink>
        </EmptyState>
      </main>
    );
  }

  const score = preseason ? null : scorePrediction(player.order, standings);
  const teamsByTla = Object.fromEntries((standings || []).map((t) => [t.tla, t]));

  return (
    <main style={S.main}>
      <Link to="/everyone" style={{ color: C.muted, fontSize: 13, textDecoration: "none" }}>← Everyone</Link>

      <div style={{ marginTop: 12 }}>
        <SectionHeading
          title={`${player.name}'s prediction`}
          sub={preseason ? "Locked in and waiting for the season to start." : "Predicted finish next to where each team actually sits."}
        />
      </div>

      {score !== null && (
        <div style={{ ...S.card, marginBottom: 20, display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontFamily: S.mono, fontSize: 32, fontWeight: 700, color: "#fff" }}>{score}</span>
          <span style={{ color: C.muted, fontSize: 13 }}>positions off in total</span>
          {rank && (
            <span style={{ marginLeft: "auto", display: "flex", gap: 14, alignItems: "baseline", fontSize: 13 }}>
              <span style={{ color: C.muted }}>
                rank <strong style={{ color: "#fff", fontFamily: S.mono }}>#{rank.rank}</strong>
              </span>
              <span style={{ color: C.muted }}>
                exact <strong style={{ color: C.green, fontFamily: S.mono }}>{rank.exact}</strong>
              </span>
              <Movement value={rank.movement} />
            </span>
          )}
        </div>
      )}

      <ExtraPicks topScorer={player.topScorer} manager={player.manager} />

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: 48 }}>Pred</th>
              <th style={{ ...S.th, textAlign: "left" }}>Team</th>
              {!preseason && <th style={S.th}>Actual</th>}
              {!preseason && <th style={S.th}>Diff</th>}
            </tr>
          </thead>
          <tbody>
            {player.order.map((tla, i) => {
              const team = teamsByTla[tla] || { tla, name: tla };
              const actual = standings ? standings.findIndex((t) => t.tla === tla) : -1;
              const diff = actual === -1 ? null : actual - i;
              const zone = zoneOf(i, player.order.length);
              return (
                <tr key={tla} style={{ ...S.tr, ...(i % 2 === 0 ? S.trEven : {}) }}>
                  <td style={S.td}>
                    <span
                      style={{
                        ...S.rankBadge,
                        background: zone ? ZONE_COLOR[zone] : "transparent",
                        color: zone ? "#fff" : C.text,
                      }}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td style={{ ...S.td, textAlign: "left" }}>
                    <div style={S.teamCell}>
                      <Crest team={team} />
                      <span style={S.teamName}>{team.name}</span>
                    </div>
                  </td>
                  {!preseason && (
                    <td style={{ ...S.td, fontFamily: S.mono, fontWeight: 700, color: C.muted }}>
                      {actual === -1 ? "—" : actual + 1}
                    </td>
                  )}
                  {!preseason && (
                    <td style={S.td}>
                      {diff === null ? "—" : (
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: S.mono,
                            background:
                              diff === 0 ? "rgba(34,197,94,0.15)"
                              : Math.abs(diff) <= 2 ? "rgba(250,204,21,0.15)"
                              : "rgba(239,68,68,0.15)",
                            color: diff === 0 ? C.green : Math.abs(diff) <= 2 ? C.amber : C.red,
                          }}
                        >
                          {diff === 0 ? "✓" : diff > 0 ? `↓ ${diff}` : `↑ ${Math.abs(diff)}`}
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
