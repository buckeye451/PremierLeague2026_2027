import { Link } from "react-router-dom";
import { S, C, ZONE_COLOR } from "../styles.js";
import { getTeamColor } from "../teams.js";
import { useCountdown } from "../league.jsx";
import { LOCK_AT } from "../config.js";

// Team badge — real crest when the API gives us one, a coloured dot when it
// doesn't (which is the case for promoted sides before the season opens).
export function Crest({ team, size = 20 }) {
  if (team?.crest) {
    return <img src={team.crest} alt="" style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }} />;
  }
  return (
    <span
      title={team?.tla}
      style={{ ...S.teamDot, width: size * 0.6, height: size * 0.6, background: getTeamColor(team?.tla) }}
    />
  );
}

export function LoadingScreen({ message = "Loading…", error }) {
  return (
    <div style={S.loadingScreen}>
      <div style={S.spinner} />
      <p style={{ color: "#8a8f98", marginTop: 16, fontFamily: S.sans }}>{message}</p>
      {error && (
        <p style={{ color: "#fca5a5", fontSize: 12, marginTop: 8, fontFamily: S.sans, maxWidth: 420, textAlign: "center" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function EmptyState({ icon, children }) {
  return (
    <div style={S.emptyState}>
      <div style={S.emptyIcon}>{icon}</div>
      <p style={S.emptyText}>{children}</p>
    </div>
  );
}

export function SectionHeading({ title, sub, children }) {
  return (
    <div style={S.sectionHead}>
      <div>
        <h2 style={S.sectionTitle}>{title}</h2>
        {sub && <p style={S.sectionSub}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export const LOCK_LABEL = new Date(LOCK_AT).toLocaleString("en-US", {
  timeZone: "America/New_York",
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

// The deadline banner. Counts down before, states the fact after.
export function LockBar({ compact = false }) {
  const cd = useCountdown(LOCK_AT);

  if (cd.expired) {
    return (
      <div style={{ ...S.lockBar, ...S.lockClosed }}>
        <span>🔒 <strong>Predictions are locked.</strong> The deadline passed on {LOCK_LABEL} ET.</span>
      </div>
    );
  }

  return (
    <div style={{ ...S.lockBar, ...S.lockOpen }}>
      <span>
        ⏳ Predictions lock <strong>{LOCK_LABEL} ET</strong>
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {!compact && <span style={{ color: C.muted, fontSize: 12 }}>time left</span>}
        <span style={S.countdownNum}>
          {cd.days}d {String(cd.hours).padStart(2, "0")}h {String(cd.minutes).padStart(2, "0")}m{" "}
          {String(cd.seconds).padStart(2, "0")}s
        </span>
      </span>
    </div>
  );
}

export function ZoneLegend({ showExact = false }) {
  return (
    <div style={S.legendRow}>
      <span style={S.legendItem}><span style={{ ...S.legendDot, background: ZONE_COLOR.cl }} /> Champions League</span>
      <span style={S.legendItem}><span style={{ ...S.legendDot, background: ZONE_COLOR.el }} /> Europa League</span>
      <span style={S.legendItem}><span style={{ ...S.legendDot, background: ZONE_COLOR.ecl }} /> Conference League</span>
      <span style={S.legendItem}><span style={{ ...S.legendDot, background: ZONE_COLOR.rel }} /> Relegation</span>
      {showExact && (
        <span style={S.legendItem}>
          <span style={{ width: 14, height: 14, borderRadius: 3, background: "rgba(34,197,94,0.18)", border: "1px solid rgba(34,197,94,0.35)", display: "inline-block" }} />
          Exact match
        </span>
      )}
    </div>
  );
}

// Score movement arrow. Negative movement means the gap to the real table
// shrank, which is an improvement — so green ▲.
export function Movement({ value, style }) {
  if (value === null || value === undefined || value === 0) return null;
  const better = value < 0;
  return (
    <span style={{ color: better ? C.green : C.red, fontWeight: 700, ...style }}>
      {better ? "▲" : "▼"} {Math.abs(value)}
    </span>
  );
}

export function PrimaryLink({ to, children, style }) {
  return (
    <Link to={to} style={{ ...S.btnPrimary, textDecoration: "none", display: "inline-block", ...style }}>
      {children}
    </Link>
  );
}
