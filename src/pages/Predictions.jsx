import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { S, C, ZONE_COLOR, zoneOf } from "../styles.js";
import { useAuth } from "../auth.jsx";
import { useLeague } from "../league.jsx";
import { defaultPredictionOrder } from "../teams.js";
import { moveInOrder, scorePrediction } from "../scoring.js";
import { Crest, EmptyState, LockBar, PrimaryLink, SectionHeading } from "../components/ui.jsx";

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

  // Seed the draft: your saved order if you have one, otherwise the teams
  // alphabetically so you're arranging a real list rather than a blank page.
  useEffect(() => {
    if (draft || !standings) return;
    setDraft(myOrder ? [...myOrder] : defaultPredictionOrder(standings));
  }, [draft, myOrder, standings]);

  // If your saved picks change elsewhere (another device) and you have no
  // unsaved edits here, follow along.
  useEffect(() => {
    if (dirty || !myPrediction) return;
    setDraft([...myPrediction.order]);
    setTopScorer(myPrediction.topScorer || "");
    setManager(myPrediction.manager || "");
  }, [myPrediction, dirty]);

  // Warn before losing unsaved changes.
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

  // All three parts are required, so work out what's still missing and say so
  // rather than leaving a dead button with no explanation.
  const scorerOk = topScorer.trim().length >= 2;
  const managerOk = manager.trim().length >= 2;
  const missing = [!scorerOk && "the Golden Boot winner", !managerOk && "Manager of the Season"].filter(Boolean);
  const complete = scorerOk && managerOk;

  // Someone who hasn't submitted yet can always save — even the untouched
  // starting order is a valid table. Once saved, only real edits count.
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
        <EmptyState icon="🔐">
          You need an account to submit a prediction — just your name, email and a 4-digit PIN.
          <br />
          Everything else on the site is open to anyone, no sign-in needed.
          <br />
          <PrimaryLink to="/login" style={{ marginTop: 18 }}>Create an account or sign in</PrimaryLink>
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
          <EmptyState icon="⌛">
            You didn't get a prediction in before the deadline, so there's nothing to score.
            <br />
            You can still follow everyone else on the{" "}
            <Link to="/" style={{ color: C.accentSoft }}>home page</Link>.
          </EmptyState>
        ) : (
          <>
            {score !== null && (
              <div style={{ ...S.card, marginBottom: 20, display: "flex", alignItems: "baseline", gap: 12 }}>
                <span style={{ fontFamily: S.mono, fontSize: 32, fontWeight: 700, color: "#fff" }}>{score}</span>
                <span style={{ color: C.muted, fontSize: 13 }}>
                  total positions off · lower is better · a perfect table scores 0
                </span>
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
        sub="Put the 20 teams in the order you think they'll finish. Drag a row, use the ▲▼ arrows, or type a position. Nothing counts until you hit Save."
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {dirty && <span style={{ fontSize: 12, color: C.amber }}>● unsaved changes</span>}
          {savedAt && !dirty && (
            <span style={{ fontSize: 12, color: C.green }}>
              ✓ saved {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          {dirty && <button style={S.btn} onClick={reset}>Undo</button>}
          <button
            style={{ ...S.btnPrimary, ...(canSave ? {} : S.btnDisabled) }}
            onClick={save}
            disabled={!canSave}
            title={missing.length ? `Still needed: ${missing.join(" and ")}` : undefined}
          >
            {saving ? "Saving…" : myPrediction ? "Save changes" : "Submit prediction"}
          </button>
        </div>
      </SectionHeading>

      {error && <div style={{ ...S.formError, marginBottom: 16 }}>{error}</div>}

      {/* ── Golden Boot & Manager of the Season ── */}
      <div style={{ ...S.card, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
          <div>
            <label style={S.label} htmlFor="topScorer">⚽ Golden Boot — most goals</label>
            <input
              id="topScorer"
              style={{ ...S.input, ...(showGaps && !scorerOk ? { borderColor: C.red } : {}) }}
              value={topScorer}
              onChange={applyText(setTopScorer)}
              placeholder="e.g. Erling Haaland"
              maxLength={60}
              autoComplete="off"
            />
          </div>
          <div>
            <label style={S.label} htmlFor="manager">🧠 Manager of the Season</label>
            <input
              id="manager"
              style={{ ...S.input, ...(showGaps && !managerOk ? { borderColor: C.red } : {}) }}
              value={manager}
              onChange={applyText(setManager)}
              placeholder="e.g. Mikel Arteta"
              maxLength={60}
              autoComplete="off"
            />
          </div>
        </div>
        <p style={{ ...S.formNote, marginTop: 14, marginBottom: 0 }}>
          Type any name — these are settled by argument at the end of the season, not by the scoreboard. Both are
          required before you can submit.
        </p>
      </div>

      {!myPrediction && (
        <div style={{ ...S.lockBar, ...S.lockOpen, marginBottom: 16 }}>
          👋 The table below is a starting order, not a suggestion — drag it into the shape you actually believe in.
        </div>
      )}

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: 48 }}>Pos</th>
              <th style={{ ...S.th, textAlign: "left" }}>Team</th>
              <th style={{ ...S.th, width: 92 }}>Move</th>
              <th style={{ ...S.th, width: 70 }}>Jump</th>
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
                    ...S.tr,
                    ...(i % 2 === 0 ? S.trEven : {}),
                    ...(dragOver === i ? S.trDragOver : {}),
                    cursor: "grab",
                  }}
                >
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
                      <span style={{ color: C.mutedDim, cursor: "grab", fontSize: 14 }} aria-hidden="true">⠿</span>
                      <Crest team={team} />
                      <span style={S.teamName}>{team.name}</span>
                    </div>
                  </td>
                  <td style={S.td}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                      <button
                        style={{ ...S.arrowBtn, ...(i === 0 ? S.btnDisabled : {}) }}
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        aria-label={`Move ${team.name} up`}
                      >▲</button>
                      <button
                        style={{ ...S.arrowBtn, ...(i === draft.length - 1 ? S.btnDisabled : {}) }}
                        onClick={() => move(i, 1)}
                        disabled={i === draft.length - 1}
                        aria-label={`Move ${team.name} down`}
                      >▼</button>
                    </div>
                  </td>
                  <td style={S.td}>
                    <input
                      type="number"
                      min={1}
                      max={draft.length}
                      value={i + 1}
                      onChange={(e) => {
                        const to = Number(e.target.value) - 1;
                        if (Number.isInteger(to) && to >= 0 && to < draft.length) jumpTo(i, to);
                      }}
                      style={{
                        ...S.input,
                        width: 54,
                        padding: "5px 6px",
                        fontSize: 13,
                        textAlign: "center",
                        fontFamily: S.mono,
                      }}
                      aria-label={`Set position for ${team.name}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 12,
          marginTop: 16,
          flexWrap: "wrap",
        }}
      >
        {missing.length > 0 && (
          <span style={{ fontSize: 13, color: C.amber }}>
            ⚠️ Still needed: {missing.join(" and ")}.
          </span>
        )}
        {dirty && <button style={S.btn} onClick={reset}>Undo changes</button>}
        <button
          style={{ ...S.btnPrimary, ...(canSave ? {} : S.btnDisabled) }}
          onClick={save}
          disabled={!canSave}
        >
          {saving ? "Saving…" : myPrediction ? "Save changes" : "Submit prediction"}
        </button>
      </div>

      <p style={{ ...S.formNote, marginTop: 16 }}>
        You can change your prediction as often as you like until the deadline. After that it's frozen and everyone's
        picks become public.
      </p>
    </main>
  );
}

// ── The two free-text picks, read-only ──
// Exported so the Everyone pages show them the same way.
export function ExtraPicks({ topScorer, manager }) {
  if (!topScorer && !manager) return null;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 12,
        marginBottom: 20,
      }}
    >
      <div style={S.card}>
        <div style={{ ...S.label, marginBottom: 8 }}>⚽ Golden Boot</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: C.textBright }}>{topScorer || "—"}</div>
      </div>
      <div style={S.card}>
        <div style={{ ...S.label, marginBottom: 8 }}>🧠 Manager of the Season</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: C.textBright }}>{manager || "—"}</div>
      </div>
    </div>
  );
}

// ── Locked view: prediction vs reality, row by row ──
function ReadOnlyPrediction({ order, standings, preseason, teamsByTla }) {
  return (
    <div style={S.tableWrap}>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={{ ...S.th, width: 48 }}>Pred</th>
            <th style={{ ...S.th, textAlign: "left" }}>Team</th>
            {!preseason && <th style={S.th}>Actual</th>}
            {!preseason && <th style={S.th}>Diff</th>}
          </tr>
        </thead>
        <tbody>
          {order.map((tla, i) => {
            const team = teamsByTla[tla] || { tla, name: tla };
            const actual = standings.findIndex((t) => t.tla === tla);
            const diff = actual === -1 ? null : actual - i;
            const zone = zoneOf(i, order.length);
            return (
              <tr key={tla} style={{ ...S.tr, ...(i % 2 === 0 ? S.trEven : {}) }}>
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
                    <Crest team={team} />
                    <span style={S.teamName}>{team.name}</span>
                  </div>
                </td>
                {!preseason && (
                  <td style={{ ...S.td, fontFamily: S.mono, fontWeight: 700, color: C.muted }}>
                    {actual === -1 ? "—" : actual + 1}
                  </td>
                )}
                {!preseason && (
                  <td style={S.td}>
                    {diff === null ? (
                      "—"
                    ) : (
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          fontFamily: S.mono,
                          background:
                            diff === 0 ? "rgba(34,197,94,0.15)"
                            : Math.abs(diff) <= 2 ? "rgba(250,204,21,0.15)"
                            : "rgba(239,68,68,0.15)",
                          color: diff === 0 ? C.green : Math.abs(diff) <= 2 ? C.amber : C.red,
                        }}
                      >
                        {diff === 0 ? "✓ spot on" : diff > 0 ? `↓ ${diff}` : `↑ ${Math.abs(diff)}`}
                      </span>
                    )}
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
