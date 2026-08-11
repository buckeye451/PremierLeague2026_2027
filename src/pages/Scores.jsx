import { S, C } from "../styles.js";
import { useLeague } from "../league.jsx";
import { Crest, EmptyState, SectionHeading } from "../components/ui.jsx";

const dayLabel = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" });

const timeLabel = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function Scores() {
  const { matches } = useLeague();
  const { live, recent, upcoming } = matches;
  const nothing = live.length === 0 && recent.length === 0 && upcoming.length === 0;

  return (
    <main style={S.main}>
      <SectionHeading title="Match Centre" sub="Live scores, recent results and what's coming up." />

      {nothing && (
        <EmptyState icon="⚽">
          No fixtures to show yet. Once football-data.org publishes the 2026/27 fixture list, it'll appear here.
        </EmptyState>
      )}

      {live.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 700,
              color: C.red,
              marginBottom: 12,
              fontFamily: S.mono,
              letterSpacing: 1,
            }}
          >
            <span style={S.liveDot} /> LIVE NOW
          </div>
          <Grid>
            {live.map((m) => (
              <Card key={m.id} live>
                <MatchRow m={m} />
                <div style={{ ...footLabel, color: C.red, display: "flex", justifyContent: "center", gap: 6 }}>
                  <span style={{ ...S.liveDot, width: 6, height: 6 }} />
                  {m.minute ? `${m.minute}'` : "In progress"}
                </div>
              </Card>
            ))}
          </Grid>
        </section>
      )}

      {recent.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <Subhead>Recent results</Subhead>
          <Grid>
            {recent.map((m) => (
              <Card key={m.id}>
                <DateBadge>{dayLabel(m.date)}</DateBadge>
                <MatchRow m={m} />
                <div style={footLabel}>FT</div>
              </Card>
            ))}
          </Grid>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <Subhead>Upcoming fixtures</Subhead>
          <Grid>
            {upcoming.map((m) => (
              <Card key={m.id}>
                <DateBadge>{dayLabel(m.date)}</DateBadge>
                <MatchRow m={m} />
                <div style={footLabel}>{timeLabel(m.date)}</div>
              </Card>
            ))}
          </Grid>
        </section>
      )}
    </main>
  );
}

const footLabel = {
  fontSize: 10,
  color: C.mutedDim,
  fontFamily: S.mono,
  textAlign: "center",
  marginTop: 8,
  letterSpacing: 2,
};

const Grid = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
    {children}
  </div>
);

const Card = ({ children, live }) => (
  <div
    style={{
      ...S.card,
      padding: 16,
      position: "relative",
      ...(live ? { border: "1px solid rgba(239,68,68,0.3)", boxShadow: "0 0 20px rgba(239,68,68,0.05)" } : {}),
    }}
  >
    {children}
  </div>
);

const DateBadge = ({ children }) => (
  <div style={{ position: "absolute", top: 10, right: 12, fontSize: 10, color: C.mutedDim, fontFamily: S.mono }}>
    {children}
  </div>
);

const Subhead = ({ children }) => (
  <h3 style={{ fontFamily: S.mono, fontSize: 14, color: C.text, margin: "0 0 12px", fontWeight: 600 }}>{children}</h3>
);

function MatchRow({ m }) {
  const played = typeof m.homeScore === "number" && typeof m.awayScore === "number";
  const color = (mine, theirs) =>
    !played ? C.mutedDim : mine > theirs ? C.green : mine < theirs ? C.red : C.amber;

  return (
    <>
      <Side team={m.home} score={played ? m.homeScore : "-"} color={color(m.homeScore, m.awayScore)} />
      <Side team={m.away} score={played ? m.awayScore : "-"} color={color(m.awayScore, m.homeScore)} />
    </>
  );
}

const Side = ({ team, score, color }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", gap: 10 }}>
    <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      <Crest team={team} size={18} />
      <span style={{ fontWeight: 500, color: C.textBright, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {team.name}
      </span>
    </span>
    <span style={{ fontFamily: S.mono, fontSize: 20, fontWeight: 700, color, flexShrink: 0 }}>{score}</span>
  </div>
);
