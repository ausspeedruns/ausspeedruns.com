# Install dependencies only when needed
FROM node:18.12.1-alpine as deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY dist/apps/keystone/package.json ./
RUN npm install --omit=dev

# Production image, copy all the files and run next
FROM ubuntu:22.04 as runner
LABEL maintainer="Ewan Lyon <ewan.lyon@ausspeedruns.com>"
RUN apt install dumb-init
ENV NODE_ENV production
ENV PORT 8000
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY dist/apps/keystone/node_modules ./node_modules
COPY dist/apps/keystone/schema.graphql ./schema.graphql
COPY dist/apps/keystone/schema.prisma ./schema.prisma
COPY dist/apps/keystone/.keystone ./.keystone
# RUN chown -R node:node .
# USER node
EXPOSE 8000
ENV NEXT_TELEMETRY_DISABLED 1
CMD ["dumb-init", "node_modules/.bin/keystone", "start"]

# # Install dependencies only when needed
# FROM node:18.12.1-alpine as deps
# # Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN apk add --no-cache libc6-compat
# WORKDIR /app
# COPY dist/apps/keystone/package.json ./
# RUN npm install --omit=dev

# FROM node:18.12.1-alpine as builder
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY dist/apps/keystone ./
# RUN npx keystone postinstall --fix
# RUN npx keystone build

# # Production image, copy all the files and run next
# FROM node:18.12.1-alpine as runner
# LABEL maintainer="Ewan Lyon <ewan.lyon@ausspeedruns.com>"
# RUN apk add --no-cache dumb-init
# ENV NODE_ENV production
# ENV PORT 8000
# WORKDIR /app
# COPY --from=deps /app/package.json ./package.json
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/schema.graphql ./schema.graphql
# COPY --from=builder /app/schema.prisma ./schema.prisma
# COPY --from=builder /app/.keystone ./.keystone
# # RUN chown -R node:node .
# # USER node
# EXPOSE 8000
# ENV NEXT_TELEMETRY_DISABLED 1
# CMD ["dumb-init", "node_modules/.bin/keystone", "start"]

