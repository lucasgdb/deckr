import { getCard } from '@deckr/shared';

/*
 * Card, arena and chest art lives in `public/` as WebP, named by the catalog's slugs
 * (see `scripts/optimize-images.mjs`). A few recent entries have no openly licensed art yet;
 * they render the design system's placeholder. Remove a slug from these sets once its file is added.
 */
const cardsWithoutArt = new Set<string>();
const arenasWithoutArt = new Set<string>();
/** Chest kinds with art, by the slug the API derives from the chest's name (`Gold Crate` → `gold-crate`). */
const chests = new Set([
   'wooden',
   'silver',
   'golden',
   'giant',
   'magical',
   'super-magical',
   'epic',
   'legendary',
   'lightning',
   'mega-lightning',
   'gold-crate',
   'plentiful-gold-crate',
   'overflowing-gold-crate',
   'royal-wild',
   'tower-troop',
   'kings',
   'legendary-kings',
   'fortune',
   'draft',
   'goblins',
]);

export function cardImage(index: number): string | undefined {
   const { slug } = getCard(index);
   return slug && !cardsWithoutArt.has(slug) ? `/cards/${slug}.webp` : undefined;
}

export const arenaImage = (slug: string) => (arenasWithoutArt.has(slug) ? undefined : `/arenas/${slug}.webp`);

export const chestImage = (kind: string) => (chests.has(kind) ? `/chests/${kind}.webp` : undefined);

/** The game's card frame: 302 × 363. */
export const CARD_WIDTH = 302;
export const CARD_HEIGHT = 363;
