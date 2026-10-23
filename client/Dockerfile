# ==============================================================================
# STAGE 1: BUILD THE SPA (builder)
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time environment arguments
ARG VITE_API_URL=https://rogym-api.lethanhan01.id.vn
ARG VITE_WS_URL=https://rogym-api.lethanhan01.id.vn
ARG VITE_LIFF_ID=2010144670-0RJwlyfv
ARG VITE_LIFF_MOCK=false

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_WS_URL=${VITE_WS_URL}
ENV VITE_LIFF_ID=${VITE_LIFF_ID}
ENV VITE_LIFF_MOCK=${VITE_LIFF_MOCK}
ENV NODE_ENV=production

# Copy dependency manifests
COPY package*.json ./

# Install clean dependencies with security flag
RUN npm ci --ignore-scripts

# Copy client source code
COPY . .

# Build production bundle
RUN npm run build

# ==============================================================================
# STAGE 2: PRODUCTION UNPRIVILEGED STATIC RUNNER (runner)
# ==============================================================================
FROM nginxinc/nginx-unprivileged:1.27-alpine-slim AS runner

WORKDIR /usr/share/nginx/html

# Copy hardened unprivileged nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose non-privileged port
EXPOSE 8080

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

# Enforce unprivileged user
USER 101

CMD ["nginx", "-g", "daemon off;"]
