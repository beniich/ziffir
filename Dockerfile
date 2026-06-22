# ════════════════════════════════════════════════════════════
# STAGE 1 — BUILD
# ════════════════════════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build arguments pour l'API URL
ARG VITE_API_URL=http://localhost:5000/api
ARG VITE_WS_URL=ws://localhost:5000/ws
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN npm run build

# ════════════════════════════════════════════════════════════
# STAGE 2 — SERVEUR NGINX (production)
# ════════════════════════════════════════════════════════════
FROM nginx:1.27-alpine AS production

# Configuration Nginx custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie du build statique
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
