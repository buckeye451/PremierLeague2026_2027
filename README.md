# ⚽ EPL Predictions — 2026/27

Predict how the Premier League table will finish, then watch your guess get
dismantled by reality in real time alongside your friends.

Each prediction has three parts: the full 20-team table, your **Golden Boot**
pick, and your **Manager of the Season** pick. All three are required — the
submit button stays off until they're filled in, and the server rejects an
incomplete prediction regardless of what the browser allows.

- **Anyone can browse** — the table, the leaderboard, everyone's picks, live
  scores. No account, no sign-in.
- **An account is only needed to make picks** — name, email, 4-digit PIN.
- **Predictions lock Friday 21 August 2026 at 8:00 PM Eastern**, enforced on
  the server. After that, everything becomes public and the scoring starts.
- **Picks stay sealed until the deadline** so nobody can copy. You can always
  see your own.

Runs as a single Fly.io app: a small Node server that serves the React front
end, talks to football-data.org, and keeps everything in SQLite on a volume.

---

## Deploying to Fly.io

You need the [`flyctl` CLI](https://fly.io/docs/flyctl/install/) and a
football-data.org API key ([free registration](https://www.football-data.org/client/register)).

### 1. Create the app

```bash
fly auth login
fly launch --no-deploy
```

When prompted, **decline** the offer to add a Postgres/Redis database — this
app doesn't use one. Accept the existing `fly.toml`, or set your own app name
and region in it (`app` and `primary_region`).

### 2. Create the volume

This is where the SQLite file lives. It must be in the same region as the app.

```bash
fly volumes create epl_data --size 1 --region iad
```

Use your own region if you changed `primary_region`. 1 GB is far more than
this will ever need.

### 3. Set the secrets

```bash
fly secrets set \
  FOOTBALL_API_KEY=your_football_data_org_key \
  SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

`SESSION_SECRET` signs the login cookies. Changing it later signs everyone out;
losing it is harmless beyond that.

### 4. Deploy

```bash
fly deploy
fly open
```

Send your friends the URL. That's it.

---

## Running it locally

```bash
cp .env.example .env     # then put your API key in it
npm install
npm run dev
```

That starts the API server on `:8080` and the Vite dev server on `:5173`, with
`/api` proxied between them. Open <http://localhost:5173>.

The database is created automatically at `.data/epl.db` (gitignored). Without a
`FOOTBALL_API_KEY` everything still works — the app falls back to the built-in
2026/27 team list and shows a banner saying so.

To run exactly what production runs:

```bash
npm run preview          # builds, then serves everything from :8080
```

---

## How it works

```
Browser                          Fly.io machine                    External
───────                          ──────────────                    ────────
React app  ──── /api/* ────────▶ Node + Express ───────────────▶ football-data.org
    ▲                                  │                          (key stays here)
    │                                  ▼
    └──── /api/events (SSE) ───── SQLite on /data volume
          push updates            users · predictions · snapshots
```

| Piece | What it does |
|---|---|
| `server/index.js` | The API and static file server. Enforces the deadline. |
| `server/auth.js` | PIN hashing (scrypt), signed session cookies, rate limiting. |
| `server/db.js` | SQLite schema and queries. |
| `server/football.js` | football-data.org client, cached 3 minutes. |
| `server/events.js` | Server-sent events, so picks appear on other devices instantly. |
| `src/config.js` | The deadline and season settings — **read by both** server and client. |
| `src/scoring.js` | Scoring rules, also shared by both. |
| `src/teams.js` | The 2026/27 team list, used until the API publishes the real one. |

### Scoring

For each team, take the gap between where you predicted it and where it
actually sits. Add up all 20. **Lower is better**; a perfect table scores 0.
Ties break on the number of teams placed in exactly the right spot.

The ▲▼ arrows show how your score has moved since the previous matchday. The
server records a snapshot automatically the first time it sees a new matchday —
there's no button anyone has to remember to press.

**Golden Boot and Manager of the Season are free text and aren't scored.** The
app can't tell whether "Haaland" and "Erling Haaland" are the same answer, and
Manager of the Season is a subjective award anyway — so both are stored, kept
sealed until the deadline, then shown side by side on the Everyone page for you
to settle amongst yourselves.

### Live data

Standings and fixtures come from football-data.org, cached server-side for 3
minutes. Browsers refresh every 5 minutes, or every minute while matches are in
play. Ten friends refreshing at once still costs one upstream call, which keeps
the free tier's 10 requests/minute limit comfortable.

---

## Changing things

Almost everything you'd want to adjust is in **`src/config.js`**:

| Setting | Effect |
|---|---|
| `LOCK_AT` | The deadline, as a Unix timestamp in milliseconds. |
| `HIDE_PICKS_UNTIL_LOCK` | Set to `false` to let everyone see picks as they come in. |
| `SEASON` / `SEASON_LABEL` | Which season to pull from the API. |
| `REFRESH_INTERVAL` | How often browsers re-fetch live data. |

Both the server and the browser read this file, so a change applies to both —
redeploy after editing.

**A note on the deadline:** 21 August 2026 falls in daylight saving time, so
"8 PM Eastern" is UTC−4 (EDT), which is `2026-08-22T00:00:00Z`. That's what
`LOCK_AT` is set to. If you literally meant EST (UTC−5), change it to
`1787360400000`.

### The team list

The app asks football-data.org for the real 2026/27 teams and only falls back
to the hardcoded list in `src/teams.js` if the API hasn't published them yet.
That list is Coventry City, Ipswich Town and Hull City in place of West Ham,
Burnley and Wolves. If something changes, edit that file.

---

## Running the league

**Reset someone's forgotten PIN.** There's no email reset — delete the account
and let them sign up again:

```bash
fly ssh console -C "node -e \"
  const db = require('better-sqlite3')('/data/epl.db');
  db.prepare('DELETE FROM users WHERE email = ?').run('their@email.com');
\""
```

**Back up everyone's picks.** Set your own email as the admin once:

```bash
fly secrets set ADMIN_EMAIL=you@example.com
```

Sign in with that email and a **Backup** button appears on the Everyone page.
It downloads a JSON file with every player's name, email, full predicted table,
Golden Boot and Manager picks, and the weekly score snapshots — enough to
rebuild the league by hand if the volume is ever lost. Works from a phone.

The file deliberately contains no PINs or password hashes. If accounts are ever
lost, people re-register with the same email and you restore their picks from
the backup.

Nobody else can reach it: signed-out requests get a 401, other players get a
403, and until `ADMIN_EMAIL` is set the endpoint is off entirely rather than
open. That matters before the deadline, when the file contains picks that are
sealed from everyone else.

Worth pressing once the evening the deadline passes — after that the server
refuses new predictions, so lost data can't be re-entered.

For a byte-exact copy of the database instead:

```bash
fly ssh sftp get /data/epl.db ./epl-backup.db
```

**See who's in:**

```bash
fly ssh console -C "node -e \"
  const db = require('better-sqlite3')('/data/epl.db');
  console.table(db.prepare('SELECT name, email, created_at FROM users').all());
\""
```

---

## Notes on the details

**Why a single machine?** The database is a file on a Fly volume, and a volume
attaches to one machine. For a league of friends that's the right trade — no
replication to reason about, nothing extra to pay for. Don't `fly scale count`
past 1 without moving to a networked database first.

**Cold starts.** `auto_stop_machines` is on, so the machine sleeps when nobody's
using it and wakes on the next request (about a second). The volume persists
either way. If you'd rather it always be warm, set `min_machines_running = 1`
in `fly.toml`.

**About the PIN.** Four digits is 10,000 combinations, so the security can't
come from the secret — it comes from the door. PINs are hashed with scrypt
(slow to attack offline), never stored or logged in the clear, and login is
rate-limited per account and per IP with a 15-minute lockout after 8 failures.
Obvious PINs like `1234` and `0000` are rejected at sign-up. Wrong-PIN and
unknown-email both return the same message, so the login form can't be used to
discover who has an account.

This is a game between friends, not a bank — but none of the above cost
anything to do properly.

**Emails** are used for signing in and nothing else. They're never sent to the
browser or shown anywhere in the app; the public API only ever exposes names.

---

## Tech

React 18 · Vite 6 · Express 5 · SQLite (better-sqlite3) · Fly.io ·
[football-data.org](https://www.football-data.org)
