# Deckr infrastructure (Railway)

Defined in [railway.ts](railway.ts), applied to the Railway project **deckr** (`production` environment).

| Resource                                       | What                                                                                 | Network                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `web`                                          | Next.js app (`apps/web/Dockerfile`). Serves the pages and forwards `/api/*` to `api` | public: `deckr-production.up.railway.app`, private `web.railway.internal` |
| `api`                                          | Express API (`apps/api/Dockerfile`)                                                  | private only: `api.railway.internal:3001`                                 |
| `mongo` (+ `mongo-volume`, 1 GB, daily backup) | MongoDB 9                                                                            | private only: `mongo.railway.internal:27017`                              |

The browser only ever talks to `web`, so the session cookie is first-party and the API needs no CORS.

## Resources

Ceilings per service (`limitOverride`; billing is per use, so a ceiling caps cost and runaway processes, it reserves nothing), from the production images measured under load (Nov 2026: 280 page renders, 369 cold AVIF/WebP conversions, 800 API calls):

| Service | Idle          | Peak                                                                | Ceiling           |
| ------- | ------------- | ------------------------------------------------------------------- | ----------------- |
| `web`   | 55 MB, 0 vCPU | 187 MB, ~1 vCPU (converting card art cold; cached for a week after) | 1 vCPU / 512 MB   |
| `api`   | 64 MB, 0 vCPU | 74 MB, 0.19 vCPU                                                    | 0.5 vCPU / 256 MB |

Mongo keeps the plan's default. Raise a ceiling when its metrics come near it. Nothing sleeps: a sleeping API would answer the web app's first request after idle with a 502.

## Monorepo deploys

Both services build from the repository root (their Dockerfiles copy the workspace files and `packages/shared`). Each has `watchPatterns`, so a push only rebuilds the services whose files changed:

- `web`: `apps/web/**`, `packages/shared/**`, root `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.base.json`
- `api`: `apps/api/**`, the same shared and root files

Markdown files and `*.test.ts` never trigger a deploy. A change to `infra/` deploys nothing (apply it with the CLI).

## Commands

Run `railway` directly, not through a pnpm script (the SDK checks the CLI version through `$_`, which pnpm overwrites).

```bash
railway link --project deckr --environment production   # once per machine
railway config plan  --file infra/railway.ts             # preview (read-only)
railway config apply --file infra/railway.ts             # apply, asks first
```

`pnpm --filter @deckr/infra typecheck` checks the file. `variables: { managed: false }` carries a `@ts-expect-error`: the SDK's types don't know it yet, the CLI does.

## Variables (set in the dashboard)

`managed: false`: applying never touches variables. Set them on each service after the first apply. `${{...}}` are Railway references, which is what connects the services.

### api

| Variable               | Value                                                                                                                                                                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`                 | `3001`                                                                                                                                                                                                                                       |
| `MONGODB_URI`          | `${{mongo.MONGO_URL}}/deckr?authSource=admin`                                                                                                                                                                                                |
| `TOKEN_SECRET`         | `openssl rand -base64 32`, sealed. Required here: the API's filesystem isn't persistent, so a generated key would be lost on every deploy and stored API tokens would stop decrypting. Never change it afterwards.                           |
| `COOKIE_SECURE`        | `true`                                                                                                                                                                                                                                       |
| `CLASH_ROYALE_API_KEY` | optional: Deckr's own developer key, for logging in with the in-game token (needs Supercell's partner scope). Clash Royale keys are allowed per IP, and Railway's outbound IPs change unless Static Outbound IPs are enabled on the service. |

### web

| Variable                                             | Value                                                                                                                                                                |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`                                               | `3000`                                                                                                                                                               |
| `API_URL`                                            | `http://${{api.RAILWAY_PRIVATE_DOMAIN}}:${{api.PORT}}` (read at build time: Railway passes service variables to the Dockerfile's `ARG`s)                             |
| `SITE_URL`                                           | `https://${{RAILWAY_PUBLIC_DOMAIN}}`, or the custom domain once there is one (canonical URLs, hreflang, sitemap, robots; empty keeps the site out of search engines) |
| `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` | optional, for Search Console and Bing Webmaster Tools                                                                                                                |

## Before the first deploy

1. Push the code to `main` on `lucasgdb/deckr` (Railway builds from GitHub).
2. `railway config apply --file infra/railway.ts`.
3. Set the variables above, then redeploy `api` and `web`.
4. Players log in with their own API key: they allow the API's outbound IP, which the login dialog shows (`GET /api/server`). With dynamic outbound IPs that address can change; enable Static Outbound IPs on `api` for keys to keep working.
