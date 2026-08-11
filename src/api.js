// Thin wrapper over the server's JSON API. Session lives in an HttpOnly
// cookie, so there's no token for the client to hold or leak.

async function request(path, options = {}) {
  const res = await fetch(path, {
    credentials: "same-origin",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    ...options,
  });

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!res.ok) throw new Error(payload?.error || `Request failed (${res.status})`);
  return payload;
}

export const api = {
  live: () => request("/api/live"),
  state: () => request("/api/state"),
  me: () => request("/api/me"),

  signup: (name, email, pin) =>
    request("/api/signup", { method: "POST", body: JSON.stringify({ name, email, pin }) }),

  login: (email, pin) =>
    request("/api/login", { method: "POST", body: JSON.stringify({ email, pin }) }),

  logout: () => request("/api/logout", { method: "POST" }),

  savePrediction: (order) =>
    request("/api/prediction", { method: "PUT", body: JSON.stringify({ order }) }),
};

// Subscribe to server-sent events. Returns an unsubscribe function.
// The browser reconnects on its own if the stream drops.
export function subscribeToUpdates(onChange) {
  if (typeof EventSource === "undefined") return () => {};
  const source = new EventSource("/api/events");
  source.addEventListener("state", onChange);
  source.onerror = () => {
    /* EventSource retries by itself — nothing to do but let it */
  };
  return () => source.close();
}
