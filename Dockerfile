# ── Build stage ─────────────────────────────────────────────
# Carries the toolchain so better-sqlite3 compiles from source if no prebuilt
# binary matches the target platform. None of this reaches the final image.
FROM node:22-slim AS builder

RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Drop dev dependencies but keep the compiled native module.
RUN npm prune --omit=dev


# ── Runtime stage ───────────────────────────────────────────
FROM node:22-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

# gosu lets the entrypoint fix ownership of the mounted volume as root, then
# hand the server itself to an unprivileged user.
RUN apt-get update \
 && apt-get install -y --no-install-recommends gosu \
 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# The server imports config, scoring and the team list from src/ so the
# deadline and scoring rules are defined in exactly one place.
COPY server ./server
COPY src ./src
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# The SQLite file lives on the mounted Fly volume, not in the image.
ENV DATABASE_PATH=/data/epl.db
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server/index.js"]
