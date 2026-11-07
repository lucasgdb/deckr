import { type NextRequest, NextResponse } from 'next/server.js';
// Imports with extensions, so plain Node (`node --test`, src/proxy.test.ts) can load this file too.
import { defaultLocale, splitLocalePath } from './i18n/config.ts';
import { pages } from './lib/site.ts';

/*
 * Every language lives under `app/[locale]`, but Portuguese pages are served from the root URLs:
 * - `/cards` is rewritten to `/pt-br/cards` (the address bar keeps `/cards`); `/en/cards` is served as is;
 * - `/pt-br/...` redirects to the root URL, so each page has exactly one address per language;
 * - an unknown address is rewritten to its language's 404 page, with a 404 status.
 */
const internalPrefix = `/${defaultLocale}`;
const notFoundPath = '/not-found-page';
const knownPaths = new Set<string>(Object.values(pages).map((page) => page.path));

export function proxy(request: NextRequest) {
   const { pathname } = request.nextUrl;
   const url = request.nextUrl.clone();

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
   // Pages only: not the API, Next's own files, generated images (the home-screen icon, each language's share
   // image, linked as /pt-br/opengraph-image by Next), or any file with an extension.
   matcher: ['/((?!api/|_next/|apple-icon|.*opengraph-image|.*\\.).*)'],
};
