# ==============================================================================
# SPORTCOREOS API — DOCKERFILE MULTI-STAGE (PRODUCTION READY)
# ==============================================================================

# STAGE 1: Compilación de TypeScript y NestJS
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Herramientas para dependencias nativas (bcrypt)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# STAGE 2: Contenedor de Ejecución Mínimo
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
RUN apk add --no-cache python3 make g++ && \
    npm ci --omit=dev && \
    apk del python3 make g++ && \
    npm cache clean --force

COPY --from=builder /usr/src/app/dist ./dist

# Directorio para subidas persistentes de archivos y permisos de usuario
RUN mkdir -p uploads && chown -R node:node /usr/src/app

USER node

EXPOSE 3001

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/main"]
