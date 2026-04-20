# STAGE 1: Build
FROM node:18-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# STAGE 2: Production
FROM node:18-slim
WORKDIR /app
COPY --from=builder /app ./
RUN npm prune --production

# Security: Non-root user
USER node

EXPOSE 8080
ENV PORT=8080

CMD ["node", "server.js"]
