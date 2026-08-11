// ─── Server-sent events ─────────────────────────────────────
// When anyone saves a prediction, every open browser hears about it and
// refetches — so the table updates on your friend's phone without a refresh.

const clients = new Set();

export function addClient(res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write("retry: 5000\n\n");
  clients.add(res);
  res.on("close", () => clients.delete(res));
}

export function broadcast(type, data = {}) {
  const frame = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    try {
      res.write(frame);
    } catch {
      clients.delete(res);
    }
  }
}

// Idle proxies hang up on quiet connections; a periodic comment keeps the
// stream alive without waking any application code.
setInterval(() => {
  for (const res of clients) {
    try {
      res.write(": ping\n\n");
    } catch {
      clients.delete(res);
    }
  }
}, 25000).unref();

export const clientCount = () => clients.size;
