import { z } from 'zod';
import { cards, DECK_SIZE } from './catalog.ts';

export const cardIndexSchema = z
   .number()
   .int()
   .min(0)
   .max(cards.length - 1);

/** Most decks one player can keep. */
export const MAX_SAVED_DECKS = 200;

/**
 * A saved deck's id. It's created in the browser when the deck is saved, so a deck saved without logging in
 * keeps its identity when it's synced to the player's account later.
 */
export const deckIdSchema = z
   .string()
   .min(8)
   .max(64)
   .regex(/^[A-Za-z0-9_-]+$/);

export const savedDeckInputSchema = z.object({
   id: deckIdSchema,
   cards: z.array(cardIndexSchema).length(DECK_SIZE),
   createdAt: z.iso.datetime().optional(),
});

/** What the browser sends when a player logs in: decks saved without an account, and decks removed meanwhile. */
export const syncDecksSchema = z.object({
   decks: z.array(savedDeckInputSchema).max(MAX_SAVED_DECKS),
   deleted: z.array(deckIdSchema).max(1000),
});

export type SavedDeckInput = z.infer<typeof savedDeckInputSchema>;
export type SyncDecksInput = z.infer<typeof syncDecksSchema>;

export interface SavedDeck {
   id: string;
   /** Catalog indexes in slot order. */
   cards: number[];
   /** ISO date-time. */
   createdAt: string;
}

export const playerTagSchema = z
   .string()
   .trim()
   .toUpperCase()
   .transform((tag) => tag.replace(/[^A-Z0-9]/g, ''))
   .pipe(z.string().min(3).max(15));

export interface UpcomingChest {
   /** Stable slug of the chest kind, used for its art: `golden`, `mega-lightning`, `gold-crate`. */
   chest: string;
   /** The chest's name as the game shows it, e.g. `Golden Chest`, `Gold Crate`. */
   name: string;
   /** `Next`, or how many battles after the next one (`+1`, `+12`). */
   position: string;
}

/**
 * Why a request failed. The web app words each code in the reader's language; `message` is an English fallback
 * for logs and other clients.
 */
export const apiErrorCodes = [
   'internal',
   'not_found',
   'invalid_login',
   'invalid_tag',
   'login_required',
   'session_expired',
   'api_key_missing',
   'own_chests_only',
   'own_profile_only',
   'invalid_deck',
   'deck_limit',
   'deck_not_saved',
   'invalid_sync',
   'game_token_unavailable',
   'game_token_invalid',
   'cr_unreachable',
   'cr_bad_request',
   'cr_key_rejected',
   'cr_server_key_rejected',
   'cr_player_not_found',
   'cr_rate_limited',
   'cr_maintenance',
   'cr_error',
] as const;

export type ApiErrorCode = (typeof apiErrorCodes)[number];

/** Values a message needs, e.g. the deck limit or the IP address to allow. */
export type ApiErrorParams = Record<string, string | number | null>;

export interface ApiError {
   code: ApiErrorCode;
   message: string;
   params?: ApiErrorParams;
}
