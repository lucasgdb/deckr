import { database, defineRailway, github, project, service, volume } from 'railway/iac';

/*
 * Deckr on Railway: the web app (Next.js), the API (Express) and MongoDB, on one private network.
 *
 *   railway config plan  --file infra/railway.ts   # preview (read-only)
 *   railway config apply --file infra/railway.ts   # apply, asks first
 *
 * Only the web app is public. It serves the pages and forwards /api/* to the API over the private network
 * (API_URL), so the browser talks to one origin and the session cookie stays first-party. The API reaches Mongo
 * at its private endpoint. Variables are set in the dashboard (`managed: false`): see infra/README.md.
 *
 * Monorepo: both services build from the repository root with their own Dockerfile, and `watchPatterns` makes
 * Railway rebuild a service only when a push touches its files (its app, the shared package, the lockfile).
 */

const region = 'us-east4-eqdc4a';
const repository = 'lucasgdb/deckr';

const GiB = 1024 ** 3;

type Limits = {
   vCPU: number;
   memoryGB: number;
};

/** Root files every service's build depends on. */
const workspaceFiles = ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'tsconfig.base.json'];

/** Changes that never need a deploy: docs and tests. */
const ignored = ['!**/*.md', '!**/*.test.ts'];

function app(name: string, directory: string, limits: Limits, healthcheck: string) {
   return service(name, {
      source: github(repository, {
         branch: 'main',
         checkSuites: false,
      }),
      build: {
         builder: 'DOCKERFILE',
         // The Dockerfiles copy the workspace files and packages/shared, so the build context is the repo root.
         dockerfilePath: `${directory}/Dockerfile`,
         watchPatterns: [`${directory}/**`, 'packages/shared/**', ...workspaceFiles, ...ignored],
      },
      healthcheck,
      healthcheckTimeout: 60,
      replicas: {
         [region]: 1,
      },
      deploy: {
         restartPolicyMaxRetries: 5,
         // Always on: a sleeping API would answer the web app's first request after idle with a 502.
         sleepApplication: false,
         // Ceilings, not reservations (billing is per use). Measured on the production images under load
         // (Nov 2026): web 55 MB idle, 187 MB / ~1 vCPU peak while converting card art to AVIF cold;
         // API 64 MB idle, 74 MB / 0.19 vCPU peak.
         limitOverride: {
            containers: {
               cpu: limits.vCPU,
               memoryBytes: limits.memoryGB * GiB,
            },
         },
      },
   });
}

export default defineRailway(() => {
   // `mongo()` pins mongo:8; the project runs MongoDB 9 (compose.yaml).
   const Mongo = database('mongo', 'mongo', {
      image: 'mongo:9',
      output: 'MONGO_URL',
      defaultMountPath: '/data/db',
      region,
   });

   Mongo.networking = {
      privateNetworkEndpoint: 'mongo',
   };

   const mongoVolume = volume('mongo-volume', {
      alerts: {
         usage: {
            '80': {},
            '95': {},
            '100': {},
         },
      },
      allowOnlineResize: true,
      region,
      sizeMB: 1000,
   });

   // Without an attachment the volume would sit unused and every redeploy would start Mongo empty.
   Mongo.volumeAttachments = {
      'mongo-volume': {
         volume: mongoVolume.address,
         mountPath: '/data/db',
         backupSchedules: ['DAILY'],
      },
   };

   const api = app('api', 'apps/api', { vCPU: 0.5, memoryGB: 0.25 }, '/api/health');
   api.networking = {
      // No public domain: only the web app calls it, at api.railway.internal.
      privateNetworkEndpoint: 'api',
   };

   const web = app('web', 'apps/web', { vCPU: 1, memoryGB: 0.5 }, '/');
   web.networking = {
      serviceDomains: {
         'deckr-production.up.railway.app': {
            port: 3000,
         },
      },
   };

   return project('deckr', {
      // @ts-expect-error The SDK's types (3.16) don't know `variables: { managed: false }` yet; the CLI does
      // (`railway config plan` shows `variables: unmanaged`). Fails here once the types catch up.
      variables: {
         managed: false,
      },
      resources: [web, api, Mongo, mongoVolume],
   });
});
