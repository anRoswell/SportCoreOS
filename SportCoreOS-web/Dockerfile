# ==============================================================================
# SPORTCOREOS WEB — DOCKERFILE MULTI-STAGE (ANGULAR 19 + NGINX PRODUCTION)
# ==============================================================================

# STAGE 1: Compilación de la aplicación Angular 19
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# STAGE 2: Servidor Web Nginx Ligero
FROM nginx:1.27-alpine AS runner

# Remover configuración por defecto
RUN rm -rf /etc/nginx/conf.d/*

# Copiar configuración personalizada optimizada para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar artefactos compilados del browser
COPY --from=builder /usr/src/app/dist/sport-core-os-web/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
