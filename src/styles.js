// ─── Modernist ──────────────────────────────────────────────
// White ground, flat, typographic. One family (Archivo), square corners, no
// shadows. Rules do the layout work: 2px ink for structure, 1px greys inside
// tables. The single accent is Premier League purple.

export const C = {
  text: "#201e1d",
  surface: "#ffffff",
  divider: "rgba(32,30,29,0.4)",

  accent: "#3D195B",
  accent100: "#f3eff8",
  accent200: "#e2d8ed",
  accent300: "#c6b2da",
  accent400: "#9c80bb",
  accent500: "#6b4a95",
  accent600: "#2f1246",
  accent700: "#2a1040", // accent-coloured *text* — never `accent` at body size
  accent800: "#1d0b2b",
  accent900: "#150820",

  n100: "#f8f4f4",
  n200: "#eae7e7",
  n300: "#d7d3d3",
  n400: "#bab6b6",
  n500: "#9b9797",
  n600: "#7d7979",
  n700: "#605d5d",
  n800: "#444141",
  n900: "#2d2b2b",
};

const font = "'Archivo', system-ui, sans-serif";
const HEAVY = 800;

// Every numeral in the app is tabular so columns line up.
export const num = { fontVariantNumeric: "tabular-nums", fontFeatureSettings: '"tnum"' };

const heading = (size, tracking) => ({
  fontFamily: font,
  fontWeight: HEAVY,
  fontSize: size,
  ...(tracking !== undefined ? { letterSpacing: tracking } : {}),
});

// Small uppercase label, used for kickers, nav, table headers and meta rows.
const label = (size, tracking, color) => ({
  fontFamily: font,
  fontWeight: HEAVY,
  fontSize: size,
  letterSpacing: tracking,
  textTransform: "uppercase",
  color,
});

const RULE_INK = `2px solid ${C.text}`;
const RULE_DIV = `2px solid ${C.divider}`;
const RULE_HEAD = `1px solid ${C.n300}`;
const RULE_BODY = `1px solid ${C.n200}`;

export const S = {
  font,
  num,
  RULE_INK,
  RULE_DIV,
  RULE_HEAD,
  RULE_BODY,

  // ── Shell ──
  root: { fontFamily: font, background: C.surface, minHeight: "100vh", color: C.text },
  shell: { maxWidth: 1200, margin: "0 auto" },
  main: { padding: 16 },
  mainWide: { padding: 16 },

  loadingScreen: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: C.surface,
    padding: 24,
  },
  spinner: {
    width: 36,
    height: 36,
    border: `3px solid ${C.n200}`,
    borderTop: `3px solid ${C.accent}`,
    animation: "spin 1s linear infinite",
  },

  banner: {
    padding: "10px 16px",
    fontSize: 12,
    lineHeight: 1.45,
    borderBottom: `2px solid ${C.accent}`,
    background: C.accent100,
    color: C.accent800,
  },

  // ── Header ──
  header: { padding: "16px 16px 12px", borderBottom: RULE_INK },
  headerTop: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 },
  wordmark: { ...heading(20, "-0.02em"), lineHeight: 1, margin: 0, textDecoration: "none" },
  seasonTag: { ...label(11, "0.08em", C.accent) },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    flexWrap: "wrap",
    ...label(11, "0.06em", C.n700),
  },
  metaItem: { display: "flex", alignItems: "center", gap: 5 },
  metaDivider: { width: 1, height: 11, background: C.n400, display: "inline-block", flexShrink: 0 },
  liveMark: { width: 7, height: 7, background: C.accent, display: "inline-block", flexShrink: 0 },
  metaButton: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "none",
    border: 0,
    padding: 0,
    cursor: "pointer",
    font: "inherit",
    color: C.n700,
    letterSpacing: "0.06em",
  },

  // ── Nav ──
  navBar: { display: "flex", overflowX: "auto", borderBottom: RULE_DIV },
  navLink: {
    flex: "1 0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    // 10px sides rather than 12: it's the difference between all six items
    // fitting across a 390px phone and "Scores" hanging off the edge.
    padding: "10px 10px 8px",
    minHeight: 52,
    borderBottom: "3px solid transparent",
    color: C.n600,
    textDecoration: "none",
    whiteSpace: "nowrap",
    ...label(10, "0.06em", C.n600),
  },
  navLinkActive: { borderBottomColor: C.accent, color: C.text },

  // ── Headings ──
  h3: { ...heading(22, "-0.02em"), margin: "0 0 2px", lineHeight: 1.12 },
  h4: { ...heading(18), margin: "0 0 2px", lineHeight: 1.15 },
  sectionSub: { margin: "0 0 16px", fontSize: 13, color: C.n700, lineHeight: 1.45 },
  sectionHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, marginBottom: 12 },
  kicker: { ...label(11, "0.08em", C.n700), marginBottom: 8 },

  // ── Tables ──
  tableWrap: { overflowX: "auto", borderTop: RULE_INK },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: {
    padding: "8px 6px",
    textAlign: "left",
    borderBottom: RULE_HEAD,
    background: C.surface,
    whiteSpace: "nowrap",
    ...label(9, "0.08em", C.n700),
  },
  thNum: {
    padding: "8px 4px",
    textAlign: "right",
    borderBottom: RULE_HEAD,
    background: C.surface,
    whiteSpace: "nowrap",
    ...label(9, "0.08em", C.n700),
  },
  td: { padding: "7px 6px", textAlign: "left", borderBottom: RULE_BODY },
  tdNum: { padding: "7px 4px", textAlign: "right", borderBottom: RULE_BODY, color: C.n700, ...num },

  posCell: {
    padding: "7px 6px",
    textAlign: "left",
    borderBottom: RULE_BODY,
    ...heading(11),
    color: C.n600,
    ...num,
  },
  teamChip: { width: 14, height: 14, flexShrink: 0, display: "inline-block" },
  teamRow: { display: "flex", alignItems: "center", gap: 6, minWidth: 0 },
  tla: { ...heading(11, "0.04em"), flexShrink: 0 },
  teamNameSoft: { fontSize: 11, color: C.n700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },

  // ── Ruled lists (Everyone, Leaderboard, Scores) ──
  list: { borderTop: RULE_INK },
  listRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 4px",
    borderBottom: `1px solid ${C.n300}`,
    minHeight: 56,
    textDecoration: "none",
    color: C.text,
  },
  listRank: { ...heading(13), color: C.n600, width: 28, flexShrink: 0, ...num },
  listName: { ...heading(15, "-0.01em") },
  listMeta: { fontSize: 11, color: C.n600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  listScore: { ...heading(24, "-0.02em"), ...num },
  offLabel: { ...label(10, "0.06em", C.n600) },

  // ── Buttons ──
  btnPrimary: {
    border: `1px solid ${C.accent}`,
    background: C.accent,
    color: "#fff",
    padding: "11px 18px",
    minHeight: 44,
    cursor: "pointer",
    textAlign: "left",
    ...heading(12, "0.04em"),
  },
  btnOutline: {
    border: `1px solid ${C.n400}`,
    background: C.surface,
    color: C.text,
    padding: "11px 14px",
    minHeight: 44,
    cursor: "pointer",
    ...heading(12, "0.04em"),
  },
  btnInk: {
    border: `1px solid ${C.text}`,
    background: C.text,
    color: "#fff",
    padding: "7px 10px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    ...label(10, "0.06em", "#fff"),
  },
  btnDisabled: { opacity: 0.45, cursor: "not-allowed" },
  iconBtn: {
    width: 44,
    height: 32,
    border: `1px solid ${C.n400}`,
    background: C.surface,
    color: C.text,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },

  // ── Forms ──
  label: { display: "block", marginBottom: 6, ...label(10, "0.08em", C.n700) },
  input: {
    width: "100%",
    background: C.surface,
    border: `1px solid ${C.n400}`,
    color: C.text,
    padding: 12,
    fontSize: 15,
    fontFamily: font,
    outline: "none",
    borderRadius: 0,
    minHeight: 48,
  },
  inputInvalid: { borderColor: C.accent },
  pinInput: {
    ...heading(22, "12px"),
    textAlign: "center",
    minHeight: 56,
    ...num,
  },
  numberInput: {
    width: 48,
    height: 32,
    border: `1px solid ${C.n400}`,
    background: C.surface,
    color: C.text,
    textAlign: "center",
    outline: "none",
    borderRadius: 0,
    padding: "0 4px",
    ...heading(12),
    ...num,
  },
  formError: {
    border: `2px solid ${C.accent}`,
    color: C.accent800,
    padding: "10px 12px",
    fontSize: 12,
    lineHeight: 1.45,
  },
  fineprint: { fontSize: 11, color: C.n600, lineHeight: 1.7, margin: 0 },

  // ── Lock bar ──
  lockOpen: {
    border: `2px solid ${C.accent}`,
    padding: "10px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 20,
    fontSize: 12,
    lineHeight: 1.4,
  },
  lockClosed: {
    border: RULE_INK,
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    fontSize: 13,
    lineHeight: 1.4,
  },
  countdown: { ...heading(15, "-0.01em"), color: C.accent700, ...num },
  strong: { fontFamily: font, fontWeight: HEAVY },

  // ── Flat blocks (replacing cards) ──
  block: { borderTop: RULE_INK, paddingTop: 16 },
  blockSoft: { borderTop: RULE_DIV, paddingTop: 16 },
  boxed: { border: RULE_INK, padding: 16 },
  bigScore: { ...heading(32, "-0.03em"), ...num },

  // ── Sticky save bar ──
  stickyBar: {
    position: "sticky",
    bottom: 0,
    background: C.surface,
    borderTop: RULE_INK,
    padding: "12px 0 0",
    marginTop: 16,
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  statusUnsaved: { ...label(11, "0.06em", C.accent700) },
  statusSaved: { ...label(11, "0.06em", C.n700) },

  // ── Legend ──
  legendRow: { display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap", fontSize: 11, color: C.n700 },
  legendItem: { display: "flex", alignItems: "center", gap: 6 },
  legendBar: { width: 3, height: 12, display: "inline-block", flexShrink: 0 },

  footer: {
    borderTop: RULE_DIV,
    padding: 16,
    fontSize: 11,
    color: C.n600,
    lineHeight: 1.7,
  },
};

// ── The comparison grid ──
export const G = {
  wrap: { overflowX: "auto", borderTop: S.RULE_INK },
  table: { width: "max-content", minWidth: "100%", borderCollapse: "collapse", fontSize: 12 },

  th: { ...S.th, padding: "8px 6px", textAlign: "right" },
  thPos: { ...S.th, width: 30, position: "sticky", left: 0, zIndex: 3 },
  thTeam: { ...S.th, minWidth: 104, position: "sticky", left: 30, zIndex: 3 },
  thPts: { ...S.th, padding: "8px 6px", textAlign: "right", color: C.text },
  thGd: { ...S.th, padding: "8px 10px 8px 6px", textAlign: "right", borderRight: S.RULE_INK },
  thPlayer: {
    padding: "8px 6px",
    textAlign: "center",
    borderBottom: S.RULE_HEAD,
    borderRight: `1px solid ${C.n200}`,
    background: C.surface,
    minWidth: 52,
  },
  playerRank: { ...heading(9, "0.06em"), color: C.n600, ...num },
  playerName: {
    ...heading(10, "0.04em"),
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 60,
    display: "block",
    textDecoration: "none",
    color: C.text,
  },
  playerScore: { fontSize: 9, color: C.n600, ...num },

  tdPos: {
    padding: 6,
    textAlign: "left",
    borderBottom: S.RULE_BODY,
    background: C.surface,
    position: "sticky",
    left: 0,
    zIndex: 1,
    ...heading(11),
    color: C.n600,
    ...num,
  },
  tdTeam: {
    padding: 6,
    textAlign: "left",
    borderBottom: S.RULE_BODY,
    background: C.surface,
    whiteSpace: "nowrap",
    position: "sticky",
    left: 30,
    zIndex: 1,
  },
  td: { padding: 6, textAlign: "right", borderBottom: S.RULE_BODY, color: C.n700, ...num },
  tdPts: { padding: 6, textAlign: "right", borderBottom: S.RULE_BODY, ...heading(12), ...num },
  tdGd: { padding: "6px 10px 6px 6px", textAlign: "right", borderBottom: S.RULE_BODY, borderRight: S.RULE_INK, ...num },
  tdCell: {
    padding: 6,
    textAlign: "center",
    borderBottom: S.RULE_BODY,
    borderRight: `1px solid ${C.n200}`,
  },
  cellInner: { display: "flex", alignItems: "center", justifyContent: "center", gap: 3 },
  cellChip: { width: 10, height: 10, display: "inline-block", flexShrink: 0 },
  cellTla: { ...heading(9, "0.02em") },

  hit: { background: C.accent200 },
  near: { background: C.n100 },
  zoneBreak: { borderTop: `2px solid ${C.n400}` },
};

// ── Zones ──
export function zoneOf(index, total) {
  if (index < 4) return "cl";
  if (index === 4) return "el";
  if (index === 5) return "ecl";
  if (index >= total - 3) return "rel";
  return null;
}

export const ZONE_COLOR = {
  cl: C.text,
  el: C.n600,
  ecl: C.n400,
  rel: C.accent,
};

export const ZONE_LABEL = {
  cl: "Champions League",
  el: "Europa",
  ecl: "Conference",
  rel: "Relegation",
};

// Form chips: W is ink, D is outlined, L is accent-tinted.
export const FORM_CHIP = {
  W: { background: C.text, color: "#fff", border: `1px solid ${C.text}` },
  D: { background: C.surface, color: C.n700, border: `1px solid ${C.n400}` },
  L: { background: C.accent200, color: C.accent800, border: `1px solid ${C.accent300}` },
};

// The couple of things inline styles can't express: hover, focus, keyframes.
if (typeof document !== "undefined" && !document.getElementById("epl-global-css")) {
  const el = document.createElement("style");
  el.id = "epl-global-css";
  el.textContent = `
    @keyframes spin { to { transform: rotate(360deg) } }
    * { box-sizing: border-box }
    body {
      margin: 0;
      background: ${C.surface};
      color: ${C.text};
      font-family: ${font};
      -webkit-text-size-adjust: 100%;
    }
    a { color: inherit }
    button, input { font-family: ${font} }
    :focus { outline: none }
    :focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px }
    ::selection { background: ${C.accent200} }

    .u-num { font-variant-numeric: tabular-nums; font-feature-settings: "tnum" }
    .u-tap { transition: background-color .15s, border-color .15s, color .15s }

    .nav-item:hover { color: ${C.accent} }
    .meta-btn:hover { color: ${C.accent} }
    .btn-primary:not(:disabled):hover { background: ${C.accent600}; border-color: ${C.accent600} }
    .btn-outline:not(:disabled):hover { border-color: ${C.text} }
    .btn-ink:not(:disabled):hover { background: ${C.accent}; border-color: ${C.accent} }
    .icon-btn:not(:disabled):hover { border-color: ${C.accent}; color: ${C.accent} }
    .row-link:hover { background: ${C.n100} }
    .link-accent { color: ${C.accent700} }
    .link-accent:hover { text-decoration: underline; text-underline-offset: 3px }
    .input-flat:hover { border-color: ${C.n600} }
    .input-flat:focus-visible { border-color: ${C.accent}; outline-offset: 0 }

    ::-webkit-scrollbar { width: 8px; height: 8px }
    ::-webkit-scrollbar-track { background: ${C.n100} }
    ::-webkit-scrollbar-thumb { background: ${C.n400} }
  `;
  document.head.appendChild(el);
}
