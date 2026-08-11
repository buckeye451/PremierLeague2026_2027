// ─── Storage ────────────────────────────────────────────────
// SQLite on a Fly volume. One file, no separate database service to pay for
// or babysit — which is the right shape for a league of friends.

import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

// In production this points at the Fly volume. Locally it drops a file in the
// project so `npm run dev` works with no setup.
const DB_PATH =
  process.env.DATABASE_PATH || (process.env.NODE_ENV === "production" ? "/data/epl.db" : "./.data/epl.db");

mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    pin_hash    TEXT NOT NULL,
    created_at  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS predictions (
    user_id     TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    order_json  TEXT NOT NULL,
    updated_at  INTEGER NOT NULL
  );

  -- One row per matchday, so the ▲▼ arrows have something to compare against.
  CREATE TABLE IF NOT EXISTS snapshots (
    matchday    INTEGER PRIMARY KEY,
    scores_json TEXT NOT NULL,
    taken_at    INTEGER NOT NULL
  );
`);

const q = {
  insertUser: db.prepare(
    "INSERT INTO users (id, name, email, pin_hash, created_at) VALUES (?, ?, ?, ?, ?)"
  ),
  userByEmail: db.prepare("SELECT * FROM users WHERE email = ?"),
  userById: db.prepare("SELECT * FROM users WHERE id = ?"),
  allUsers: db.prepare("SELECT id, name, created_at FROM users ORDER BY created_at ASC"),
  upsertPrediction: db.prepare(`
    INSERT INTO predictions (user_id, order_json, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET order_json = excluded.order_json, updated_at = excluded.updated_at
  `),
  predictionFor: db.prepare("SELECT * FROM predictions WHERE user_id = ?"),
  allPredictions: db.prepare("SELECT * FROM predictions"),
  latestSnapshot: db.prepare("SELECT * FROM snapshots ORDER BY matchday DESC LIMIT 1"),
  insertSnapshot: db.prepare(
    "INSERT OR REPLACE INTO snapshots (matchday, scores_json, taken_at) VALUES (?, ?, ?)"
  ),
};

export function createUser({ name, email, pinHash }) {
  const id = randomUUID();
  q.insertUser.run(id, name, email, pinHash, Date.now());
  return q.userById.get(id);
}

export const findUserByEmail = (email) => q.userByEmail.get(email);
export const findUserById = (id) => q.userById.get(id);

export const listUsers = () =>
  q.allUsers.all().map((u) => ({ uid: u.id, name: u.name, joinedAt: u.created_at }));

export function savePrediction(userId, order) {
  q.upsertPrediction.run(userId, JSON.stringify(order), Date.now());
}

export const getPrediction = (userId) => {
  const row = q.predictionFor.get(userId);
  return row ? { order: JSON.parse(row.order_json), updatedAt: row.updated_at } : null;
};

export const listPredictions = () =>
  Object.fromEntries(
    q.allPredictions.all().map((r) => [r.user_id, { order: JSON.parse(r.order_json), updatedAt: r.updated_at }])
  );

export const getLatestSnapshot = () => {
  const row = q.latestSnapshot.get();
  return row ? { matchday: row.matchday, scores: JSON.parse(row.scores_json), takenAt: row.taken_at } : null;
};

export const putSnapshot = (matchday, scores) =>
  q.insertSnapshot.run(matchday, JSON.stringify(scores), Date.now());
