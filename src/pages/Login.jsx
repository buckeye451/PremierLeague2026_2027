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
      className="nav-item u-tap"
      onClick={() => { setMode(id); setError(null); }}
      style={{
        flex: 1,
        border: 0,
        borderBottom: `3px solid ${mode === id ? C.accent : "transparent"}`,
        background: "none",
        color: mode === id ? C.text : C.n600,
        padding: "12px 8px",
        minHeight: 44,
        marginBottom: -2,
        cursor: "pointer",
        fontFamily: S.font,
        fontWeight: 800,
        fontSize: 12,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </button>
  );

  return (
    <main style={{ ...S.main, maxWidth: 460, margin: "0 auto", width: "100%" }}>
      <LockBar />

      <div style={{ display: "flex", borderBottom: S.RULE_DIV, marginBottom: 20 }}>
        <Tab id="signup">Create account</Tab>
        <Tab id="signin">Sign in</Tab>
      </div>

      <p style={{ fontSize: 13, color: C.n700, lineHeight: 1.5, margin: "0 0 20px" }}>
        {mode === "signup"
          ? "An account is only needed to make picks — browsing the site doesn't require one."
          : "Welcome back. Same email and PIN you signed up with."}
      </p>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {mode === "signup" && (
          <div>
            <label style={S.label} htmlFor="name">Your name</label>
            <input
              id="name"
              className="input-flat u-tap"
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
            className="input-flat u-tap"
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
            className="input-flat u-tap u-num"
            style={{ ...S.input, ...S.pinInput }}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="••••"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
          />
          <p style={{ ...S.fineprint, marginTop: 8 }}>
            {mode === "signup"
              ? "Pick something you'll remember — it's the only way back into your account."
              : "Forgot it? Whoever runs the league can reset your account — see the README for the one-liner."}
          </p>
        </div>

        {error && <div style={S.formError}>{error}</div>}

        <button
          type="submit"
          className="btn-primary u-tap"
          style={{ ...S.btnPrimary, padding: 14, minHeight: 52, fontSize: 13, ...(busy ? S.btnDisabled : {}) }}
          disabled={busy}
        >
          {busy ? "Just a second…" : mode === "signup" ? "Create account & make picks" : "Sign in"}
        </button>
      </form>

      <p style={{ ...S.fineprint, margin: "20px 0 0" }}>
        {locked ? (
          <>Predictions closed on {LOCK_LABEL} ET, but you can still sign in to see your picks. </>
        ) : null}
        Just here to look? The <Link to="/" className="link-accent">home page</Link>,{" "}
        <Link to="/table" className="link-accent">table</Link> and{" "}
        <Link to="/leaderboard" className="link-accent">leaderboard</Link> are open to everyone.
      </p>
    </main>
  );
}
