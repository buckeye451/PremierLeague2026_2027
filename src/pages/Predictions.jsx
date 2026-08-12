import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { S, C, ZONE_COLOR, zoneOf } from "../styles.js";
import { useAuth } from "../auth.jsx";
import { useLeague } from "../league.jsx";
import { defaultPredictionOrder } from "../teams.js";
import { moveInOrder, scorePrediction } from "../scoring.js";
import { Crest, EmptyState, Kicker, LockBar, PrimaryLink, SectionHeading } from "../components/ui.jsx";
import { IconChevronDown, IconChevronUp, IconGrip } from "../components/icons.jsx";

export default function Predictions() {
  const { user, displayName } = useAuth();
  const { standings, preseason, locked, myOrder, myPrediction, savePrediction } = useLeague();

  const [draft, setDraft] = useState(null);
  const [topScorer, setTopScorer] = useState("");
  const [manager, setManager] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [error, setError] = useState(null);
  const [showGaps, setShowGaps] = useState(false);
  const dragFrom = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  useEffect(() => {
    if (draft || !standings) return;
    setDraft(myOrder ? [...myOrder] : defaultPredictionOrder(standings));
  }, [draft, myOrder, standings]);

  useEffect(() => {
    if (dirty || !myPrediction) return;
    setDraft([...myPrediction.order]);
    setTopScorer(myPrediction.topScorer || "");
    setManager(myPrediction.manager || "");
  }, [myPrediction, dirty]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const teamsByTla = useMemo(
    () => Object.fromEntries((standings || []).map((t) => [t.tla, t])),
    [standings]
  );

  const scorerOk = topScorer.trim().length >= 2;
  const managerOk = manager.trim().length >= 2;
  const missing = [!scorerOk && "the Golden Boot winner", !managerOk && "Manager of the Season"].filter(Boolean);
  const complete = scorerOk && managerOk;
  const canSave = !saving && complete && (dirty || !myPrediction);

  const apply = (next) => { setDraft(next); setDirty(true); setSavedAt(null); };
  const applyText = (setter) => (e) => { setter(e.target.value); setDirty(true); setSavedAt(null); };
  const move = (from, dir) => apply(moveInOrder(draft, from, from + dir));
  const jumpTo = (from, to) => apply(moveInOrder(draft, from, to));

  const onDrop = (to) => {
    if (dragFrom.current === null) return;
    apply(moveInOrder(draft, dragFrom.current, to));
    dragFrom.current = null;
    setDragOver(null);
  };

  const save = async () => {
    if (!complete) { setShowGaps(true); return; }
    setSaving(true);
    setError(null);
    try {
      await savePrediction({ order: draft, topScorer: topScorer.trim(), manager: manager.trim() });
      setDirty(false);
      setSavedAt(new Date());
      setShowGaps(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setDraft(myPrediction ? [...myPrediction.order] : defaultPredictionOrder(standings));
    setTopScorer(myPrediction?.topScorer || "");
    setManager(myPrediction?.manager || "");
    setDirty(false);
    setError(null);
  };

  // ── Not signed in ──
  if (!user) {
    return (
      <main style={S.main}>
        <LockBar />
        <SectionHeading title="Make your prediction" />
        <EmptyState>
          You need an account to submit a prediction — just your name, email and a 4-digit PIN. Everything else on the
          site is open to anyone, no sign-in needed.
          <div style={{ marginTop: 16 }}>
            <PrimaryLink to="/login">Create an account or sign in</PrimaryLink>
          </div>
        </EmptyState>
      </main>
    );
  }

  if (!draft) {
    return (
      <main style={S.main}>
        <SectionHeading title="Make your prediction" sub="Loading the team list…" />
      </main>
    );
  }

  // ── Locked ──
  if (locked) {
    const score = preseason ? null : scorePrediction(myOrder, standings);
    return (
      <main style={S.main}>
        <LockBar />
        <SectionHeading
          title={`${displayName}'s prediction`}
          sub={
            myOrder
              ? "Locked in. Here's how it's tracking against the real table."
              : "The deadline passed before you submitted a prediction."
          }
        />
        {!myOrder ? (
          <EmptyState>
            You didn't get a prediction in before the deadline, so there's nothing to score. You can still follow
            everyone else on the <Link to="/" className="link-accent">home page</Link>.
          </EmptyState>
        ) : (
          <>
            {score !== null && (
              <div style={{ ...S.block, marginBottom: 20 }}>
                <div style={S.bigScore}>{score}</div>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: C.n700 }}>
                  total positions off · lower is better · a perfect table scores 0
                </p>
              </div>
            )}
            <ExtraPicks topScorer={myPrediction?.topScorer} manager={myPrediction?.manager} />
            <ReadOnlyPrediction order={myOrder} standings={standings} preseason={preseason} teamsByTla={teamsByTla} />
          </>
        )}
      </main>
    );
  }

  // ── Open for editing ──
  return (
    <main style={S.main}>
      <LockBar />

      <SectionHeading
        title={`${displayName}'s prediction`}
        sub="Put the 20 teams in the order you think they'll finish. Drag a row, use the arrows, or type a position."
      />

      {error && <div style={{ ...S.formError, marginBottom: 16 }}>{error}</div>}

      {/* ── Golden Boot & Manager ── */}
      <div style={{ ...S.blockSoft, display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
        <div>
          <label style={S.label} htmlFor="topScorer">Golden Boot — most goals</label>
          <input
            id="topScorer"
            className="input-flat u-tap"
            style={{ ...S.input, ...(showGaps && !scorerOk ? S.inputInvalid : {}) }}
            value={topScorer}
            onChange={applyText(setTopScorer)}
            placeholder="e.g. Erling Haaland"
            maxLength={60}
            autoComplete="off"
          />
        </div>
        <div>
          <label style={S.label} htmlFor="manager">Manager of the Season</label>
          <input
            id="manager"
            className="input-flat u-tap"
            style={{ ...S.input, ...(showGaps && !managerOk ? S.inputInvalid : {}) }}
            value={manager}
            onChange={applyText(setManager)}
            placeholder="e.g. Mikel Arteta"
            maxLength={60}
            autoComplete="off"
          />
        </div>
        <p style={S.fineprint}>
          Free text — settled by argument at the end of the season. Both are required before you can submit.
        </p>
      </div>

      {!myPrediction && (
        <p style={{ ...S.fineprint, marginBottom: 12 }}>
          The table below is a starting order, not a suggestion — drag it into the shape you actually believe in.
        </p>
      )}

      {/* ── Draggable table ── */}
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: 36 }}>Pos</th>
              <th style={S.th}>Team</th>
              <th style={{ ...S.th, width: 100, textAlign: "center" }}>Move</th>
              <th style={{ ...S.th, width: 56, textAlign: "center" }}>Jump</th>
            </tr>
          </thead>
          <tbody>
            {draft.map((tla, i) => {
              const team = teamsByTla[tla] || { tla, name: tla };
              const zone = zoneOf(i, draft.length);
              return (
                <tr
                  key={tla}
                  draggable
                  onDragStart={() => { dragFrom.current = i; }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(i); }}
                  onDrop={() => onDrop(i)}
                  onDragEnd={() => { dragFrom.current = null; setDragOver(null); }}
                  style={{
                    cursor: "grab",
                    ...(dragOver === i ? { background: C.accent100, outline: `1px dashed ${C.accent}` } : {}),
                  }}
                >
                  <td
                    className="u-num"
                    style={{
                      ...S.posCell,
                      padding: 6,
                      fontSize: 12,
                      color: C.text,
                      borderLeft: `3px solid ${zone ? ZONE_COLOR[zone] : "transparent"}`,
                    }}
                  >
                    {i + 1}
                  </td>
                  <td style={{ ...S.td, padding: 6 }}>
                    <span style={S.teamRow}>
                      <span style={{ color: C.n500, display: "flex" }}><IconGrip size={12} /></span>
                      <Crest team={team} size={14} />
                      <span style={S.tla}>{team.tla}</span>
                      <span style={{ ...S.teamNameSoft, maxWidth: 110 }}>{team.name}</span>
                    </span>
                  </td>
                  <td style={{ ...S.td, padding: 6 }}>
                    <span style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                      <button
                        className="icon-btn u-tap"
                        style={{ ...S.iconBtn, ...(i === 0 ? S.btnDisabled : {}) }}
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        aria-label={`Move ${team.name} up`}
                      >
                        <IconChevronUp size={14} />
                      </button>
                      <button
                        className="icon-btn u-tap"
                        style={{ ...S.iconBtn, ...(i === draft.length - 1 ? S.btnDisabled : {}) }}
                        onClick={() => move(i, 1)}
                        disabled={i === draft.length - 1}
                        aria-label={`Move ${team.name} down`}
                      >
                        <IconChevronDown size={14} />
                      </button>
                    </span>
                  </td>
                  <td style={{ ...S.td, padding: 6, textAlign: "center" }}>
                    <input
                      type="number"
                      min={1}
                      max={draft.length}
                      value={i + 1}
                      onChange={(e) => {
                        const to = Number(e.target.value) - 1;
                        if (Number.isInteger(to) && to >= 0 && to < draft.length) jumpTo(i, to);
                      }}
                      className="input-flat u-tap u-num"
                      style={S.numberInput}
                      aria-label={`Set position for ${team.name}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Sticky action bar ── */}
      <div style={S.stickyBar}>
        {dirty ? (
          <span style={S.statusUnsaved}>Unsaved</span>
        ) : savedAt ? (
          <span style={S.statusSaved}>
            Saved {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        ) : null}

        {missing.length > 0 && (
          <span style={{ fontSize: 12, color: C.accent700 }}>Still needed: {missing.join(" and ")}.</span>
        )}

        <button
          className="btn-outline u-tap"
          style={{ ...S.btnOutline, marginLeft: "auto", ...(dirty ? {} : S.btnDisabled) }}
          onClick={reset}
          disabled={!dirty}
        >
          Undo
        </button>
        <button
          className="btn-primary u-tap"
          style={{ ...S.btnPrimary, ...(canSave ? {} : S.btnDisabled) }}
          onClick={save}
          disabled={!canSave}
          title={missing.length ? `Still needed: ${missing.join(" and ")}` : undefined}
        >
          {saving ? "Saving…" : myPrediction ? "Save changes" : "Submit prediction"}
        </button>
      </div>

      <p style={{ ...S.fineprint, marginTop: 14 }}>
        Change your prediction as often as you like until the deadline. After that it's frozen and everyone's picks
        become public.
      </p>
    </main>
  );
}

// ── The two free-text picks, read-only. Shared with the Everyone pages. ──
export function ExtraPicks({ topScorer, manager }) {
  if (!topScorer && !manager) return null;
  return (
    <div style={{ ...S.blockSoft, marginBottom: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Kicker>Golden Boot</Kicker>
        <div style={{ fontFamily: S.font, fontWeight: 800, fontSize: 17 }}>{topScorer || "—"}</div>
      </div>
      <div>
        <Kicker>Manager of the Season</Kicker>
        <div style={{ fontFamily: S.font, fontWeight: 800, fontSize: 17 }}>{manager || "—"}</div>
      </div>
    </div>
  );
}

// ── Diff chip: square, no radius, accent-tinted when badly wrong. ──
export function DiffChip({ diff }) {
  if (diff === null || diff === undefined) return "—";
  const exact = diff === 0;
  const close = Math.abs(diff) <= 2;
  return (
    <span
      className="u-num"
      style={{
        display: "inline-block",
        padding: "2px 6px",
        fontFamily: S.font,
        fontWeight: 800,
        fontSize: 11,
        ...(exact
          ? { background: C.surface, color: C.text, border: `1px solid ${C.text}` }
          : close
          ? { background: C.n100, color: C.n700, border: `1px solid ${C.n100}` }
          : { background: C.accent200, color: C.accent800, border: `1px solid ${C.accent200}` }),
      }}
    >
      {exact ? "✓" : diff > 0 ? `↓${diff}` : `↑${Math.abs(diff)}`}
    </span>
  );
}

// ── Locked view: prediction against reality ──
export function ReadOnlyPrediction({ order, standings, preseason, teamsByTla }) {
  return (
    <div style={S.tableWrap}>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={{ ...S.th, width: 36 }}>Pred</th>
            <th style={S.th}>Team</th>
            {!preseason && <th style={S.thNum}>Actual</th>}
            {!preseason && <th style={{ ...S.th, textAlign: "center", width: 64 }}>Diff</th>}
          </tr>
        </thead>
        <tbody>
          {order.map((tla, i) => {
            const team = teamsByTla[tla] || { tla, name: tla };
            const actual = standings ? standings.findIndex((t) => t.tla === tla) : -1;
            const diff = actual === -1 ? null : actual - i;
            const zone = zoneOf(i, order.length);
            return (
              <tr key={tla}>
                <td
                  className="u-num"
                  style={{
                    ...S.posCell,
                    padding: 6,
                    fontSize: 12,
                    color: C.text,
                    borderLeft: `3px solid ${zone ? ZONE_COLOR[zone] : "transparent"}`,
                  }}
                >
                  {i + 1}
                </td>
                <td style={{ ...S.td, padding: 6 }}>
                  <span style={S.teamRow}>
                    <Crest team={team} size={14} />
                    <span style={S.tla}>{team.tla}</span>
                    <span style={{ ...S.teamNameSoft, maxWidth: 130 }}>{team.name}</span>
                  </span>
                </td>
                {!preseason && (
                  <td className="u-num" style={{ ...S.tdNum, fontFamily: S.font, fontWeight: 800, color: C.text }}>
                    {actual === -1 ? "—" : actual + 1}
                  </td>
                )}
                {!preseason && (
                  <td style={{ ...S.td, padding: 6, textAlign: "center" }}>
                    <DiffChip diff={diff} />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
