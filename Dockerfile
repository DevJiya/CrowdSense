# ─────────────────────────────────────────────────────────────
# CrowdSense AI — Production Dockerfile
# Multi-stage build: Install deps cleanly then run server
# ─────────────────────────────────────────────────────────────

FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

# ─────────────────────────────────────────────────────────────
# Final stage: minimal image
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application source
COPY . .

# Expose the port Cloud Run maps to
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:3001/ || exit 1

# Launch the secure Express server
CMD ["node", "server.js"]
