import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { S, C } from "../styles.js";
import { useAuth } from "../auth.jsx";
import { useLeague } from "../league.jsx";
import { SEASON_LABEL } from "../config.js";
import { IconBall, IconHome, IconRefresh, IconTable, IconTarget, IconTrophy, IconUser, IconUsers } from "./icons.jsx";

const LOGO = "/logo-header.png";

const NAV = [
  { to: "/", label: "Home", Icon: IconHome, end: true },
  { to: "/table", label: "Table", Icon: IconTable },
  { to: "/predictions", label: "Picks", Icon: IconTarget },
  { to: "/everyone", label: "Everyone", Icon: IconUsers },
  { to: "/leaderboard", label: "Ranks", Icon: IconTrophy },
  { to: "/scores", label: "Scores", Icon: IconBall },
];

export default function Layout() {
  const { user, displayName, signOut } = useAuth();
  const { matches, matchday, lastRefresh, refresh, apiError, dbError, preseason } = useLeague();
  const { pathname } = useLocation();

  // The login screen is deliberately bare: wordmark only, no meta row, no nav.
  // The links at the foot of that page carry you back into the site.
  const bare = pathname === "/login";

  return (
    <div style={S.root}>
      <div style={S.shell}>
        {apiError && <div style={S.banner}>{apiError}</div>}
        {dbError && (
          <div style={S.banner}>Can't reach the server — predictions and scores may be out of date. ({dbError})</div>
        )}

        <header style={S.header}>
          {bare ? (
            <>
              <img src={LOGO} alt="Premier League Predictions" style={S.logo} />
              <div style={{ ...S.seasonTag, marginTop: 6 }}>{SEASON_LABEL}</div>
            </>
          ) : (
            <>
              <div style={S.headerTop}>
                <Link to="/" style={{ display: "block", lineHeight: 0 }}>
                  <img src={LOGO} alt="Premier League Predictions" style={S.logo} />
                </Link>
                <span style={S.seasonTag}>{SEASON_LABEL}</span>
              </div>

              <div style={S.metaRow}>
                {matches.live.length > 0 && (
                  <>
                    <span style={{ ...S.metaItem, color: C.accent }}>
                      <span style={S.liveMark} />
                      {matches.live.length} live
                    </span>
                    <span style={S.metaDivider} />
                  </>
                )}

                <span>{preseason ? "Pre-season" : `GW${matchday}`}</span>
                <span style={S.metaDivider} />

                <button className="meta-btn u-tap" style={S.metaButton} onClick={refresh} title="Refresh live data">
                  <IconRefresh size={12} />
                  {lastRefresh ? lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                </button>

                {user ? <UserMenu name={displayName} onSignOut={signOut} /> : (
                  <Link
                    to="/login"
                    className="nav-item u-tap"
                    style={{ ...S.metaItem, marginLeft: "auto", color: C.text, textDecoration: "none" }}
                  >
                    <IconUser size={12} />
                    Sign in
                  </Link>
                )}
              </div>
            </>
          )}
        </header>

        {!bare && (
          <nav style={S.navBar}>
            {NAV.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className="nav-item u-tap"
                style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navLinkActive : {}) })}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        )}

        <Outlet />

        <footer style={S.footer}>
          <p style={{ margin: 0 }}>
            EPL Predictions {SEASON_LABEL} · live data from{" "}
            <a href="https://www.football-data.org" target="_blank" rel="noreferrer" className="link-accent">
              football-data.org
            </a>
          </p>
          <p style={{ margin: 0 }}>Anyone can browse. An account is only needed to make picks.</p>
        </footer>
      </div>
    </div>
  );
}

// Sign-out lives behind the name rather than sitting in the header as a
// permanent underlined link — it's a rare action and was competing with the
// meta row for attention.
function UserMenu({ name, onSignOut }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!box.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <span ref={box} style={{ marginLeft: "auto", position: "relative" }}>
      <button
        className="meta-btn u-tap"
        style={{ ...S.metaButton, color: C.text }}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <IconUser size={12} />
        {name}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            background: C.surface,
            border: `2px solid ${C.text}`,
            zIndex: 30,
            minWidth: 132,
          }}
        >
          <button
            role="menuitem"
            className="u-tap"
            style={{
              ...S.metaButton,
              width: "100%",
              padding: "11px 14px",
              minHeight: 44,
              color: C.text,
              justifyContent: "flex-start",
            }}
            onClick={() => { setOpen(false); onSignOut(); }}
          >
            Sign out
          </button>
        </div>
      )}
    </span>
  );
}
