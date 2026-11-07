import { cards, DECK_SIZE, EMPTY_CARD, getCard } from './catalog.ts';

export type DeckCards = readonly number[];

export const emptyDeck = (): number[] => Array.from({ length: DECK_SIZE }, () => EMPTY_CARD);

const deckCodes = (deck: DeckCards) => deck.map((card) => getCard(card).code).join(';');

/** Deep link that opens the "copy deck" screen straight in the Clash Royale app. */
export function buildAppLink(deck: DeckCards): string {
   return `clashroyale://copyDeck?deck=${deckCodes(deck)}`;
}

/**
 * The web link the game itself shares: it opens the app's copy-deck screen, or the store when
 * the game is not installed. Only meaningful for a complete deck (see `isCompleteDeck`).
 */
export function buildDeckLink(deck: DeckCards): string {
   return `https://link.clashroyale.com/en?${buildAppLink(deck)}`;
}

/** The game only accepts decks with all eight slots filled. */
export function isCompleteDeck(deck: DeckCards): boolean {
   return deck.length === DECK_SIZE && deck.every((card) => card !== EMPTY_CARD && getCard(card).code !== '');
}

const cardByCode = new Map(cards.filter((card) => card.code).map((card) => [card.code, card.index]));

/**
 * Reads a shared deck link back into card indexes. Accepts the current form
 * (`link.clashroyale.com/en?clashroyale://copyDeck?deck=…`), the older `link.clashroyale.com/deck/en?deck=…`
 * and the bare `clashroyale://copyDeck?deck=…`.
 * Returns `null` when the text holds no 8-card deck. Unknown cards become empty slots.
 */
export function parseDeckLink(text: string): number[] | null {
   const match = /[?&]deck=([^&#\s]+)/.exec(text.trim());

   if (!match?.[1]) return null;

   const codes = decodeURIComponent(match[1]).split(';');

   if (codes.length !== DECK_SIZE) return null;

   return codes.map((code) => cardByCode.get(code) ?? EMPTY_CARD);
}

export function filledSlots(deck: DeckCards): number {
   return deck.filter((card) => card !== EMPTY_CARD).length;
}

const knownCosts = (deck: DeckCards) =>
   deck
      .filter((card) => card !== EMPTY_CARD)
      .map((card) => getCard(card).elixir)
      .filter((cost): cost is number => cost !== null);

/** Average elixir cost of the cards in the deck, ignoring empty slots and variable-cost cards; null when unknown. */
export function averageElixir(deck: DeckCards): number | null {
   const costs = knownCosts(deck);
   return costs.length > 0 ? costs.reduce((sum, cost) => sum + cost, 0) / costs.length : null;
}

/** Elixir to cycle back to a card: the four cheapest cards. Null until four costs are known. */
export function cycleCost(deck: DeckCards): number | null {
   const costs = knownCosts(deck).toSorted((a, b) => a - b);
   return costs.length >= 4 ? costs.slice(0, 4).reduce((sum, cost) => sum + cost, 0) : null;
}
