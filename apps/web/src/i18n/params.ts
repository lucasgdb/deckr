import { defaultLocale, isLocale, type Locale } from './config';

/**
 * The `[locale]` route param as a `Locale`. Unknown languages never get this far (the layout sets
 * `dynamicParams = false`), so this only guards the type; it doesn't throw, because Next renders the 404 page
 * through the same layout and a second `notFound()` there would replace it with a bare error page.
 */
export async function localeParam(params: Promise<{ locale: string }>): Promise<Locale> {
   const { locale } = await params;

   return isLocale(locale) ? locale : defaultLocale;
}
