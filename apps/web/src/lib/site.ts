/*
 * Site-wide facts for metadata, the sitemap and robots.txt. No Next.js imports.
 */

/** Public origin, e.g. `https://deckr.app`. Read at build time; canonical and hreflang URLs need it. */
export const siteUrl = (process.env.SITE_URL || 'http://localhost:8080').replace(/\/+$/, '');

/**
 * Every page, by key. The key names its copy in the dictionaries (`meta.pages.<key>`). Pages that only show the
 * visitor's own data (their decks, their profile) stay out of search results and the sitemap. So does the chests page:
 * Clash Royale dropped the chest cycle in 2025, so it has nothing to offer someone arriving from a search.
 */
export const pages = {
   builder: { path: '/', indexable: true },
   cards: { path: '/cards', indexable: true },
   chests: { path: '/next', indexable: false },
   decks: { path: '/decks', indexable: false },
   profile: { path: '/profile', indexable: false },
} as const satisfies Record<string, { path: string; indexable: boolean }>;

export type PageKey = keyof typeof pages;

/** Deckr's source code; issues there are how people report problems. */
export const repoUrl = 'https://github.com/lucasgdb/deckr';

/** Search engines index the site only when it says where it lives; local and preview builds stay out. */
export const isIndexable = () => Boolean(process.env.SITE_URL) && process.env.SITE_INDEXABLE !== 'false';
