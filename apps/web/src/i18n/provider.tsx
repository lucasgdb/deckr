'use client';

import { createContext, type ReactNode, use, useMemo } from 'react';
import { type Dictionary, defaultLocale, getDictionary, type Locale, localizePath } from './index';

export interface I18n {
   locale: Locale;
   /** The dictionary for `locale`. */
   t: Dictionary;
   /** A path in this language: `/cards` → `/en/cards` in English. */
   href: (path: string) => string;
}

const I18nContext = createContext<Locale>(defaultLocale);

/** Sets the language for everything below it. The layout wraps the whole app in one. */
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
   return <I18nContext value={locale}>{children}</I18nContext>;
}

export function useI18n(): I18n {
   const locale = use(I18nContext);

   return useMemo(
      () => ({ locale, t: getDictionary(locale), href: (path: string) => localizePath(path, locale) }),
      [locale],
   );
}
