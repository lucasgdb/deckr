import data from './catalog.json' with { type: 'json' };

/**
 * Bump whenever the card list changes. Card indexes are stable across versions: new cards are only
 * ever appended, because saved decks and stored card pools refer to cards by index.
 */
export const CATALOG_VERSION: number = data.version;

/** Index of the placeholder used for an empty deck slot. */
export const EMPTY_CARD = 0;

export const DECK_SIZE = 8;

export interface Card {
   index: number;
   name: string;
   /** Art file name (without extension) under the web app's `public/cards`. */
   slug: string;
   /** Clash Royale card id used in deck links; empty for the placeholder. */
   code: string;
   /** Trophy Road arena (level) where the card unlocks. */
   arena: number;
   /** Elixir cost; null when it varies (Mirror costs the mirrored card's cost + 1). */
   elixir: number | null;
}

export interface Arena {
   /** Position on the Trophy Road; Training Camp is 0. */
   level: number;
   slug: string;
   name: string;
   /** Indexes of the cards that unlock in this arena. */
   cards: number[];
}

export const cards: readonly Card[] = data.cards.map((card, index) => ({ index, ...card }));

export const playableCards: readonly Card[] = cards.filter((card) => card.index !== EMPTY_CARD);

/** Arenas that unlock at least one card, in Trophy Road order. */
export const arenas: readonly Arena[] = data.arenas.map((arena) => ({
   ...arena,
   cards: playableCards.filter((card) => card.arena === arena.level).map((card) => card.index),
}));

export function getCard(index: number): Card {
   return cards[index] ?? (cards[EMPTY_CARD] as Card);
}

const indexByCode = new Map(playableCards.map((card) => [Number(card.code), card.index]));

/** Catalog index of a card from its Clash Royale id, or `undefined` for cards Deckr doesn't know yet. */
export function cardIndexById(id: number): number | undefined {
   return indexByCode.get(id);
}
