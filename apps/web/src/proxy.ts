import { type NextRequest, NextResponse } from 'next/server.js';
// Imports with extensions, so plain Node (`node --test`, src/proxy.test.ts) can load this file too.
import { defaultLocale, splitLocalePath } from './i18n/config.ts';
import { pages } from './lib/site.ts';

/*
 * Every language lives under `app/[locale]`, but Portuguese pages are served from the root URLs:
 * - `/cards` is rewritten to `/pt-br/cards` (the address bar keeps `/cards`); `/en/cards` is served as is;
 * - `/pt-br/...` redirects to the root URL, so each page has exactly one address per language;
 * - an unknown address is rewritten to its language's 404 page, with a 404 status;
 * - a request on the Railway-generated domain (*.up.railway.app) redirects to the same path on SITE_URL, so search
 *   engines index one site. Railway's healthcheck uses its own host and isn't redirected.
 */
const internalPrefix = `/${defaultLocale}`;
const notFoundPath = '/not-found-page';
const knownPaths = new Set<string>(Object.values(pages).map((page) => page.path));

/** The official origin's host (deckr.lucasbittencourt.dev), when SITE_URL is set. Read per request: it's runtime config. */
function canonicalHost(): string | null {
   try {
      return process.env.SITE_URL ? new URL(process.env.SITE_URL).host : null;
   } catch {
      return null;
   }
}

export function proxy(request: NextRequest) {
   const { pathname, search } = request.nextUrl;
   const url = request.nextUrl.clone();
   const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '';
   const official = canonicalHost();

   if (official && host !== official && host.endsWith('.up.railway.app')) {
      return NextResponse.redirect(`https://${official}${pathname}${search}`, 308);
   }

   // Files (robots.txt, sitemap.xml, llms.txt) are matched only for the redirect above.
   if (pathname.includes('.')) return NextResponse.next();

   if (pathname === internalPrefix || pathname.startsWith(`${internalPrefix}/`)) {
      url.pathname = pathname.slice(internalPrefix.length) || '/';
      return NextResponse.redirect(url, 308);
   }

   const { locale, path } = splitLocalePath(pathname);
   const known = knownPaths.has(path);

   if (known && locale !== defaultLocale) return NextResponse.next();

   url.pathname = `/${locale}${known ? (path === '/' ? '' : path) : notFoundPath}`;
   return NextResponse.rewrite(url, known ? undefined : { status: 404 });
}

export const config = {
   // Pages: not the API, Next's own files, generated images (the home-screen icon, each language's share image,
   // linked as /pt-br/opengraph-image by Next), or files with an extension. Plus the crawler files, so the Railway
   // domain redirects them too.
   matcher: ['/((?!api/|_next/|apple-icon|.*opengraph-image|.*\\.).*)', '/robots.txt', '/sitemap.xml', '/llms.txt'],
};
