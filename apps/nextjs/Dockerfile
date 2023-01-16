# Install dependencies only when needed
FROM node:18.12.1-alpine as deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY dist/apps/nextjs/package.json ./
# Need to manually install the required dependencies because of https://github.com/nrwl/nx/issues/14275 I think
RUN npm install --omit=dev && npm install @emotion/styled@^11.10.5 @fontsource/finger-paint@^4.5.10 @fontsource/noto-sans@^4.5.11 @fontsource/roboto-mono@^4.5.8 @fortawesome/fontawesome-svg-core@^6.2.1 @fortawesome/free-brands-svg-icons@^6.2.1 @fortawesome/free-regular-svg-icons@^6.2.1 @fortawesome/free-solid-svg-icons@^6.2.1 @fortawesome/react-fontawesome@^0.2.0 @keystone-6/document-renderer@^1.1.2 @mui/icons-material@^5.10.16 @mui/lab@^5.0.0-alpha.110 @mui/material@^5.10.16 @mui/x-date-pickers@^5.0.9 date-fns@^2.29.3 date-fns-tz@^1.3.7 jsbarcode@^3.11.5 next-urql@^4.0.0 react@^18.2.0 react-cookie-consent@^8.0.1 react-dom@^18.2.0 react-router-dom@^6.4.3 sharp@^0.31.2 urql@^3.0.3

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
