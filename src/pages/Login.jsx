import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { S, C } from "../styles.js";
import { useAuth } from "../auth.jsx";
import { LockBar, LOCK_LABEL } from "../components/ui.jsx";
import { useLeague } from "../league.jsx";

export default function Login() {
  const { user, signIn, signUp } = useAuth();
  const { locked } = useLeague();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (user) return <Navigate to={location.state?.from || "/predictions"} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") await signUp(name, email, pin);
      else await signIn(email, pin);
      navigate(location.state?.from || "/predictions", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const Tab = ({ id, children }) => (
    <button
      type="button"
      onClick={() => { setMode(id); setError(null); }}
      style={{
        ...S.btn,
        flex: 1,
        borderRadius: 0,
        border: "none",
        borderBottom: `2px solid ${mode === id ? C.accent : "transparent"}`,
        background: "none",
        color: mode === id ? "#fff" : C.muted,
        padding: "12px 8px",
      }}
    >
      {children}
    </button>
  );

  return (
    <main style={{ ...S.main, maxWidth: 460, margin: "0 auto" }}>
      <LockBar compact />

      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: `1px solid ${C.line}` }}>
          <Tab id="signup">Create account</Tab>
          <Tab id="signin">Sign in</Tab>
        </div>

        <form onSubmit={submit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
          <p style={{ ...S.formNote, margin: 0 }}>
            {mode === "signup"
              ? "An account is only needed to make picks — browsing the site doesn't require one."
              : "Welcome back. Same email and PIN you signed up with."}
          </p>

          {mode === "signup" && (
            <div>
              <label style={S.label} htmlFor="name">Your name</label>
              <input
                id="name"
                style={S.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How you'll show up on the leaderboard"
                autoComplete="name"
                required
              />
            </div>
          )}

          <div>
            <label style={S.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              style={S.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label style={S.label} htmlFor="pin">4-digit PIN</label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              style={{ ...S.input, ...S.pinInput }}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
            />
            <p style={{ ...S.formNote, marginTop: 8 }}>
              {mode === "signup"
                ? "Pick something you'll remember — it's the only way back into your account."
                : "Forgot it? Whoever runs the league can reset your account — see the README for the one-liner."}
            </p>
          </div>

          {error && <div style={S.formError}>{error}</div>}

          <button type="submit" style={{ ...S.btnPrimary, ...(busy ? S.btnDisabled : {}), padding: 14 }} disabled={busy}>
            {busy ? "Just a second…" : mode === "signup" ? "Create account & make picks" : "Sign in"}
          </button>

          <p style={{ ...S.formNote, margin: 0, textAlign: "center" }}>
            {locked ? (
              <>Predictions closed on {LOCK_LABEL} ET, but you can still sign in to see your picks.</>
            ) : (
              <>Predictions lock {LOCK_LABEL} ET.</>
            )}
          </p>
        </form>
      </div>

      <p style={{ ...S.formNote, textAlign: "center", marginTop: 20 }}>
        Just here to look? The{" "}
        <Link to="/" style={{ color: C.accentSoft }}>home page</Link>,{" "}
        <Link to="/table" style={{ color: C.accentSoft }}>table</Link> and{" "}
        <Link to="/leaderboard" style={{ color: C.accentSoft }}>leaderboard</Link> are open to everyone.
      </p>
    </main>
  );
}
