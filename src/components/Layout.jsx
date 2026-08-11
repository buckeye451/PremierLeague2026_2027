import { Link, NavLink, Outlet } from "react-router-dom";
import { S, C } from "../styles.js";
import { useAuth } from "../auth.jsx";
import { useLeague } from "../league.jsx";
import { SEASON_LABEL } from "../config.js";

const NAV = [
  { to: "/", label: "Home", icon: "🏠", end: true },
  { to: "/table", label: "Table", icon: "📊" },
  { to: "/predictions", label: "My Picks", icon: "🎯" },
  { to: "/everyone", label: "Everyone", icon: "👥" },
  { to: "/leaderboard", label: "Leaderboard", icon: "🏆" },
  { to: "/scores", label: "Scores", icon: "⚽" },
];

export default function Layout() {
  const { user, displayName, signOut } = useAuth();
  const { matches, matchday, lastRefresh, refresh, apiError, dbError, preseason } = useLeague();

  return (
    <div style={S.root}>
      <div style={S.shell}>
        {apiError && <div style={S.banner}>⚠️ {apiError}</div>}
        {dbError && (
          <div style={S.banner}>
            ⚠️ Can't reach the server — predictions and scores may be out of date. ({dbError})
          </div>
        )}

        <header style={S.header}>
          <div style={S.headerInner}>
            <Link to="/" style={S.headerLeft}>
              <div style={S.logoMark}><span style={S.logoIcon}>⚽</span></div>
              <div>
                <h1 style={S.title}>EPL Predictions</h1>
                <p style={S.subtitle}>{SEASON_LABEL} Season Tracker</p>
              </div>
            </Link>

            <div style={S.headerRight}>
              {matches.live.length > 0 && (
                <span style={S.liveIndicator}>
                  <span style={S.liveDot} />
                  {matches.live.length} LIVE
                </span>
              )}
              <span style={S.weekBadge}>{preseason ? "PRE-SEASON" : `GW${matchday}`}</span>
              <button style={S.refreshBtn} onClick={refresh} title="Refresh live data now">
                🔄 {lastRefresh ? lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
              </button>

              {user ? (
                <span style={S.userChip}>
                  <span>👤 {displayName}</span>
                  <button style={S.signOutBtn} onClick={signOut}>sign out</button>
                </span>
              ) : (
                <Link to="/login" style={S.userChip}>Sign in</Link>
              )}
            </div>
          </div>
        </header>

        <nav style={S.navBar}>
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navLinkActive : {}) })}
            >
              <span aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <Outlet />

        <footer style={S.footer}>
          <p style={{ margin: 0 }}>
            EPL Predictions {SEASON_LABEL} · live data from{" "}
            <a href="https://www.football-data.org" target="_blank" rel="noreferrer" style={{ color: C.muted }}>
              football-data.org
            </a>
          </p>
          <p style={{ margin: 0 }}>Anyone can browse. You only need an account to make picks.</p>
        </footer>
      </div>
    </div>
  );
}
