# Standalone output — no npm install needed, Next.js bundles only the required node_modules
FROM node:22-alpine AS runner
LABEL maintainer="Ewan Lyon <ewan.lyon@ausspeedruns.com>"
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Public assets
COPY --chown=nextjs:nodejs dist/apps/nextjs/public ./public

# Static build output (CSS, JS chunks, etc.)
COPY --chown=nextjs:nodejs dist/apps/nextjs/.next/static ./.next/static

# Standalone server + bundled node_modules
COPY --chown=nextjs:nodejs dist/apps/nextjs/.next/standalone ./

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["dumb-init", "node", "server.js"]
