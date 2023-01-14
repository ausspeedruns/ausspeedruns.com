# # Install dependencies only when needed
# FROM node:16-alpine AS deps
# # Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN apk add --no-cache libc6-compat
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN npm ci

# # Rebuild the source code only when needed
# FROM node:16-alpine AS builder
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY /apps/nextjs/ .

# ARG SESSION_SECRET
# ENV SESSION_SECRET ${SESSION_SECRET}
# ENV NEXT_TELEMETRY_DISABLED 1
# ENV NODE_ENV production
# ARG DATABASE_URL
# ENV DATABASE_URL ${DATABASE_URL}
# ARG API_KEY
# ENV API_KEY ${API_KEY}
# ARG NEXT_PUBLIC_STRIPE_PUBLIC_KEY
# ENV NEXT_PUBLIC_STRIPE_PUBLIC_KEY ${NEXT_PUBLIC_STRIPE_PUBLIC_KEY}
	
# RUN npx next build

# FROM node:16-alpine AS prod
# WORKDIR /app

# ENV NODE_ENV production

# ENV PORT 3000

# COPY --from=builder /app/package.json ./package.json
# COPY --from=builder /app/node_modules ./node_modules

# COPY --from=builder /app/next.config.js ./
# COPY --from=builder /app/public ./public

# # Automatically leverage output traces to reduce image size
# # https://nextjs.org/docs/advanced-features/output-file-tracing
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# EXPOSE 3000

# CMD ["npx", "next", "start"]

# Install dependencies only when needed
FROM node:18.12.1-alpine as deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY dist/apps/nextjs/package.json ./
RUN npm install --omit=dev

# Production image, copy all the files and run next
FROM node:18.12.1-alpine as runner
LABEL maintainer="Ewan Lyon <ewan.lyon@ausspeedruns.com>"
RUN apk add --no-cache dumb-init
ENV NODE_ENV production
ENV PORT 3000
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY dist/apps/nextjs/public ./public
COPY dist/apps/nextjs/.next ./.next
RUN chown -R node:node .
USER node
EXPOSE 3000
# COPY --chown=node:node ./tools/scripts/entrypoints/api.sh /usr/local/bin/docker-entrypoint.sh
# ENTRYPOINT [ "docker-entrypoint.sh" ]
# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
ENV NEXT_TELEMETRY_DISABLED 1
CMD ["dumb-init", "node_modules/.bin/next", "start"]
