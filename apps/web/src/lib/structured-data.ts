import { getDictionary, type Locale, localeConfig, locales } from '@/i18n';
import { pageUrl } from './seo';
import { siteUrl } from './site';

/*
 * Schema.org JSON-LD for the home page, built only from facts the page itself shows: what Deckr is, that it's free,
 * runs in the browser, its languages, and who made it. No ratings, reviews or counts.
 */

const author = {
   '@type': 'Person',
   '@id': 'https://lucasbittencourt.dev/#person',
   name: 'Lucas Bittencourt',
   url: 'https://lucasbittencourt.dev/',
};

export function homeStructuredData(locale: Locale) {
   const { meta } = getDictionary(locale);
   const url = pageUrl('/', locale);
   const languages = locales.map((other) => localeConfig[other].htmlLang);

   return {
      '@context': 'https://schema.org',
      '@graph': [
         {
            '@type': 'WebSite',
            '@id': `${siteUrl}/#website`,
            url: pageUrl('/', 'pt-br'),
            name: meta.siteName,
            inLanguage: languages,
            author: { '@id': author['@id'] },
         },
         {
            '@type': 'WebApplication',
            '@id': `${url}#app`,
            url,
            name: meta.siteName,
            description: meta.description,
            inLanguage: localeConfig[locale].htmlLang,
            applicationCategory: 'GameApplication',
            operatingSystem: 'Web',
            browserRequirements: 'Requires JavaScript.',
            isAccessibleForFree: true,
            offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
            about: {
               '@type': 'VideoGame',
               name: 'Clash Royale',
               publisher: { '@type': 'Organization', name: 'Supercell' },
            },
            author: { '@id': author['@id'] },
            isPartOf: { '@id': `${siteUrl}/#website` },
         },
         author,
      ],
   };
}
