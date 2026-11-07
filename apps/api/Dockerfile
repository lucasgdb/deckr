# syntax=docker/dockerfile:1
# Build from the repository root: docker build -f apps/api/Dockerfile .
FROM node:24-alpine AS base
RUN npm install --global pnpm@12.18.0
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --prod --filter @deckr/api...

FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app ./
COPY packages/shared packages/shared
COPY apps/api apps/api
# Holds the generated token encryption key when TOKEN_SECRET isn't set; mounted as a volume.
RUN mkdir -p /data && chown node:node /data
ENV DATA_DIR=/data
USER node
WORKDIR /app/apps/api
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
   CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3001) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
# Node 24 runs the TypeScript sources directly (type stripping), so there is no build step.
CMD ["node", "src/index.ts"]
