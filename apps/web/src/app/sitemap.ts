import type { MetadataRoute } from 'next';
import { locales } from '@/i18n';
import { languageAlternates, pageUrl } from '@/lib/seo';
import { pages } from '@/lib/site';

/** Every indexable page in every language, each listing its translations. */
export default function sitemap(): MetadataRoute.Sitemap {
   return Object.values(pages)
      .filter((page) => page.indexable)
      .flatMap((page) =>
         locales.map((locale) => ({
            url: pageUrl(page.path, locale),
            changeFrequency: 'weekly' as const,
            priority: page.path === '/' ? 1 : 0.7,
            alternates: { languages: languageAlternates(page.path) },
         })),
      );
}
