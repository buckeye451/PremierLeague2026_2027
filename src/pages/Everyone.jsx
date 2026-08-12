import { Link, useParams } from "react-router-dom";
import { S, C } from "../styles.js";
import { useLeague } from "../league.jsx";
import { useAuth } from "../auth.jsx";
import { EmptyState, LockBar, Movement, PrimaryLink, SectionHeading } from "../components/ui.jsx";
import { IconArrowLeft } from "../components/icons.jsx";
import { scorePrediction } from "../scoring.js";
import { ExtraPicks, ReadOnlyPrediction } from "./Predictions.jsx";

export default function Everyone() {
  const { uid } = useParams();
  const { members, entries, leaderboard, preseason, picksVisible } = useLeague();
  const { user } = useAuth();

  if (uid) return <PlayerDetail uid={uid} />;

  const rankOf = Object.fromEntries(leaderboard.map((e) => [e.uid, e]));

  if (members.length === 0) {
    return (
      <main style={S.main}>
        <LockBar />
        <SectionHeading title="Everyone" />
        <EmptyState>
          Nobody's joined yet. Be the first.
          <div style={{ marginTop: 16 }}>
            <PrimaryLink to={user ? "/predictions" : "/login"}>
              {user ? "Make your prediction" : "Create an account"}
            </PrimaryLink>
          </div>
        </EmptyState>
      </main>
    );
  }

  // Leaderboard order once there's something to rank against.
  const rows = !preseason && picksVisible
    ? [...entries].sort((a, b) => (rankOf[a.uid]?.rank ?? 999) - (rankOf[b.uid]?.rank ?? 999))
    : entries;

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

      <div style={S.list}>
        {rows.map((p, i) => {
          const rank = rankOf[p.uid];
          const isMe = user?.uid === p.uid;
          const canOpen = (picksVisible || isMe) && p.order;

          const body = (
            <>
              <span className="u-num" style={S.listRank}>{picksVisible && !preseason ? `${rank?.rank ?? i + 1}.` : `${i + 1}.`}</span>

              <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <span style={S.listName}>
                  {p.name}
                  {isMe && <span style={{ color: C.n600, fontWeight: 400, fontSize: 12 }}> (you)</span>}
                </span>
                {canOpen && (p.topScorer || p.manager) && (
                  <span style={S.listMeta}>
                    {[p.topScorer, p.manager].filter(Boolean).join(" · ")}
                  </span>
                )}
              </span>

              <span style={{ marginLeft: "auto", display: "flex", alignItems: "baseline", gap: 6, flexShrink: 0 }}>
                {!p.submitted ? (
                  <span style={{ fontSize: 12, color: C.n600 }}>No prediction submitted</span>
                ) : !canOpen ? (
                  <span style={{ fontSize: 12, color: C.n600 }}>Sealed until the deadline</span>
                ) : preseason ? (
                  <span style={{ fontSize: 12, color: C.n600 }}>Prediction in</span>
                ) : (
                  <>
                    <Movement value={rank?.movement} style={{ fontSize: 11 }} />
                    <span className="u-num" style={S.listScore}>{rank?.score ?? "—"}</span>
                    <span style={S.offLabel}>off</span>
                  </>
                )}
              </span>
            </>
          );

          return canOpen ? (
            <Link key={p.uid} to={`/everyone/${p.uid}`} className="row-link u-tap" style={S.listRow}>
              {body}
            </Link>
          ) : (
            <div key={p.uid} style={{ ...S.listRow, opacity: p.submitted ? 1 : 0.65 }}>{body}</div>
          );
        })}
      </div>

      {/* Side-by-side comparison of the two free-text calls. */}
      {picksVisible && entries.some((e) => e.topScorer || e.manager) && (
        <div style={{ marginTop: 28 }}>
          <h4 style={S.h4}>Golden Boot &amp; Manager calls</h4>
          <p style={{ ...S.sectionSub, marginBottom: 12 }}>Settled by argument, not by the scoreboard.</p>

          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, padding: "8px 6px 8px 0" }}>Player</th>
                  <th style={S.th}>Golden Boot</th>
                  <th style={{ ...S.th, padding: "8px 0 8px 6px" }}>Manager</th>
                </tr>
              </thead>
              <tbody>
                {entries
                  .filter((e) => e.submitted)
                  .map((e) => (
                    <tr key={e.uid}>
                      <td style={{ ...S.td, padding: "9px 6px 9px 0", fontFamily: S.font, fontWeight: 800 }}>
                        {e.name}
                      </td>
                      <td style={{ ...S.td, padding: "9px 6px", color: C.n800 }}>{e.topScorer || "—"}</td>
                      <td style={{ ...S.td, padding: "9px 0 9px 6px", color: C.n800 }}>{e.manager || "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}

// ── /everyone/:uid ──
function PlayerDetail({ uid }) {
  const { entries, standings, preseason, picksVisible, leaderboard } = useLeague();
  const { user } = useAuth();

  const player = entries.find((e) => e.uid === uid);
  const rank = leaderboard.find((e) => e.uid === uid);
  const isMe = user?.uid === uid;

  const back = (
    <Link
      to="/everyone"
      className="nav-item u-tap"
      style={{ display: "inline-flex", alignItems: "center", gap: 6, ...S.kicker, marginBottom: 12, textDecoration: "none" }}
    >
      <IconArrowLeft size={12} />
      Everyone
    </Link>
  );

  if (!player) {
    return (
      <main style={S.main}>
        <SectionHeading title="Player not found" />
        <EmptyState>
          No player with that link.
          <div style={{ marginTop: 16 }}><PrimaryLink to="/everyone">Back to everyone</PrimaryLink></div>
        </EmptyState>
      </main>
    );
  }

  if (!player.order || (!picksVisible && !isMe)) {
    return (
      <main style={S.main}>
        <LockBar />
        {back}
        <SectionHeading title={`${player.name}'s prediction`} />
        <EmptyState>
          {player.submitted
            ? "Sealed until predictions lock. No peeking."
            : `${player.name} hasn't submitted a prediction.`}
        </EmptyState>
      </main>
    );
  }

  const score = preseason ? null : scorePrediction(player.order, standings);
  const teamsByTla = Object.fromEntries((standings || []).map((t) => [t.tla, t]));

  return (
    <main style={S.main}>
      {back}
      <SectionHeading
        title={`${player.name}'s prediction`}
        sub={
          preseason
            ? "Locked in and waiting for the season to start."
            : "Predicted finish next to where each team actually sits."
        }
      />

      {score !== null && (
        <div style={{ ...S.block, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <span className="u-num" style={S.bigScore}>{score}</span>
            <span style={{ fontSize: 13, color: C.n700 }}>positions off in total</span>
            {rank && (
              <span style={{ marginLeft: "auto", display: "flex", gap: 14, alignItems: "baseline", fontSize: 13, color: C.n700 }}>
                <span>rank <strong style={S.strong}>{rank.rank}</strong></span>
                <span>exact <strong style={S.strong}>{rank.exact}</strong></span>
                <Movement value={rank.movement} style={{ fontSize: 13 }} />
              </span>
            )}
          </div>
        </div>
      )}

      <ExtraPicks topScorer={player.topScorer} manager={player.manager} />
      <ReadOnlyPrediction order={player.order} standings={standings} preseason={preseason} teamsByTla={teamsByTla} />
    </main>
  );
}
