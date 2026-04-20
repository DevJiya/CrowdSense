# STAGE 1: Build
FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts --legacy-peer-deps
COPY . .

# STAGE 2: Production
FROM node:22-slim
WORKDIR /app
COPY --from=builder /app ./

# Security: Non-root user
USER node

EXPOSE 8080
ENV PORT=8080

CMD ["node", "src/index.js"]
