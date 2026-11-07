import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { LoginDialogLoader } from '@/components/login-dialog-loader';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { Toaster, TooltipProvider } from '@/components/ui';
import { getDictionary, localeConfig, locales } from '@/i18n';
import { localeParam } from '@/i18n/params';
import { I18nProvider } from '@/i18n/provider';
import { prepaintScript } from '@/lib/prepaint';
import { SavedDecksSync } from '@/lib/saved-decks';
import { rootMetadata } from '@/lib/seo';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

/*
 * One root layout for every language. Portuguese pages are served from the root URLs (the proxy rewrites `/cards`
 * to `/pt-br/cards` internally); English ones from `/en/...`. Both are prerendered.
 */
export const dynamicParams = false;

export function generateStaticParams() {
   return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
   return rootMetadata(await localeParam(params));
}

export const viewport: Viewport = {
   themeColor: '#000000',
   colorScheme: 'dark',
};

export default async function RootLayout({ children, params }: LayoutProps<'/[locale]'>) {
   const locale = await localeParam(params);
   const t = getDictionary(locale);

   return (
      <html lang={localeConfig[locale].htmlLang} className={inter.variable} suppressHydrationWarning>
         <head>
            {/* Runs before the first paint: marks what this browser has stored (see lib/prepaint.ts). */}
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed string, no user data. */}
            <script dangerouslySetInnerHTML={{ __html: prepaintScript }} />
         </head>
         <body>
            <I18nProvider locale={locale}>
               <TooltipProvider>
                  <div className="isolate flex min-h-dvh flex-col">
                     <a
                        href="#main"
                        className="sr-only z-50 rounded-full bg-ink px-4 py-2 font-medium text-black focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
                     >
                        {t.common.skipToContent}
                     </a>
                     <SiteHeader />
                     <main id="main" tabIndex={-1} className="page flex-1 pb-16 outline-none">
                        {children}
                     </main>
                     <SiteFooter />
                  </div>
                  <LoginDialogLoader />
                  <SavedDecksSync />
               </TooltipProvider>
               <Toaster />
            </I18nProvider>
         </body>
      </html>
   );
}
