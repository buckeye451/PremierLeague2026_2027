// ─── Accounts: name + email + 4-digit PIN ───────────────────
//
// A 4-digit PIN is 10,000 possibilities, so the guessing defence can't come
// from the secret itself — it has to come from the door. Three things do the
// work here:
//
//   1. scrypt      — every guess costs real CPU, so offline cracking of a
//                    stolen database is slow rather than instant.
//   2. rate limits — per-account and per-IP lockouts make online guessing
//                    impractical.
//   3. timing-safe — comparisons don't leak the answer a byte at a time.
//
// The PIN is never stored, logged, or sent anywhere but this endpoint.

import {
  createHmac,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

// Fly injects this via `fly secrets set SESSION_SECRET=…`. Falling back to a
// random value means that if it's missing, sessions simply don't survive a
// restart — annoying, but never insecure.
const SESSION_SECRET = process.env.SESSION_SECRET || randomBytes(32).toString("hex");
if (!process.env.SESSION_SECRET) {
  console.warn("[auth] SESSION_SECRET is not set — sessions will drop on restart.");
}

export const COOKIE_NAME = "epl_session";
const SESSION_TTL = 90 * 24 * 60 * 60 * 1000; // 90 days

// ─── PIN hashing ────────────────────────────────────────────
export function hashPin(pin) {
  const salt = randomBytes(16);
  const derived = scryptSync(pin, salt, SCRYPT.keylen, SCRYPT);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export function verifyPin(pin, stored) {
  try {
    const [saltHex, hashHex] = String(stored).split(":");
    if (!saltHex || !hashHex) return false;
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(pin, Buffer.from(saltHex, "hex"), expected.length, SCRYPT);
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

// ─── Sessions ───────────────────────────────────────────────
// A signed token in an HttpOnly cookie. No session table to keep tidy, and
// nothing useful to steal from the database.
const sign = (data) => createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");

export function createSessionToken(userId) {
  const payload = `${userId}.${Date.now() + SESSION_TTL}.${randomUUID().slice(0, 8)}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

export function readSessionToken(token) {
  if (!token || typeof token !== "string") return null;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;

  const payload = Buffer.from(token.slice(0, dot), "base64url").toString();
  const provided = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(sign(payload));

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

  const [userId, expiresAt] = payload.split(".");
  if (!userId || Number(expiresAt) < Date.now()) return null;
  return userId;
}

export const sessionCookie = (token) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: token ? SESSION_TTL : 0,
  path: "/",
});

// ─── Throttling ─────────────────────────────────────────────
// In-memory is the right call here: one machine, and a restart clearing the
// counters is not a meaningful bypass when the lockout is minutes long.
const attempts = new Map();
const WINDOW = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function prune(now) {
  for (const [key, rec] of attempts) if (now - rec.first > WINDOW) attempts.delete(key);
}

export function checkThrottle(key) {
  const now = Date.now();
  prune(now);
  const rec = attempts.get(key);
  if (!rec) return { allowed: true };
  if (now - rec.first > WINDOW) { attempts.delete(key); return { allowed: true }; }
  if (rec.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: WINDOW - (now - rec.first) };
  }
  return { allowed: true };
}

export function recordFailure(key) {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.first > WINDOW) attempts.set(key, { first: now, count: 1 });
  else rec.count += 1;
}

export const clearFailures = (key) => attempts.delete(key);

// ─── Validation ─────────────────────────────────────────────
export const isValidPin = (pin) => typeof pin === "string" && /^\d{4}$/.test(pin);
export const isValidEmail = (e) => typeof e === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
export const normalizeEmail = (e) => e.trim().toLowerCase();

// PINs like 1234 or 0000 are the first things anyone tries.
const WEAK_PINS = new Set(["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999", "1234", "4321", "1212", "0123"]);
export const isWeakPin = (pin) => WEAK_PINS.has(pin);
