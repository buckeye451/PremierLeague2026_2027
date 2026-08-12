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
        <EmptyState>
          The leaderboard wakes up once matches start being played.
          <br />
          {members.length > 0
            ? `${members.length} ${members.length === 1 ? "person is" : "people are"} in so far.`
            : "Nobody has joined yet."}
          <div style={{ marginTop: 16 }}>
            <PrimaryLink to={user ? "/predictions" : "/login"}>
              {user ? "Check your prediction" : "Create an account"}
            </PrimaryLink>
          </div>
        </EmptyState>
      ) : !picksVisible ? (
        <EmptyState>
          Scores appear when predictions lock. Until then everyone's picks — and everyone's standing — stay hidden.
        </EmptyState>
      ) : leaderboard.length === 0 ? (
        <EmptyState>No predictions were submitted before the deadline, so there's nothing to rank.</EmptyState>
      ) : (
        <>
          <div style={S.list}>
            {leaderboard.map((e) => {
              const isMe = user?.uid === e.uid;
              const leader = e.rank === 1;
              return (
                <Link
                  key={e.uid}
                  to={`/everyone/${e.uid}`}
                  className="row-link u-tap"
                  style={{
                    ...S.listRow,
                    minHeight: 64,
                    padding: "16px 8px 16px 12px",
                    borderLeft: `4px solid ${leader ? C.accent : "transparent"}`,
                  }}
                >
                  <span className="u-num" style={{ ...S.listRank, fontSize: 15, width: 30 }}>{e.rank}.</span>

                  <span style={{ fontFamily: S.font, fontWeight: 800, fontSize: 17, letterSpacing: "-0.01em" }}>
                    {e.name}
                    {isMe && <span style={{ color: C.n600, fontWeight: 400, fontSize: 12 }}> (you)</span>}
                  </span>

                  <span style={{ marginLeft: "auto", display: "flex", alignItems: "baseline", gap: 8 }}>
                    {e.exact > 0 && <span style={{ fontSize: 11, color: C.n600 }}>{e.exact} exact</span>}
                    <Movement value={e.movement} style={{ fontSize: 12 }} />
                    <span
                      className="u-num"
                      style={{ fontFamily: S.font, fontWeight: 800, fontSize: 28, letterSpacing: "-0.03em" }}
                    >
                      {e.score}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>

          <div style={{ marginTop: 24, ...S.blockSoft, fontSize: 13, color: C.n800, lineHeight: 1.65 }}>
            <h4 style={{ ...S.h4, fontSize: 16, marginBottom: 6 }}>How scoring works</h4>
            <p style={{ margin: "0 0 12px" }}>
              Every team you picked is compared to where it actually sits. Predict Arsenal 1st and they're 3rd, that's
              3 points. Add up all 20 — lower is better, a perfect table is 0.
            </p>
            <p style={{ margin: "0 0 4px" }}>
              <strong style={S.strong}>Tie-breaker</strong> — most teams placed in exactly the right spot.
            </p>
            <p style={{ margin: 0 }}>
              <strong style={S.strong}>The ▲▼ arrows</strong> —{" "}
              {snapshot
                ? `how your score has moved since matchday ${snapshot.matchday}. Up means you're closing in.`
                : "movement since the previous matchday, once a full matchday has been played."}
            </p>
          </div>
        </>
      )}
    </main>
  );
}
