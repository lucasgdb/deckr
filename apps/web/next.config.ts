import { networkInterfaces } from 'node:os';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

/** Where `/api/*` is forwarded. Read at build time, so Docker passes it as a build argument. */
const apiUrl = process.env.API_URL ?? 'http://localhost:3001';

/**
 * Hosts allowed to use dev-only resources (hot reload's websocket) besides `localhost`. Next blocks other origins,
 * which silently turns off hot reload when the app is opened at 127.0.0.1 or this machine's IP (e.g. WSL's, from
 * Windows). This machine's own addresses are allowed; add more with DEV_ORIGINS=host1,host2.
 */
const devOrigins = [
   '127.0.0.1',
   ...Object.values(networkInterfaces())
      .flat()
      .flatMap((address) => (address && address.family === 'IPv4' ? [address.address] : [])),
   ...(process.env.DEV_ORIGINS?.split(',').map((origin) => origin.trim()) ?? []),
].filter(Boolean);

const config: NextConfig = {
   allowedDevOrigins: [...new Set(devOrigins)],
   // `next dev` writes an AGENTS.md for coding agents; the repo doesn't keep one.
   agentRules: false,
   output: 'standalone',
   // Trace files from the monorepo root so the standalone build includes the shared package.
   outputFileTracingRoot: fileURLToPath(new URL('../../', import.meta.url)),
   transpilePackages: ['@deckr/shared'],
   poweredByHeader: false,
   images: {
      // AVIF first (noticeably smaller for card art), WebP for browsers without it. Sources are WebP already.
      formats: ['image/avif', 'image/webp'],
      // Art is shown at most ~130 CSS px wide; no need for 2048–3840 px variants in every srcset.
      deviceSizes: [640, 828, 1080, 1200],
      imageSizes: [32, 48, 64, 96, 128, 192, 256, 384],
      // Card, arena and chest art rarely changes: let browsers keep resized copies for a week.
      minimumCacheTTL: 7 * 24 * 60 * 60,
   },
   experimental: {
      // The root layout is per language (`app/[locale]`), so addresses outside it get `app/global-not-found.tsx`.
      globalNotFound: true,
      // The CSS is small (~11 KB), so it goes in the HTML instead of blocking the first paint on two requests.
      inlineCss: true,
   },
   async rewrites() {
      return [{ source: '/api/:path*', destination: `${apiUrl}/api/:path*` }];
   },
};

export default config;
