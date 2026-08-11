import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth.jsx";
import { LeagueProvider, useLeague } from "./league.jsx";
import Layout from "./components/Layout.jsx";
import { LoadingScreen } from "./components/ui.jsx";
import Home from "./pages/Home.jsx";
import Table from "./pages/Table.jsx";
import Predictions from "./pages/Predictions.jsx";
import Everyone from "./pages/Everyone.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Scores from "./pages/Scores.jsx";
import Login from "./pages/Login.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LeagueProvider>
          <Gate />
        </LeagueProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Hold the first paint until we know who's signed in and have the team list,
// so pages never flash "signed out" or an empty table.
function Gate() {
  const { ready } = useAuth();
  const { loading, apiError, dbError } = useLeague();

  if (!ready || loading) {
    return (
      <LoadingScreen
        message={!ready ? "Signing you in…" : "Fetching the live table…"}
        error={apiError || dbError}
      />
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="table" element={<Table />} />
        <Route path="predictions" element={<Predictions />} />
        <Route path="everyone" element={<Everyone />} />
        <Route path="everyone/:uid" element={<Everyone />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="scores" element={<Scores />} />
        <Route path="login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
