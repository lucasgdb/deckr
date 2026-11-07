# syntax=docker/dockerfile:1
# Build from the repository root: docker build -f apps/web/Dockerfile .
FROM node:24-alpine AS build
RUN npm install --global pnpm@12.18.0
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --filter @deckr/web...
COPY packages/shared packages/shared
COPY apps/web apps/web
# Where Next forwards /api/*; rewrites are fixed at build time.
ARG API_URL=http://api:3001
# Public origin for canonical and hreflang URLs, the sitemap and robots.txt. Empty: the build isn't indexed.
ARG SITE_URL=
ENV API_URL=$API_URL SITE_URL=$SITE_URL NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @deckr/web build

FROM node:24-alpine
# Pages rendered on demand (404s) build their metadata at request time, so they need it too.
ARG SITE_URL=
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 SITE_URL=$SITE_URL
WORKDIR /app
COPY --from=build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /app/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
   CMD node -e "fetch('http://127.0.0.1:3000/').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
CMD ["node", "apps/web/server.js"]
