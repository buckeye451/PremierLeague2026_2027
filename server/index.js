// ─── EPL Predictions server ─────────────────────────────────
// Serves the built React app and a small JSON API. One process, one SQLite
// file on a Fly volume.

import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { HIDE_PICKS_UNTIL_LOCK, LOCK_AT, SEASON_LABEL } from "../src/config.js";
import { scorePrediction } from "../src/scoring.js";
import {
  COOKIE_NAME, checkThrottle, clearFailures, createSessionToken, hashPin, isValidEmail,
  isValidPin, isWeakPin, normalizeEmail, readSessionToken, recordFailure, sessionCookie, verifyPin,
} from "./auth.js";
import {
  createUser, findUserByEmail, findUserById, getLatestSnapshot, getPrediction,
  listPredictions, listUsers, putSnapshot, savePrediction,
} from "./db.js";
import { getMatches, getStandings } from "./football.js";
import { addClient, broadcast } from "./events.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const PORT = Number(process.env.PORT) || 8080;

const app = express();
app.set("trust proxy", 1); // Fly terminates TLS in front of us
app.use(express.json({ limit: "16kb" }));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

// ─── Helpers ────────────────────────────────────────────────
const isLocked = () => Date.now() >= LOCK_AT;
const picksVisible = () => isLocked() || !HIDE_PICKS_UNTIL_LOCK;

function readCookie(req, name) {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return null;
}

function currentUser(req) {
  const id = readSessionToken(readCookie(req, COOKIE_NAME));
  return id ? findUserById(id) : null;
}

const publicUser = (u) => ({ uid: u.id, name: u.name });
const clientIp = (req) => req.ip || req.socket.remoteAddress || "unknown";

// ─── Live football data ─────────────────────────────────────
// Cached in football.js, so this is cheap to call often.
app.get("/api/live", async (_req, res) => {
  try {
    const [standings, matches] = await Promise.all([getStandings(), getMatches()]);
    await maybeSnapshot(standings);
    res.json({ ...standings, matches });
  } catch (err) {
    console.error("[api/live]", err);
    res.status(502).json({ error: "Could not load live data." });
  }
});

// ─── Shared state ───────────────────────────────────────────
// Before the deadline, other people's orders are stripped here on the server.
// The browser is never sent picks it isn't allowed to show.
app.get("/api/state", (req, res) => {
  const me = currentUser(req);
  const visible = picksVisible();
  const all = listPredictions();

  const predictions = {};
  for (const [uid, p] of Object.entries(all)) {
    if (visible || uid === me?.id) predictions[uid] = p;
    else predictions[uid] = { submitted: true }; // enough to show a ✓, not the picks
  }

  res.json({
    users: listUsers(),
    predictions,
    snapshot: getLatestSnapshot(),
    locked: isLocked(),
    picksVisible: visible,
    lockAt: LOCK_AT,
  });
});

app.get("/api/me", (req, res) => {
  const user = currentUser(req);
  res.json({ user: user ? publicUser(user) : null });
});

// ─── Accounts ───────────────────────────────────────────────
app.post("/api/signup", (req, res) => {
  const { name, email, pin } = req.body || {};

  const ipGate = checkThrottle(`signup:${clientIp(req)}`);
  if (!ipGate.allowed) {
    return res.status(429).json({ error: "Too many attempts from this device. Try again later." });
  }

  const trimmedName = typeof name === "string" ? name.trim() : "";
  if (!trimmedName) return res.status(400).json({ error: "Please enter your name." });
  if (trimmedName.length > 40) return res.status(400).json({ error: "That name is a bit long — 40 characters max." });
  if (!isValidEmail(email)) return res.status(400).json({ error: "Please enter a valid email address." });
  if (!isValidPin(pin)) return res.status(400).json({ error: "Your PIN must be exactly 4 digits." });
  if (isWeakPin(pin)) {
    return res.status(400).json({ error: "That PIN is too easy to guess. Pick something less obvious." });
  }

  const normalized = normalizeEmail(email);
  if (findUserByEmail(normalized)) {
    recordFailure(`signup:${clientIp(req)}`);
    return res.status(409).json({ error: "That email already has an account. Try signing in instead." });
  }

  const user = createUser({ name: trimmedName, email: normalized, pinHash: hashPin(pin) });
  res.cookie(COOKIE_NAME, createSessionToken(user.id), sessionCookie(true));
  broadcast("state");
  res.status(201).json({ user: publicUser(user) });
});

app.post("/api/login", (req, res) => {
  const { email, pin } = req.body || {};
  if (!isValidEmail(email) || !isValidPin(pin)) {
    return res.status(400).json({ error: "Enter your email and 4-digit PIN." });
  }

  const normalized = normalizeEmail(email);
  const keys = [`login:${normalized}`, `login-ip:${clientIp(req)}`];

  for (const key of keys) {
    const gate = checkThrottle(key);
    if (!gate.allowed) {
      const minutes = Math.ceil(gate.retryAfterMs / 60000);
      return res.status(429).json({ error: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` });
    }
  }

  const user = findUserByEmail(normalized);
  // Same response either way — no telling an attacker which emails exist.
  if (!user || !verifyPin(pin, user.pin_hash)) {
    keys.forEach(recordFailure);
    return res.status(401).json({ error: "That email and PIN don't match an account." });
  }

  keys.forEach(clearFailures);
  res.cookie(COOKIE_NAME, createSessionToken(user.id), sessionCookie(true));
  res.json({ user: publicUser(user) });
});

app.post("/api/logout", (_req, res) => {
  res.cookie(COOKIE_NAME, "", sessionCookie(false));
  res.json({ ok: true });
});

// ─── Predictions ────────────────────────────────────────────
app.put("/api/prediction", async (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: "Sign in to save a prediction." });

  // The deadline is enforced here, not in the browser. Nothing a client sends
  // after this moment gets written.
  if (isLocked()) {
    return res.status(403).json({ error: "Predictions are locked — the deadline has passed." });
  }

  const { order } = req.body || {};
  const { table } = await getStandings();
  const valid = new Set(table.map((t) => t.tla));

  if (!Array.isArray(order) || order.length !== table.length) {
    return res.status(400).json({ error: `Send all ${table.length} teams in order.` });
  }
  if (new Set(order).size !== order.length) {
    return res.status(400).json({ error: "Each team can only appear once." });
  }
  if (!order.every((tla) => valid.has(tla))) {
    return res.status(400).json({ error: "That prediction contains a team that isn't in this season." });
  }

  savePrediction(user.id, order);
  broadcast("state");
  res.json({ ok: true, updatedAt: Date.now() });
});

// ─── Live updates ───────────────────────────────────────────
app.get("/api/events", (req, res) => addClient(res));

app.get("/api/health", (_req, res) => res.json({ ok: true, season: SEASON_LABEL, locked: isLocked() }));

// ─── Weekly snapshot ────────────────────────────────────────
// Records everyone's score the first time we see a new matchday, which is
// what the ▲▼ movement arrows compare against. No button to remember.
async function maybeSnapshot({ table, currentMatchday, preseason }) {
  if (preseason || !isLocked()) return;
  const latest = getLatestSnapshot();
  if (latest && latest.matchday >= currentMatchday) return;

  const scores = {};
  for (const [uid, p] of Object.entries(listPredictions())) {
    const score = scorePrediction(p.order, table);
    if (score !== null) scores[uid] = score;
  }
  if (Object.keys(scores).length === 0) return;

  putSnapshot(currentMatchday, scores);
  broadcast("state");
  console.log(`[snapshot] recorded matchday ${currentMatchday} for ${Object.keys(scores).length} players`);
}

// ─── Static site ────────────────────────────────────────────
app.use(
  express.static(DIST, {
    setHeaders: (res, path) => {
      // Hashed asset filenames can be cached hard; index.html never should be.
      if (path.includes(`${join("assets", "")}`)) res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      else if (path.endsWith(".html") || path.endsWith("sw.js")) res.setHeader("Cache-Control", "no-cache");
    },
  })
);

// Client-side routing: anything that isn't an API call gets the app shell.
app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(join(DIST, "index.html")));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`EPL Predictions ${SEASON_LABEL} listening on :${PORT}`);
  console.log(`Predictions ${isLocked() ? "are LOCKED" : `lock at ${new Date(LOCK_AT).toISOString()}`}`);
});
