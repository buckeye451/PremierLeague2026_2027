import { S, C, ZONE_COLOR, zoneOf } from "../styles.js";
import { useLeague } from "../league.jsx";
import { Crest, SectionHeading, ZoneLegend } from "../components/ui.jsx";
import { SEASON_LABEL } from "../config.js";

const FORM_COLOR = { W: C.green, D: C.amber, L: C.red };

export default function Table() {
  const { standings, preseason, lastRefresh } = useLeague();
  if (!standings) return <main style={S.main}><SectionHeading title="Premier League Table" sub="Loading…" /></main>;

  return (
    <main style={S.main}>
      <SectionHeading
        title={`Premier League Table ${SEASON_LABEL}`}
        sub={
          preseason
            ? "No matches played yet — these are the 20 teams in this season's Premier League, listed alphabetically."
            : `Live standings, refreshed automatically${lastRefresh ? ` (last updated ${lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})` : ""}.`
        }
      />

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: 40 }}>#</th>
              <th style={{ ...S.th, textAlign: "left" }}>Team</th>
              <th style={S.th}>P</th>
              <th style={S.th}>W</th>
              <th style={S.th}>D</th>
              <th style={S.th}>L</th>
              <th style={S.th}>GF</th>
              <th style={S.th}>GA</th>
              <th style={S.th}>GD</th>
              <th style={{ ...S.th, color: "#fff" }}>Pts</th>
              {!preseason && <th style={S.th}>Form</th>}
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => {
              const zone = preseason ? null : zoneOf(i, standings.length);
              return (
                <tr key={row.tla} style={{ ...S.tr, ...(i % 2 === 0 ? S.trEven : {}) }}>
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
                      <Crest team={row} />
                      <span style={S.teamName}>{row.name}</span>
                      <span style={S.teamAbbr}>{row.tla}</span>
                    </div>
                  </td>
                  <td style={S.td}>{row.played}</td>
                  <td style={S.td}>{row.won}</td>
                  <td style={S.td}>{row.draw}</td>
                  <td style={S.td}>{row.lost}</td>
                  <td style={S.td}>{row.gf}</td>
                  <td style={S.td}>{row.ga}</td>
                  <td style={{ ...S.td, color: row.gd > 0 ? C.green : row.gd < 0 ? C.red : "#8a8f98" }}>
                    {row.gd > 0 ? `+${row.gd}` : row.gd}
                  </td>
                  <td style={{ ...S.td, fontWeight: 700, color: "#fff", fontFamily: S.mono }}>{row.pts}</td>
                  {!preseason && (
                    <td style={S.td}>
                      <span style={{ display: "inline-flex", gap: 3 }}>
                        {(row.form || "").split(",").filter(Boolean).slice(-5).map((r, k) => (
                          <span
                            key={k}
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: 3,
                              fontSize: 9,
                              fontWeight: 700,
                              fontFamily: S.mono,
                              color: "#fff",
                              background: FORM_COLOR[r] || C.line2,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {r}
                          </span>
                        ))}
                      </span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!preseason && <ZoneLegend />}
    </main>
  );
}
