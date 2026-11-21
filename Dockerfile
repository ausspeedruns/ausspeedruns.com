# syntax=docker/dockerfile:1
# check=skip=SecretsUsedInArgOrEnv
# Requires `output: 'standalone'` in next.config.js.
# Based on https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

ARG NODE_VERSION=26.12.1
ARG ALPINE_VERSION=3.24
ARG PNPM_VERSION=12.15.0

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base

# Corepack is no longer bundled with Node.js 25+, so install pnpm directly
FROM base AS pnpm
ARG PNPM_VERSION
RUN npm install --global --no-audit --no-fund pnpm@${PNPM_VERSION}
WORKDIR /app

# Install dependencies only when needed
FROM pnpm AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile --store-dir=/pnpm/store

# Rebuild the source code only when needed
FROM pnpm AS builder
# Placeholder secret so Payload can initialise during `next build`; not used at runtime
ARG PAYLOAD_SECRET=build-only-payload-secret
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}
ENV SKIP_BUILD_DB=1
ENV NODE_ENV=production
# NEXT_PUBLIC_* values are inlined into the build (client and server code), so they must be set here:
#   docker build --build-arg NEXT_PUBLIC_SERVER_URL=https://ausspeedruns.com ...
ARG NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
# Azure Blob (or CDN) origin that media is served from; next.config.js allows it for next/image at build time
ARG AZURE_STORAGE_ACCOUNT_BASEURL
ENV AZURE_STORAGE_ACCOUNT_BASEURL=${AZURE_STORAGE_ACCOUNT_BASEURL}
# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# No database is needed at build time: SKIP_BUILD_DB skips generateStaticParams and the frontend layout
# renders every page on demand (see src/app/(frontend)/layout.tsx)
RUN --mount=type=cache,id=next-cache,target=/app/.next/cache \
  pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Default locale for Intl/toLocale*() calls that don't pass one (Node otherwise falls back to en-US)
ENV LANG=en_AU.UTF-8
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/app/api-reference/config/next-config-js/output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Without Azure Blob storage configured, media uploads are written to public/media (mount a volume here to persist them)
RUN install -d -o nextjs -g nodejs /app/.next /app/public/media

USER nextjs

EXPOSE 3000

# Generous start period: pending migrations run before the server starts listening
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/next/health" || exit 1

# Exec form so node receives SIGTERM directly for graceful shutdown
CMD ["node", "server.js"]
