// ─── Accounts: name + email + 4-digit PIN ───────────────────
//
// All the real work happens on the server (see server/auth.js) — hashing,
// rate limiting, session signing. This file just holds who's signed in and
// exposes the three actions the UI needs.

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api.js";

const AuthContext = createContext(null);

export const isValidPin = (pin) => /^\d{4}$/.test(pin);
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api
      .me()
      .then((res) => { if (!cancelled) { setUser(res.user); setIsAdmin(Boolean(res.isAdmin)); } })
      .catch(() => { /* not signed in, or the server is unreachable */ })
      .finally(() => { if (!cancelled) setReady(true); });

    return () => { cancelled = true; };
  }, []);

  // The server decides who's admin, so re-ask it after any sign-in change
  // rather than guessing from the email on the client.
  const refreshMe = async () => {
    const res = await api.me().catch(() => null);
    if (res) { setUser(res.user); setIsAdmin(Boolean(res.isAdmin)); }
  };

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      ready,
      displayName: user?.name || null,

      async signUp(name, email, pin) {
        const res = await api.signup(name.trim(), email.trim(), pin);
        setUser(res.user);
        await refreshMe();
        return res.user;
      },

      async signIn(email, pin) {
        const res = await api.login(email.trim(), pin);
        setUser(res.user);
        await refreshMe();
        return res.user;
      },

      async signOut() {
        await api.logout().catch(() => {});
        setUser(null);
        setIsAdmin(false);
      },
    }),
    [user, isAdmin, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
