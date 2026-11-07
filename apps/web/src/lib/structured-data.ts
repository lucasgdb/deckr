import { getDictionary, type Locale, localeConfig, locales } from '@/i18n';
import { pageUrl } from './seo';
import { type PageKey, pages, repoUrl, siteUrl } from './site';

/*
 * Schema.org JSON-LD, built only from facts the pages themselves show: what Deckr is, that it's free, runs in the
 * browser, its languages, and who made it. No ratings, reviews or counts. The app, the site and the author each
 * have one `@id` in every language, so search engines see one entity per thing.
 */

const websiteId = `${siteUrl}/#website`;
const appId = `${siteUrl}/#app`;

const author = {
   '@type': 'Person',
   '@id': 'https://lucasbittencourt.dev/#person',
   name: 'Lucas Bittencourt',
   url: 'https://lucasbittencourt.dev/',
   alternateName: 'lucasgdb',
   sameAs: ['https://github.com/lucasgdb', 'https://www.linkedin.com/in/lucas-bittencourt'],
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
            '@id': websiteId,
            url: pageUrl('/', 'pt-br'),
            name: meta.siteName,
            inLanguage: languages,
            author: { '@id': author['@id'] },
         },
         {
            '@type': 'WebApplication',
            '@id': appId,
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
               sameAs: 'https://en.wikipedia.org/wiki/Clash_Royale',
               publisher: { '@type': 'Organization', name: 'Supercell' },
            },
            author: { '@id': author['@id'] },
            sameAs: repoUrl,
            isPartOf: { '@id': websiteId },
         },
         author,
      ],
   };
}

/** An inner page (e.g. the card list): the page itself, part of the site, and its place under the home page. */
export function pageStructuredData(key: Exclude<PageKey, 'builder'>, locale: Locale) {
   const { meta } = getDictionary(locale);
   const url = pageUrl(pages[key].path, locale);

   return {
      '@context': 'https://schema.org',
      '@graph': [
         {
            '@type': 'WebPage',
            '@id': `${url}#webpage`,
            url,
            name: meta.pages[key].title,
            description: meta.pages[key].description,
            inLanguage: localeConfig[locale].htmlLang,
            isPartOf: { '@id': websiteId },
            about: { '@id': appId },
            breadcrumb: { '@id': `${url}#breadcrumb` },
         },
         {
            '@type': 'BreadcrumbList',
            '@id': `${url}#breadcrumb`,
            itemListElement: [
               { '@type': 'ListItem', position: 1, name: meta.siteName, item: pageUrl('/', locale) },
               { '@type': 'ListItem', position: 2, name: meta.pages[key].title, item: url },
            ],
         },
      ],
   };
}
