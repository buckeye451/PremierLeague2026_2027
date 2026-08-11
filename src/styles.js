// Shared inline-style objects. Same visual language as the 2025/26 app:
// near-black background, violet accent, DM Sans for text and Space Mono for
// anything numeric.

export const C = {
  bg: "#0c0e14",
  panel: "#111422",
  panelAlt: "#0f1119",
  line: "#1e2230",
  line2: "#2a2f40",
  text: "#c4c9d4",
  textBright: "#e2e5eb",
  muted: "#6b7086",
  mutedDim: "#4a4f5e",
  accent: "#8b5cf6",
  accentSoft: "#c4b5fd",
  green: "#22c55e",
  red: "#ef4444",
  amber: "#facc15",
  blue: "#2563eb",
};

const mono = "'Space Mono', ui-monospace, monospace";
const sans = "'DM Sans', system-ui, sans-serif";

export const S = {
  mono,
  sans,

  // ── Shell ──
  root: { fontFamily: sans, background: C.bg, minHeight: "100vh", color: C.text },
  shell: { maxWidth: 1200, margin: "0 auto" },
  main: { padding: "24px 20px 72px" },
  mainWide: { padding: "24px 12px 72px" },

  loadingScreen: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: C.bg,
  },
  spinner: {
    width: 36,
    height: 36,
    border: `3px solid ${C.line}`,
    borderTop: `3px solid ${C.accent}`,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  banner: {
    padding: "10px 20px",
    fontSize: 13,
    textAlign: "center",
    borderBottom: `1px solid rgba(239,68,68,0.3)`,
    background: "rgba(239,68,68,0.12)",
    color: "#fca5a5",
  },

  // ── Header ──
  header: {
    background: "linear-gradient(135deg, #111422 0%, #1a1d2e 100%)",
    borderBottom: `1px solid ${C.line}`,
    padding: "18px 24px",
  },
  headerInner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 14, textDecoration: "none" },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: `linear-gradient(135deg, ${C.accent}, #6366f1)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    flexShrink: 0,
  },
  logoIcon: { filter: "grayscale(1) brightness(10)" },
  title: { fontFamily: mono, fontSize: 19, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.5px" },
  subtitle: { fontSize: 12, color: C.muted, margin: 0 },
  headerRight: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },

  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11,
    fontWeight: 700,
    color: C.red,
    fontFamily: mono,
    letterSpacing: 1,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: C.red,
    boxShadow: "0 0 8px rgba(239,68,68,0.5)",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  weekBadge: {
    background: C.line,
    color: "#8a8f98",
    fontSize: 11,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 6,
    fontFamily: mono,
  },
  refreshBtn: {
    background: "rgba(34,197,94,0.1)",
    color: C.green,
    fontSize: 10,
    fontWeight: 600,
    padding: "5px 10px",
    borderRadius: 6,
    border: "1px solid rgba(34,197,94,0.2)",
    cursor: "pointer",
    fontFamily: sans,
  },
  userChip: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(139,92,246,0.12)",
    border: `1px solid rgba(139,92,246,0.35)`,
    color: C.accentSoft,
    fontSize: 12,
    fontWeight: 600,
    padding: "5px 12px",
    borderRadius: 20,
    textDecoration: "none",
  },
  signOutBtn: {
    background: "none",
    border: "none",
    color: C.muted,
    fontSize: 11,
    cursor: "pointer",
    fontFamily: sans,
    textDecoration: "underline",
    padding: 0,
  },

  // ── Nav ──
  navBar: {
    display: "flex",
    borderBottom: `1px solid ${C.line}`,
    background: C.panelAlt,
    overflowX: "auto",
    position: "sticky",
    top: 0,
    zIndex: 20,
  },
  navLink: {
    flex: "1 0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "13px 14px",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    color: C.muted,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: sans,
    whiteSpace: "nowrap",
    textDecoration: "none",
  },
  navLinkActive: { color: "#fff", borderBottomColor: C.accent, background: "rgba(139,92,246,0.06)" },

  // ── Section headings ──
  sectionTitle: { fontFamily: mono, fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 4px" },
  sectionSub: { fontSize: 13, color: C.muted, margin: "0 0 20px", lineHeight: 1.5 },
  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 12,
  },

  // ── Tables ──
  tableWrap: { overflowX: "auto", borderRadius: 10, border: `1px solid ${C.line}`, background: C.panel },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "10px 12px",
    textAlign: "center",
    fontSize: 10,
    fontWeight: 700,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottom: `1px solid ${C.line}`,
    fontFamily: mono,
    whiteSpace: "nowrap",
  },
  tr: { transition: "background 0.15s" },
  trEven: { background: "rgba(255,255,255,0.015)" },
  trDragOver: { background: "rgba(139,92,246,0.14)", outline: `1px dashed ${C.accent}` },
  td: { padding: "9px 12px", textAlign: "center", borderBottom: "1px solid rgba(30,34,48,0.5)" },

  rankBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
    fontFamily: mono,
  },
  teamCell: { display: "flex", alignItems: "center", gap: 8 },
  teamDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0, display: "inline-block" },
  crest: { width: 20, height: 20, objectFit: "contain", flexShrink: 0 },
  crestSmall: { width: 18, height: 18, objectFit: "contain", flexShrink: 0 },
  teamName: { fontWeight: 500, color: C.textBright },
  teamAbbr: { fontSize: 10, color: C.mutedDim, fontFamily: mono },

  legendRow: { display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" },
  legendItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.muted },
  legendDot: { width: 8, height: 8, borderRadius: 3 },

  // ── Buttons ──
  btn: {
    background: C.line,
    color: C.text,
    border: `1px solid ${C.line2}`,
    padding: "9px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: sans,
  },
  btnPrimary: {
    background: `linear-gradient(135deg, ${C.accent}, #6366f1)`,
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: sans,
  },
  btnActive: { background: "rgba(34,197,94,0.15)", borderColor: C.green, color: C.green },
  btnToggleOn: { background: "rgba(139,92,246,0.15)", borderColor: C.accent, color: C.accentSoft },
  btnDisabled: { opacity: 0.45, cursor: "not-allowed" },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 5,
    border: `1px solid ${C.line2}`,
    background: C.line,
    color: C.text,
    fontSize: 10,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Cards / panels ──
  card: { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 20 },
  emptyState: { textAlign: "center", padding: "56px 20px" },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyText: { color: C.muted, fontSize: 14, lineHeight: 1.6, margin: 0 },

  // ── Forms ──
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    fontFamily: mono,
  },
  input: {
    width: "100%",
    background: C.bg,
    border: `1px solid ${C.line2}`,
    color: "#fff",
    padding: "12px 14px",
    borderRadius: 8,
    fontSize: 15,
    outline: "none",
    fontFamily: sans,
  },
  pinInput: { letterSpacing: 10, fontFamily: mono, fontSize: 20, textAlign: "center" },
  formError: {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    lineHeight: 1.5,
  },
  formNote: { fontSize: 12, color: C.muted, lineHeight: 1.6, margin: 0 },

  // ── Lock / countdown ──
  lockBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    padding: "12px 18px",
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 13,
  },
  lockOpen: {
    background: "rgba(139,92,246,0.1)",
    border: `1px solid rgba(139,92,246,0.3)`,
    color: C.accentSoft,
  },
  lockClosed: {
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.25)",
    color: "#fca5a5",
  },
  countdownNum: { fontFamily: mono, fontWeight: 700, color: "#fff", fontSize: 15 },

  footer: {
    textAlign: "center",
    padding: 20,
    fontSize: 11,
    color: "#3a3f4e",
    borderTop: `1px solid ${C.line}`,
    lineHeight: 1.8,
  },
};

// ── The comparison grid ──
// Live table on the left (frozen while you scroll sideways), one column per
// player to the right.
const stickyHead = {
  padding: "8px 8px",
  fontSize: 9,
  fontWeight: 700,
  color: C.muted,
  textTransform: "uppercase",
  letterSpacing: 0.8,
  borderBottom: `2px solid ${C.line}`,
  fontFamily: mono,
  background: C.panelAlt,
  position: "sticky",
  top: 0,
  whiteSpace: "nowrap",
};

export const G = {
  wrap: {
    overflowX: "auto",
    overflowY: "visible",
    borderRadius: 10,
    border: `1px solid ${C.line}`,
    background: C.panel,
  },
  table: { width: "max-content", minWidth: "100%", borderCollapse: "collapse", fontSize: 12 },

  th: { ...stickyHead, textAlign: "center", zIndex: 2 },
  thPos: { ...stickyHead, textAlign: "center", left: 0, zIndex: 4, width: 34, minWidth: 34 },
  thTeam: { ...stickyHead, textAlign: "left", left: 34, zIndex: 4, minWidth: 130 },
  thPlayer: {
    padding: "6px 8px",
    textAlign: "center",
    borderBottom: `2px solid ${C.line}`,
    background: C.panelAlt,
    position: "sticky",
    top: 0,
    zIndex: 2,
    minWidth: 58,
  },

  playerName: {
    fontSize: 10,
    fontWeight: 700,
    color: C.accentSoft,
    fontFamily: mono,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 80,
  },
  playerScore: { fontSize: 9, color: C.muted, fontFamily: mono, marginTop: 2 },
  playerRank: { fontSize: 10, marginBottom: 2, lineHeight: 1 },

  td: {
    padding: "5px 8px",
    textAlign: "center",
    borderBottom: "1px solid rgba(30,34,48,0.5)",
    fontSize: 11,
    color: C.text,
  },
  tdPos: {
    padding: "5px 6px",
    textAlign: "center",
    borderBottom: "1px solid rgba(30,34,48,0.5)",
    background: C.bg,
    position: "sticky",
    left: 0,
    zIndex: 1,
    width: 34,
    minWidth: 34,
  },
  tdTeam: {
    padding: "5px 10px",
    textAlign: "left",
    borderBottom: "1px solid rgba(30,34,48,0.5)",
    background: C.bg,
    position: "sticky",
    left: 34,
    zIndex: 1,
    minWidth: 130,
    whiteSpace: "nowrap",
  },
  divider: { borderRight: `2px solid ${C.accent}` },
  cellCentre: { display: "flex", alignItems: "center", justifyContent: "center" },
  hit: { background: "rgba(34,197,94,0.18)" },
  near: { background: "rgba(250,204,21,0.07)" },
};

// Zone colours for CL / EL / relegation stripes.
export function zoneOf(index, total) {
  if (index < 4) return "cl";
  if (index === 4) return "el";
  if (index === 5) return "ecl";
  if (index >= total - 3) return "rel";
  return null;
}

export const ZONE_COLOR = {
  cl: "#1a6b3c",
  el: "#2563eb",
  ecl: "#f59e0b",
  rel: "#dc2626",
};

// Inject the couple of things inline styles can't do.
if (typeof document !== "undefined" && !document.getElementById("epl-global-css")) {
  const el = document.createElement("style");
  el.id = "epl-global-css";
  el.textContent = `
    @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.4 } }
    @keyframes spin { to { transform: rotate(360deg) } }
    * { box-sizing: border-box }
    body { margin:0; background:${C.bg}; -webkit-text-size-adjust:100% }
    a { color: inherit }
    input:focus { border-color:${C.accent} !important }
    button:not(:disabled):hover { filter: brightness(1.15) }
    ::-webkit-scrollbar { width:6px; height:6px }
    ::-webkit-scrollbar-track { background:transparent }
    ::-webkit-scrollbar-thumb { background:${C.line2}; border-radius:3px }
  `;
  document.head.appendChild(el);
}
