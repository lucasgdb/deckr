/*
 * Languages and their URLs. Portuguese lives at the root (`/cards`); English under `/en` (`/en/cards`).
 * No Next.js imports, so the proxy, metadata routes and tests can all use it.
 */

export const locales = ['pt-br', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'pt-br';

export const localeConfig = {
   'pt-br': {
      /** `<html lang>` and hreflang. */
      htmlLang: 'pt-BR',
      /** Open Graph `og:locale`. */
      ogLocale: 'pt_BR',
      /** Intl formatters (numbers, relative dates). */
      intl: 'pt-BR',
      /** Path prefix; the default language has none. */
      pathPrefix: '',
      /** Short label for the language switcher. */
      label: 'PT',
      /** The language's own name, as the switcher lists it. */
      name: 'Português',
   },
   en: {
      htmlLang: 'en',
      ogLocale: 'en_US',
      intl: 'en-US',
      pathPrefix: '/en',
      label: 'EN',
      name: 'English',
   },
} as const satisfies Record<Locale, unknown>;

export const isLocale = (value: unknown): value is Locale => locales.includes(value as Locale);

/** `/cards` → `/en/cards` for English; unchanged for Portuguese. Keeps any query string or hash. */
export function localizePath(path: string, locale: Locale): string {
   const prefix = localeConfig[locale].pathPrefix;

   if (!prefix) return path;
   if (path === '/' || path.startsWith('/?') || path.startsWith('/#')) return `${prefix}${path.slice(1)}`;

   return `${prefix}${path}`;
}

/**
 * `/en/cards` → `{ locale: 'en', path: '/cards' }`; `/cards` → `{ locale: 'pt-br', path: '/cards' }`. Also takes the
 * internal `/pt-br/cards`, which is what `usePathname()` returns while a rewritten Portuguese page renders on the server.
 */
export function splitLocalePath(pathname: string): { locale: Locale; path: string } {
   const internal = `/${defaultLocale}`;

   if (pathname === internal || pathname.startsWith(`${internal}/`)) {
      return { locale: defaultLocale, path: pathname.slice(internal.length) || '/' };
   }

   for (const locale of locales) {
      const prefix = localeConfig[locale].pathPrefix;

      if (prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`))) {
         return { locale, path: pathname.slice(prefix.length) || '/' };
      }
   }

   return { locale: defaultLocale, path: pathname };
}

/** The same page in another language: `/en/cards` → `/cards`. */
export const switchLocalePath = (pathname: string, locale: Locale) =>
   localizePath(splitLocalePath(pathname).path, locale);
