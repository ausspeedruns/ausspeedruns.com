FROM node:16-alpine AS deps

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

# RUN node testing.js
# RUN ls
# RUN ls ./
# RUN ls ..
# COPY schema.graphql ./schema.graphql
# COPY schema.prisma ./schema.prisma
RUN npm run update-keystone
RUN npm run build

FROM node:16-alpine AS prod
WORKDIR /app

ENV NODE_ENV production

ENV PORT 3000

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/keystone.ts ./keystone.ts
COPY --from=builder /app/.keystone ./.keystone
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/schema.graphql ./schema.graphql
COPY --from=builder /app/schema.prisma ./schema.prisma

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/schema.graphql ./schema.graphql
COPY --from=builder /app/schema.prisma ./schema.prisma

# Automatically leverage output traces to reduce image size 
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000
EXPOSE 8000

CMD ["npm", "run", "start"]