import { Link } from "react-router-dom";
import { S, C } from "../styles.js";
import { useLeague } from "../league.jsx";
import { useAuth } from "../auth.jsx";
import { EmptyState, LockBar, Movement, PrimaryLink, SectionHeading } from "../components/ui.jsx";

export default function Leaderboard() {
  const { leaderboard, preseason, picksVisible, snapshot, members } = useLeague();
  const { user } = useAuth();

  return (
    <main style={S.main}>
      <LockBar />
      <SectionHeading
        title="Leaderboard"
        sub="Total positions off across all 20 teams. Lower is better — a perfect table scores zero."
      />

      {preseason ? (
        <EmptyState icon="⏱️">
          The leaderboard wakes up once matches start being played.
          <br />
          {members.length > 0
            ? `${members.length} ${members.length === 1 ? "person is" : "people are"} in so far.`
            : "Nobody has joined yet."}
          <br />
          <PrimaryLink to={user ? "/predictions" : "/login"} style={{ marginTop: 16 }}>
            {user ? "Check your prediction" : "Create an account"}
          </PrimaryLink>
        </EmptyState>
      ) : !picksVisible ? (
        <EmptyState icon="🔒">
          Scores appear when predictions lock. Until then everyone's picks — and everyone's standing — stay hidden.
        </EmptyState>
      ) : leaderboard.length === 0 ? (
        <EmptyState icon="🏆">
          No predictions were submitted before the deadline, so there's nothing to rank.
        </EmptyState>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {leaderboard.map((e) => {
              const isMe = user?.uid === e.uid;
              return (
                <Link
                  key={e.uid}
                  to={`/everyone/${e.uid}`}
                  style={{
                    ...S.card,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                    padding: "16px 20px",
                    textDecoration: "none",
                    ...(e.rank === 1
                      ? {
                          background: "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(99,102,241,0.05) 100%)",
                          border: `1px solid rgba(139,92,246,0.35)`,
                        }
                      : {}),
                    ...(isMe && e.rank !== 1 ? { border: `1px solid rgba(139,92,246,0.25)` } : {}),
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 20, minWidth: 38, fontFamily: S.mono, color: C.muted }}>
                      {e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : e.rank === 3 ? "🥉" : `#${e.rank}`}
                    </span>
                    <span style={{ fontWeight: 600, color: C.textBright, fontSize: 15 }}>
                      {e.name}
                      {isMe && <span style={{ color: C.accentSoft, fontSize: 11, marginLeft: 6 }}>(you)</span>}
                    </span>
                  </span>

                  <span style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    {e.exact > 0 && (
                      <span style={{ fontSize: 11, color: C.green }}>
                        {e.exact} exact
                      </span>
                    )}
                    <Movement value={e.movement} style={{ fontSize: 12 }} />
                    <span style={{ fontFamily: S.mono, fontSize: 24, fontWeight: 700, color: "#fff" }}>{e.score}</span>
                    <span style={{ fontSize: 11, color: C.mutedDim }}>off</span>
                  </span>
                </Link>
              );
            })}
          </div>

          <div style={{ ...S.card, marginTop: 24, fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
            <strong style={{ color: C.textBright }}>How scoring works</strong>
            <br />
            Every team you picked is compared to where it actually sits. Predict Arsenal 1st and they're 3rd, that's 3
            points. Add up all 20 and that's your score, so <em>lower is better</em> and a perfect table is 0.
            <br />
            <br />
            <strong style={{ color: C.textBright }}>Tie-breaker</strong> — most teams placed in exactly the right spot.
            <br />
            <strong style={{ color: C.textBright }}>The ▲▼ arrows</strong> —{" "}
            {snapshot
              ? `how your score has moved since matchday ${snapshot.matchday}. Green means you're closing in.`
              : "movement since the previous matchday, once a full matchday has been played."}
          </div>
        </>
      )}
    </main>
  );
}
