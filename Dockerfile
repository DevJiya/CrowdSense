# ─────────────────────────────────────────
# STAGE 1: BUILD
# ─────────────────────────────────────────
FROM node:18-slim AS builder

WORKDIR /app

# Install dependencies (including devDeps for build if needed)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# ─────────────────────────────────────────
# STAGE 2: PRODUCTION
# ─────────────────────────────────────────
FROM node:18-slim

WORKDIR /app

# Copy production artifacts from builder
COPY --from=builder /app /app

# Prune dev dependencies to keep image slim
RUN npm prune --production

# Security: Run as non-privileged user
USER node

EXPOSE 3001

CMD ["node", "server.js"]
