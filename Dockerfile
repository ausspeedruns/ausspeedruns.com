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
ARG API_KEY
ENV API_KEY ${API_KEY}
ARG NEXT_PUBLIC_STRIPE_PUBLIC_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLIC_KEY ${NEXT_PUBLIC_STRIPE_PUBLIC_KEY}

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# RUN --mount=type=secret,id=SESSION_SECRET \
#   --mount=type=secret,id=DATABASE_URL \
#   --mount=type=secret,id=API_KEY \
#   --mount=type=secret,id=NEXT_PUBLIC_STRIPE_PUBLIC_KEY \
#    export SESSION_SECRET=$(cat /run/secrets/SESSION_SECRET) && \
#    export DATABASE_URL=$(cat /run/secrets/DATABASE_URL) && \
#    export API_KEY=$(cat /run/secrets/API_KEY) && \
#    export NEXT_PUBLIC_STRIPE_PUBLIC_KEY=$(cat /run/secrets/NEXT_PUBLIC_STRIPE_PUBLIC_KEY)

RUN npm run update-keystone
RUN npm run build:next

FROM node:16-alpine AS prod
WORKDIR /app

ENV NODE_ENV production

ENV PORT 3000

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000

CMD ["npm", "run", "start:next"]