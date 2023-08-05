# Install dependencies only when needed
FROM node:18.12.1-alpine as deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY dist/apps/nextjs/package.json ./
RUN npm install --omit=dev && npm install sharp@^0.31.2

# Production image, copy all the files and run next
FROM node:18.12.1-alpine as runner
LABEL maintainer="Ewan Lyon <ewan.lyon@ausspeedruns.com>"
RUN apk add --no-cache dumb-init
ENV NODE_ENV production
ENV PORT 3000
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY dist/apps/nextjs/ ./
# RUN chown -R node:node .
# USER node
EXPOSE 3000
# COPY --chown=node:node ./tools/scripts/entrypoints/api.sh /usr/local/bin/docker-entrypoint.sh
# ENTRYPOINT [ "docker-entrypoint.sh" ]
# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
ENV NEXT_TELEMETRY_DISABLED 1
CMD ["dumb-init", "node_modules/.bin/next", "start"]
