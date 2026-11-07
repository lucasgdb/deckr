'use client';

import { ArrowUpRight, Languages } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { localeConfig, locales, switchLocalePath } from '@/i18n';
import { useI18n } from '@/i18n/provider';
import { repoUrl } from '@/lib/site';
import { cn } from '@/lib/utils';
import { BrandMark } from './brand-mark';
import { InstallApp } from './pwa';

export function SiteFooter() {
   const { t } = useI18n();

   return (
      <footer className="page flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-8 text-xs text-faint">
         <span className="flex items-center gap-2">
            <BrandMark className="h-4" />
            {t.footer.tagline}
         </span>
         <LanguageLinks className="sm:order-last sm:basis-full" />
         <InstallApp className="basis-full sm:order-last sm:basis-auto" />
         <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {/* Deckr's privacy policy is published with the other tools, on lucasbittencourt.dev. */}
            <a
               href={t.footer.privacyUrl}
               className="flex h-11 items-center rounded-full text-muted transition-colors hover:text-ink pointer-fine:sm:h-auto"
            >
               {t.footer.privacy}
            </a>
            <a
               href={`${repoUrl}/issues`}
               className="flex h-11 items-center rounded-full text-muted transition-colors hover:text-ink pointer-fine:sm:h-auto"
            >
               {t.footer.reportIssue}
            </a>
            <a
               href={repoUrl}
               className="flex h-11 items-center rounded-full text-muted transition-colors hover:text-ink pointer-fine:sm:h-auto"
            >
               {t.footer.sourceCode}
            </a>
            <a
               href="https://lucasbittencourt.dev/"
               target="_blank"
               rel="noopener"
               className="inline-flex h-11 items-center gap-1 rounded-full text-muted transition-colors hover:text-ink pointer-fine:sm:h-auto"
            >
               {t.footer.madeBy}
               <ArrowUpRight aria-hidden className="size-3.5" />
               <span className="sr-only">{t.footer.opensInNewTab}</span>
            </a>
         </span>
         <p className="order-last basis-full text-pretty">{t.footer.about}</p>
         <p className="order-last basis-full text-pretty">
            {t.footer.disclaimer}{' '}
            <a
               href="https://supercell.com/en/fan-content-policy/"
               target="_blank"
               rel="noopener"
               className="rounded-full text-muted underline underline-offset-4 transition-colors hover:text-ink"
            >
               {t.footer.fanContentPolicy}
            </a>
            .
         </p>
      </footer>
   );
}

/** This page in each language. Plain links, so crawlers find every version too. */
export function LanguageLinks({ className }: { className?: string }) {
   const { locale, t } = useI18n();
   const pathname = usePathname();

   return (
      <nav aria-label={t.nav.language} className={cn('flex items-center gap-2', className)}>
         <Languages aria-hidden className="size-3.5" />
         <ul className="flex items-center gap-5 pointer-fine:sm:gap-3">
            {locales.map((other) => (
               <li key={other}>
                  <Link
                     href={switchLocalePath(pathname, other)}
                     hrefLang={localeConfig[other].htmlLang}
                     lang={localeConfig[other].htmlLang}
                     aria-current={other === locale ? 'true' : undefined}
                     className={cn(
                        // 44px tall on touch screens; the text's own height with a mouse.
                        'flex h-11 items-center rounded-full transition-colors hover:text-ink pointer-fine:sm:h-auto',
                        other === locale ? 'text-ink' : 'text-muted',
                     )}
                  >
                     {localeConfig[other].name}
                  </Link>
               </li>
            ))}
         </ul>
      </nav>
   );
}
