# Install production dependencies
# Note: Dockerfile uses npm since this installs from dist output, not the monorepo
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY dist/apps/keystone/package.json ./
RUN npm install --omit=dev

# Production image
FROM node:22-alpine AS runner
LABEL maintainer="Ewan Lyon <ewan.lyon@ausspeedruns.com>"
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
ENV PORT=8000

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 keystone

COPY --from=deps --chown=keystone:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=keystone:nodejs /app/package.json ./package.json
# Overlay with built/generated modules from dist (e.g., Prisma client)
COPY --chown=keystone:nodejs dist/apps/keystone/node_modules ./node_modules
COPY --chown=keystone:nodejs dist/apps/keystone/schema.graphql ./schema.graphql
COPY --chown=keystone:nodejs dist/apps/keystone/schema.prisma ./schema.prisma
COPY --chown=keystone:nodejs dist/apps/keystone/.keystone ./.keystone

USER keystone

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/ || exit 1

CMD ["dumb-init", "node_modules/.bin/keystone", "start"]

