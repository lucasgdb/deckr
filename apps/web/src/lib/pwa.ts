import type { MetadataRoute } from 'next';
import { getDictionary, type Locale, localeConfig, localizePath } from '@/i18n';

/*
 * The web app manifest, one per language (/manifest.webmanifest, /manifest.en.webmanifest), linked by each
 * language's layout. Both share `id`, so installing from either is the same app. It has what Chrome needs for the
 * richer install sheet (description and screenshots, narrow and wide) and what a Play Store build needs (PNG and
 * maskable icons at 512 px, standalone display, a fixed id and scope): see README → "Installable app".
 */

export const manifestPath = (locale: Locale) =>
   locale === 'pt-br' ? '/manifest.webmanifest' : `/manifest.${locale}.webmanifest`;

type Manifest = MetadataRoute.Manifest & {
   launch_handler?: { client_mode: string | string[] };
   screenshots?: (NonNullable<MetadataRoute.Manifest['screenshots']>[number] & { label?: string })[];
};

export function buildManifest(locale: Locale): Manifest {
   const t = getDictionary(locale);
   const shot = (name: string) => `/screenshots/${locale}-${name}.webp`;
   const narrow = (name: 'builder' | 'cards' | 'profile') => ({
      src: shot(`narrow-${name}`),
      sizes: '780x1688',
      type: 'image/webp',
      form_factor: 'narrow' as const,
      label: t.pwa.screenshots[name],
   });

   return {
      id: '/',
      name: t.meta.appName,
      short_name: t.meta.siteName,
      description: t.meta.description,
      lang: localeConfig[locale].htmlLang,
      dir: 'ltr',
      start_url: localizePath('/', locale),
      scope: '/',
      display: 'standalone',
      display_override: ['standalone', 'minimal-ui'],
      orientation: 'any',
      background_color: '#000000',
      theme_color: '#000000',
      categories: ['games', 'utilities'],
      prefer_related_applications: false,
      // Opening the app again (or a Deckr link) reuses the open window instead of starting another.
      launch_handler: { client_mode: ['navigate-existing', 'auto'] },
      icons: [
         { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
         { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
         { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
         { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
         { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      ],
      screenshots: [
         narrow('builder'),
         narrow('cards'),
         narrow('profile'),
         {
            src: shot('wide-builder'),
            sizes: '1280x800',
            type: 'image/webp',
            form_factor: 'wide',
            label: t.pwa.screenshots.wide,
         },
      ],
      // Long-press the app icon (Android, desktop): straight to a screen.
      shortcuts: (
         [
            ['/', 'builder'],
            ['/decks', 'decks'],
            ['/cards', 'cards'],
            ['/next', 'chests'],
         ] as const
      ).map(([path, key]) => ({
         name: t.meta.pages[key].title,
         short_name: t.nav[key],
         description: t.meta.pages[key].description,
         url: localizePath(path, locale),
         icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      })),
   };
}

export function manifestResponse(locale: Locale) {
   return new Response(JSON.stringify(buildManifest(locale)), {
      headers: { 'content-type': 'application/manifest+json; charset=utf-8' },
   });
}
