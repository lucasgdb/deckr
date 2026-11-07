import { z } from 'zod';
import { playerTagSchema } from './schemas.ts';

/**
 * How a player logs in:
 * - `game-token`: the short token from the game's Settings → API Token. It proves the account is theirs;
 *   Deckr then reads their data with its own server key, and they can only see their own data.
 * - `api-key`: their own Clash Royale developer API key, which Deckr stores encrypted and uses for their requests.
 */
export type LoginMethod = 'game-token' | 'api-key';

export const loginSchema = z.discriminatedUnion('method', [
   z.object({
      method: z.literal('game-token'),
      tag: playerTagSchema,
      token: z
         .string()
         .trim()
         .min(4, 'That doesn’t look like the in-game API token.')
         .max(64)
         .regex(/^\S+$/, 'The token has no spaces.'),
   }),
   z.object({
      method: z.literal('api-key'),
      tag: playerTagSchema,
      token: z
         .string()
         .trim()
         .min(20, 'That doesn’t look like an API key.')
         .max(4096)
         .regex(/^\S+$/, 'API keys have no spaces.'),
   }),
]);

export type LoginInput = z.input<typeof loginSchema>;

export interface OwnedCard {
   /** Catalog index. */
   index: number;
   /** Level as shown in the game (1–16), whatever the card's rarity. */
   level: number;
   /** Cards collected towards the next upgrade. */
   count: number;
   evolutionLevel: number;
}

export type BattleResult = 'win' | 'loss' | 'draw';

export interface BattleSummary {
   /** ISO date-time. */
   time: string;
   mode: string;
   result: BattleResult;
   crowns: number;
   opponentCrowns: number;
   trophyChange: number | null;
   opponent: { name: string; tag: string; trophies: number | null; clan: string | null };
   /** Catalog indexes; unknown cards are empty slots. */
   deck: number[];
   opponentDeck: number[];
}

export interface PlayerProfile {
   tag: string;
   name: string;
   kingLevel: number;
   trophies: number;
   bestTrophies: number;
   arena: { id: number; name: string } | null;
   clan: { tag: string; name: string; role: string | null } | null;
   wins: number;
   losses: number;
   threeCrownWins: number;
   battleCount: number;
   /** Catalog indexes of the deck the player has selected in the game. */
   currentDeck: number[];
   favouriteCard: number | null;
   cards: OwnedCard[];
   /** Owned cards that are newer than Deckr's catalog. */
   unknownCards: number;
   battles: BattleSummary[];
   /** ISO date-time of the last successful sync with Clash Royale. */
   syncedAt: string;
}

export interface SessionResponse {
   player: PlayerProfile;
   /** How this player logged in; `game-token` sessions only see the player's own data. */
   method: LoginMethod;
}

/** `GET /api/me`: the signed-in player, or nobody. Nobody isn't an error, so it's a 200 like the rest. */
export type MeResponse = SessionResponse | { player: null; method: null };

export interface ServerInfo {
   /** Public IP address the Deckr server uses to call the Clash Royale API, or null if it couldn't be found. */
   ip: string | null;
   /** Whether the server has its own Clash Royale key, which logging in with the in-game token needs. */
   gameTokenLogin: boolean;
}
