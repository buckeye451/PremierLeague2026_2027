import { S, C, FORM_CHIP, ZONE_COLOR, zoneOf } from "../styles.js";
import { useLeague } from "../league.jsx";
import { Crest, SectionHeading, ZoneLegend } from "../components/ui.jsx";

export default function Table() {
  const { standings, preseason, lastRefresh } = useLeague();

  if (!standings) {
    return (
      <main style={S.main}>
        <SectionHeading title="Premier League table" sub="Loading…" />
      </main>
    );
  }

  return (
    <main style={S.main}>
      <SectionHeading
        title="Premier League table"
        sub={
          preseason
            ? "No matches played yet — these are the 20 teams in this season's Premier League, listed alphabetically."
            : `Live standings, refreshed automatically.${
                lastRefresh ? ` Last updated ${lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.` : ""
              }`
        }
      />

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: 28 }}>#</th>
              <th style={S.th}>Team</th>
              <th style={S.thNum}>Pl</th>
              <th style={S.thNum}>W</th>
              <th style={S.thNum}>D</th>
              <th style={S.thNum}>L</th>
              <th style={S.thNum}>GD</th>
              <th style={{ ...S.thNum, padding: "8px 6px 8px 4px", color: C.text }}>Pts</th>
              {!preseason && <th style={S.th}>Form</th>}
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => {
              const zone = preseason ? null : zoneOf(i, standings.length);
              return (
                <tr key={row.tla}>
                  <td
                    className="u-num"
                    style={{ ...S.posCell, borderLeft: `3px solid ${zone ? ZONE_COLOR[zone] : "transparent"}` }}
                  >
                    {i + 1}
                  </td>
                  <td style={S.td}>
                    <span style={S.teamRow}>
                      <Crest team={row} size={14} />
                      <span style={S.tla}>{row.tla}</span>
                    </span>
                  </td>
                  <td style={S.tdNum}>{row.played}</td>
                  <td style={S.tdNum}>{row.won}</td>
                  <td style={S.tdNum}>{row.draw}</td>
                  <td style={S.tdNum}>{row.lost}</td>
                  <td style={{ ...S.tdNum, color: row.gd < 0 ? C.accent700 : C.n800 }}>
                    {row.gd > 0 ? `+${row.gd}` : row.gd}
                  </td>
                  <td
                    style={{
                      ...S.tdNum,
                      padding: "7px 6px 7px 4px",
                      fontFamily: S.font,
                      fontWeight: 800,
                      color: C.text,
                    }}
                  >
                    {row.pts}
                  </td>
                  {!preseason && (
                    <td style={S.td}>
                      <span style={{ display: "inline-flex", gap: 2 }}>
                        {(row.form || "")
                          .split(",")
                          .filter(Boolean)
                          .slice(-5)
                          .map((r, k) => (
                            <span
                              key={k}
                              style={{
                                width: 14,
                                height: 14,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: S.font,
                                fontWeight: 800,
                                fontSize: 9,
                                ...(FORM_CHIP[r] || FORM_CHIP.D),
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
