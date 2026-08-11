import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In development Vite serves the React app and forwards /api to the Node
// server running alongside it (npm run dev starts both). In production the
// Node server serves the built files itself, so none of this applies.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        // Server-sent events must not be buffered.
        configure: (proxy) => proxy.on("proxyRes", (proxyRes) => {
          if (proxyRes.headers["content-type"]?.includes("event-stream")) {
            proxyRes.headers["cache-control"] = "no-cache, no-transform";
          }
        }),
      },
    },
  },
});
