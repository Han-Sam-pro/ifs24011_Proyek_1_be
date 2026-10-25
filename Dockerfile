# ---------- Tahap 1: pasang dependency produksi ----------
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---------- Tahap 2: image runtime ----------
FROM node:22-bookworm-slim
ENV NODE_ENV=production PORT=4000 DB_PATH=/app/data/roamplan.db
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
RUN mkdir -p /app/data && chown -R node:node /app/data
USER node
EXPOSE 4000
CMD ["node", "--disable-warning=ExperimentalWarning", "src/server.js"]
