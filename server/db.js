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
    top_scorer  TEXT,
    manager     TEXT,
    updated_at  INTEGER NOT NULL
  );

  -- One row per matchday, so the ▲▼ arrows have something to compare against.
  CREATE TABLE IF NOT EXISTS snapshots (
    matchday    INTEGER PRIMARY KEY,
    scores_json TEXT NOT NULL,
    taken_at    INTEGER NOT NULL
  );
`);

// Golden Boot and Manager of the Season arrived after the first deploy, so
// add the columns to databases that predate them. Existing rows get NULL and
// their owner is asked to fill them in next time they open the page.
{
  const columns = db.prepare("PRAGMA table_info(predictions)").all().map((c) => c.name);
  if (!columns.includes("top_scorer")) db.exec("ALTER TABLE predictions ADD COLUMN top_scorer TEXT");
  if (!columns.includes("manager")) db.exec("ALTER TABLE predictions ADD COLUMN manager TEXT");
}

const q = {
  insertUser: db.prepare(
    "INSERT INTO users (id, name, email, pin_hash, created_at) VALUES (?, ?, ?, ?, ?)"
  ),
  userByEmail: db.prepare("SELECT * FROM users WHERE email = ?"),
  userById: db.prepare("SELECT * FROM users WHERE id = ?"),
  allUsers: db.prepare("SELECT id, name, created_at FROM users ORDER BY created_at ASC"),
  upsertPrediction: db.prepare(`
    INSERT INTO predictions (user_id, order_json, top_scorer, manager, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      order_json = excluded.order_json,
      top_scorer = excluded.top_scorer,
      manager    = excluded.manager,
      updated_at = excluded.updated_at
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

export function savePrediction(userId, { order, topScorer, manager }) {
  q.upsertPrediction.run(userId, JSON.stringify(order), topScorer, manager, Date.now());
}

const shapePrediction = (row) => ({
  order: JSON.parse(row.order_json),
  topScorer: row.top_scorer || null,
  manager: row.manager || null,
  updatedAt: row.updated_at,
});

export const getPrediction = (userId) => {
  const row = q.predictionFor.get(userId);
  return row ? shapePrediction(row) : null;
};

export const listPredictions = () =>
  Object.fromEntries(q.allPredictions.all().map((r) => [r.user_id, shapePrediction(r)]));

export const getLatestSnapshot = () => {
  const row = q.latestSnapshot.get();
  return row ? { matchday: row.matchday, scores: JSON.parse(row.scores_json), takenAt: row.taken_at } : null;
};

export const putSnapshot = (matchday, scores) =>
  q.insertSnapshot.run(matchday, JSON.stringify(scores), Date.now());
