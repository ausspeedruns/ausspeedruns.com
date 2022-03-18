# Install dependencies only when needed
FROM node:16-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM node:16-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG SESSION_SECRET
ENV SESSION_SECRET ${SESSION_SECRET}

ARG DATABASE_URL
ENV DATABASE_URL ${DATABASE_URL}

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN npx keystone postinstall --fix
RUN npm run build:keystone

# Production image, copy all the files and run keystone
FROM node:16-alpine AS prod
WORKDIR /app

ENV NODE_ENV production

ENV PORT 8000

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/keystone.ts ./keystone.ts
COPY --from=builder /app/.keystone ./.keystone
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/schema.graphql ./schema.graphql
COPY --from=builder /app/schema.prisma ./schema.prisma
COPY --from=builder /app/schema ./schema

EXPOSE 8000

CMD ["npm", "run", "start:keystone"]
