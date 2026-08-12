import { Link } from "react-router-dom";
import { S, C, ZONE_COLOR, ZONE_LABEL } from "../styles.js";
import { getTeamColor } from "../teams.js";
import { useCountdown } from "../league.jsx";
import { LOCK_AT } from "../config.js";
import { IconLock } from "./icons.jsx";

// Team badge: the real crest when the API has one, otherwise a square in the
// team's colour. Squares throughout — nothing in this design has a radius.
export function Crest({ team, size = 14 }) {
  if (team?.crest) {
    return (
      <img
        src={team.crest}
        alt=""
        style={{ width: size, height: size, objectFit: "contain", flexShrink: 0, display: "block" }}
      />
    );
  }
  return (
    <span
      title={team?.tla}
      style={{ width: size, height: size, background: getTeamColor(team?.tla), display: "inline-block", flexShrink: 0 }}
    />
  );
}

export function LoadingScreen({ message = "Loading…", error }) {
  return (
    <div style={S.loadingScreen}>
      <div style={S.spinner} />
      <p style={{ marginTop: 16, fontSize: 13, color: C.n700 }}>{message}</p>
      {error && (
        <p style={{ ...S.fineprint, marginTop: 8, maxWidth: 420, textAlign: "center", color: C.accent700 }}>{error}</p>
      )}
    </div>
  );
}

// Flat bordered box — the replacement for the old filled cards.
export function EmptyState({ children }) {
  return <div style={{ ...S.boxed, fontSize: 13, color: C.n700, lineHeight: 1.5 }}>{children}</div>;
}

export function SectionHeading({ title, sub, children }) {
  if (!children) {
    return (
      <>
        <h3 style={S.h3}>{title}</h3>
        {sub && <p style={S.sectionSub}>{sub}</p>}
      </>
    );
  }
  return (
    <div style={S.sectionHead}>
      <div>
        <h3 style={S.h3}>{title}</h3>
        {sub && <p style={{ ...S.sectionSub, marginBottom: 0 }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export function Kicker({ children, accent = false }) {
  return (
    <div style={{ ...S.kicker, ...(accent ? { color: C.accent, display: "flex", alignItems: "center", gap: 8 } : {}) }}>
      {accent && <span style={S.liveMark} />}
      {children}
    </div>
  );
}

// "Fri 21 Aug, 8:00 PM" — assembled from parts rather than a locale string so
// the separators don't drift with the viewer's locale.
export const LOCK_LABEL = (() => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(new Date(LOCK_AT));
  const get = (type) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday")} ${get("day")} ${get("month")}, ${get("hour")}:${get("minute")} ${get("dayPeriod").toUpperCase()}`;
})();

const pad = (n) => String(n).padStart(2, "0");

export function LockBar() {
  const cd = useCountdown(LOCK_AT);

  if (cd.expired) {
    return (
      <div style={S.lockClosed}>
        <IconLock size={14} />
        <span>
          <strong style={S.strong}>Predictions locked.</strong>{" "}
          <span style={{ color: C.n700 }}>Deadline passed {LOCK_LABEL} ET.</span>
        </span>
      </div>
    );
  }

  return (
    <div style={S.lockOpen}>
      <span>
        Predictions lock <strong style={S.strong}>{LOCK_LABEL} ET</strong>
      </span>
      <span style={S.countdown}>
        {cd.days}d {pad(cd.hours)}:{pad(cd.minutes)}:{pad(cd.seconds)}
      </span>
    </div>
  );
}

export function ZoneLegend({ showExact = false }) {
  return (
    <div style={S.legendRow}>
      {["cl", "el", "ecl", "rel"].map((z) => (
        <span key={z} style={S.legendItem}>
          <span style={{ ...S.legendBar, background: ZONE_COLOR[z] }} />
          {ZONE_LABEL[z]}
        </span>
      ))}
      {showExact && (
        <span style={S.legendItem}>
          <span style={{ width: 12, height: 12, background: C.accent200, display: "inline-block" }} />
          Exact match
        </span>
      )}
    </div>
  );
}

// Score movement. Negative means the gap to the real table shrank — an
// improvement. Direction is carried by the glyph, not by colour.
export function Movement({ value, style }) {
  if (value === null || value === undefined || value === 0) return null;
  const better = value < 0;
  return (
    <span
      className="u-num"
      style={{ fontFamily: S.font, fontWeight: 800, color: better ? C.text : C.n600, ...style }}
    >
      {better ? "▲" : "▼"}
      {Math.abs(value)}
    </span>
  );
}

export function PrimaryLink({ to, children, style }) {
  return (
    <Link
      to={to}
      className="btn-primary u-tap"
      style={{ ...S.btnPrimary, textDecoration: "none", display: "inline-block", ...style }}
    >
      {children}
    </Link>
  );
}
