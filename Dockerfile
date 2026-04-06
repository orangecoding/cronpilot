# ---- Build stage ----
FROM node:22-slim AS builder

WORKDIR /app

# Build tools required to compile better-sqlite3 native bindings
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy lockfiles and manifests first for layer caching
COPY server/package.json server/yarn.lock ./server/
COPY client/package.json client/yarn.lock ./client/

RUN yarn --cwd server install --frozen-lockfile \
    && yarn --cwd client install --frozen-lockfile

# Copy source
COPY server/src ./server/src
COPY client/src ./client/src
COPY client/index.html client/vite.config.js ./client/

RUN yarn --cwd client build

# ---- Production stage ----
FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy compiled server dependencies (includes native better-sqlite3 binary)
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/client/dist ./client/dist
COPY server/src ./server/src
COPY server/package.json ./server/

RUN mkdir -p /data

ENV NODE_ENV=production \
    PORT=3001 \
    HOST=0.0.0.0 \
    DB_PATH=/data/cronpilot.db

EXPOSE 3001
VOLUME /data

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:3001/ || exit 1

CMD ["node", "server/src/index.js"]
