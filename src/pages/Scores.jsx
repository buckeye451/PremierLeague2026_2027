import { S, C } from "../styles.js";
import { useLeague } from "../league.jsx";
import { Crest, Kicker, SectionHeading } from "../components/ui.jsx";

const dayLabel = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

const timeLabel = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function Scores() {
  const { matches } = useLeague();
  const { live, recent, upcoming } = matches;
  const nothing = live.length === 0 && recent.length === 0 && upcoming.length === 0;

  return (
    <main style={S.main}>
      <SectionHeading title="Match centre" sub="Live scores, recent results and what's coming up." />

      {nothing && (
        <p style={{ fontSize: 13, color: C.n700, lineHeight: 1.5 }}>
          No fixtures to show yet. Once football-data.org publishes the 2026/27 fixture list, it'll appear here.
        </p>
      )}

      {live.length > 0 && (
        <section>
          <Kicker accent>Live now</Kicker>
          <div style={{ borderTop: `2px solid ${C.accent}`, marginBottom: 24 }}>
            {live.map((m) => (
              <div key={m.id} style={row}>
                <TeamPair m={m} />
                <span className="u-num" style={scoreCol}>
                  <span>{m.homeScore ?? "-"}</span>
                  <span>{m.awayScore ?? "-"}</span>
                </span>
                <span
                  className="u-num"
                  style={{ width: 38, textAlign: "right", fontFamily: S.font, fontWeight: 800, fontSize: 11, color: C.accent }}
                >
                  {m.minute ? `${m.minute}'` : "LIVE"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section>
          <Kicker>Recent results</Kicker>
          <div style={{ borderTop: S.RULE_INK, marginBottom: 24 }}>
            {recent.map((m) => {
              const homeWin = m.homeScore > m.awayScore;
              const awayWin = m.awayScore > m.homeScore;
              const tone = (win, lose) => (win ? C.text : lose ? C.n600 : C.n800);
              return (
                <div key={m.id} style={{ borderBottom: `1px solid ${C.n300}`, padding: "12px 0" }}>
                  <div style={{ ...S.offLabel, marginBottom: 6 }}>{dayLabel(m.date)} · FT</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <TeamPair
                      m={m}
                      homeColor={tone(homeWin, awayWin)}
                      awayColor={tone(awayWin, homeWin)}
                    />
                    <span className="u-num" style={scoreCol}>
                      <span style={{ color: tone(homeWin, awayWin) }}>{m.homeScore}</span>
                      <span style={{ color: tone(awayWin, homeWin) }}>{m.awayScore}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <Kicker>Upcoming fixtures</Kicker>
          <div style={{ borderTop: S.RULE_INK }}>
            {upcoming.map((m) => (
              <div key={m.id} style={row}>
                <TeamPair m={m} />
                <span style={{ textAlign: "right", flexShrink: 0 }}>
                  <span className="u-num" style={{ display: "block", fontFamily: S.font, fontWeight: 800, fontSize: 15 }}>
                    {timeLabel(m.date)}
                  </span>
                  <span style={{ ...S.offLabel, display: "block", marginTop: 2 }}>{dayLabel(m.date)}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

const row = {
  borderBottom: `1px solid ${C.n300}`,
  padding: "12px 0",
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const scoreCol = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  textAlign: "right",
  fontFamily: S.font,
  fontWeight: 800,
  fontSize: 18,
  lineHeight: 1.15,
};

function TeamPair({ m, homeColor, awayColor }) {
  return (
    <span style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: 1 }}>
      <Side team={m.home} color={homeColor} />
      <Side team={m.away} color={awayColor} />
    </span>
  );
}

function Side({ team, color }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      <Crest team={team} size={14} />
      <span style={{ ...S.tla, width: 34 }}>{team.tla}</span>
      <span
        style={{
          fontSize: 13,
          color: color || C.text,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {team.name}
      </span>
    </span>
  );
}
