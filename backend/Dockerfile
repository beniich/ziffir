# ════════════════════════════════════════════════════════════
# STAGE 1 — BUILD
# ════════════════════════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

# Installation des dépendances (cache layer)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copie du code source + build
COPY tsconfig.json ./
COPY src ./src

# Génération du client Prisma
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# ════════════════════════════════════════════════════════════
# STAGE 2 — PRODUCTION
# ════════════════════════════════════════════════════════════
FROM node:20-alpine AS production

WORKDIR /app

# Création user non-root (sécurité)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S zaphir -u 1001

# Installation deps de prod uniquement
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copie du build + Prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

# Création du dossier data pour SQLite
RUN mkdir -p /app/data /app/logs && chown -R zaphir:nodejs /app
USER zaphir

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

EXPOSE 5000

# Migration au démarrage + lancement
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
