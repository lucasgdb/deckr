import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { BrandMark } from '@/components/brand-mark';
import { getDictionary, localeConfig, locales, localizePath } from '@/i18n';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

/*
 * The 404 for addresses outside the app's pages (the app's own pages render a 404 in their language). It can't
 * tell the language, so it says it in each one.
 */
export const metadata: Metadata = {
   title: locales.map((locale) => getDictionary(locale).notFound.title).join(' · '),
   robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
   return (
      <html lang={localeConfig['pt-br'].htmlLang} className={inter.variable}>
         <body>
            <main className="page flex min-h-dvh flex-col justify-center gap-8 py-16">
               <BrandMark className="h-10" />
               {locales.map((locale) => {
                  const t = getDictionary(locale);

                  return (
                     <section key={locale} lang={localeConfig[locale].htmlLang} className="flex flex-col gap-2">
                        <h1 className="text-xl font-semibold">{t.notFound.title}</h1>
                        <p className="text-muted">{t.notFound.body}</p>
                        <a
                           href={localizePath('/', locale)}
                           className="w-fit font-medium underline-offset-4 hover:underline"
                        >
                           {t.notFound.home}
                        </a>
                     </section>
                  );
               })}
            </main>
         </body>
      </html>
   );
}
