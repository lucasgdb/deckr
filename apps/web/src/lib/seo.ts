import type { Metadata } from 'next';
import { defaultLocale, getDictionary, type Locale, localeConfig, locales, localizePath } from '@/i18n';
import { isIndexable, type PageKey, pages, siteUrl } from './site';

/*
 * Metadata in one place: canonical URLs, hreflang alternates, Open Graph and robots. Next.js replaces
 * `alternates` and `openGraph` from parent layouts instead of merging them, so every page sets them in full.
 */

export const pageUrl = (path: string, locale: Locale = defaultLocale) => `${siteUrl}${localizePath(path, locale)}`;

/** hreflang: every language's version of the page, plus `x-default` (Portuguese, the root URLs). */
export function languageAlternates(path: string): Record<string, string> {
   return {
      ...Object.fromEntries(locales.map((locale) => [localeConfig[locale].htmlLang, pageUrl(path, locale)])),
      'x-default': pageUrl(path, defaultLocale),
   };
}

export function baseOpenGraph(locale: Locale) {
   const { meta } = getDictionary(locale);

   return {
      siteName: meta.siteName,
      // The language's share image (app/[locale]/opengraph-image.tsx), set here because a page's own `openGraph`
      // replaces the layout's and would drop it.
      images: [{ url: `/${locale}/opengraph-image`, width: 1200, height: 630, alt: meta.title }],
      locale: localeConfig[locale].ogLocale,
      alternateLocale: locales.filter((other) => other !== locale).map((other) => localeConfig[other].ogLocale),
      type: 'website' as const,
   };
}

const robots = (indexable: boolean): Metadata['robots'] =>
   indexable && isIndexable()
      ? {
           index: true,
           follow: true,
           googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
        }
      : { index: false, follow: true };

/** The layout's metadata: title template, site description, defaults for pages that set nothing. */
export function rootMetadata(locale: Locale): Metadata {
   const { meta } = getDictionary(locale);

   return {
      metadataBase: new URL(siteUrl),
      title: { default: meta.title, template: `%s · ${meta.siteName}` },
      description: meta.description,
      applicationName: meta.siteName,
      alternates: { canonical: localizePath('/', locale), languages: languageAlternates('/') },
      openGraph: { ...baseOpenGraph(locale), title: meta.title, description: meta.description },
      twitter: { card: 'summary_large_image' },
      robots: robots(true),
      verification: {
         google: process.env.GOOGLE_SITE_VERIFICATION,
         other: process.env.BING_SITE_VERIFICATION
            ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION }
            : undefined,
      },
   };
}

/** A page's metadata in `locale`: its title and description, canonical URL, alternates and robots. */
export function pageMetadata(key: PageKey, locale: Locale): Metadata {
   const { meta } = getDictionary(locale);
   const page = pages[key];
   const copy = meta.pages[key];
   // The home page is the builder: its title is the site's full title, not "Deck builder · Deckr".
   const title = page.path === '/' ? meta.title : `${copy.title} · ${meta.siteName}`;

   return {
      title: page.path === '/' ? { absolute: meta.title } : copy.title,
      description: copy.description,
      alternates: { canonical: localizePath(page.path, locale), languages: languageAlternates(page.path) },
      openGraph: {
         ...baseOpenGraph(locale),
         title,
         description: copy.description,
         url: localizePath(page.path, locale),
      },
      robots: robots(page.indexable),
   };
}
