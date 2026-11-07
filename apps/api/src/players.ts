import type { LoginMethod, PlayerProfile } from '@deckr/shared';
import { clashRoyale, type KeyOwner, MissingScopeError } from './clash-royale/client.ts';
import { toProfile } from './clash-royale/mapping.ts';
import { env } from './env.ts';
import { HttpError } from './http-error.ts';
import { openToken, sealToken } from './lib/token-cipher.ts';
import { Player, type PlayerDocument } from './models/player.ts';

/** A key that can read Clash Royale for one player, and who owns it. */
export interface PlayerKey {
   key: string;
   owner: KeyOwner;
   method: LoginMethod;
}

function serverKey(): string {
   if (!env.CLASH_ROYALE_API_KEY) {
      throw new HttpError(
         503,
         'game_token_unavailable',
         'Logging in with the in-game API token isn’t set up on this server yet.',
      );
   }

   return env.CLASH_ROYALE_API_KEY;
}

let gameTokenCheck: { supported: boolean; at: number } | null = null;
const CHECK_TTL = 60 * 60 * 1000;

/**
 * Whether logging in with the in-game token works on this server: it needs CLASH_ROYALE_API_KEY, and that key must
 * be allowed to call `verifytoken` (Clash Royale grants this to partner sites only). Checked once an hour by
 * verifying a dummy token: a key with the permission gets an answer, one without gets `accessDenied.invalidScope`.
 */
export async function gameTokenLoginSupported(): Promise<boolean> {
   if (!env.CLASH_ROYALE_API_KEY) return false;
   if (gameTokenCheck && Date.now() - gameTokenCheck.at < CHECK_TTL) return gameTokenCheck.supported;

   let supported: boolean;

   try {
      await clashRoyale.verifyToken('2PP', 'deckr-permission-check', env.CLASH_ROYALE_API_KEY);
      supported = true;
   } catch (error) {
      // Only a missing permission rules it out; other failures (a typo'd tag, a hiccup) still mean the call is allowed.
      supported = !(error instanceof MissingScopeError);
   }

   gameTokenCheck = { supported, at: Date.now() };
   return supported;
}

/** Fetches the player and their battle log from Clash Royale. Throws if the key can't read this player. */
async function fetchProfile(tag: string, { key, owner }: Pick<PlayerKey, 'key' | 'owner'>): Promise<PlayerProfile> {
   const [player, battles] = await Promise.all([
      clashRoyale.player(tag, key, owner),
      clashRoyale.battleLog(tag, key, owner),
   ]);
   return toProfile(player, battles, new Date());
}

/**
 * Another player's profile, read live with the signed-in player's key (nothing is stored). Players who logged in with
 * the in-game token read through Deckr's own key and only see their own data, so they can't look anyone else up.
 */
export async function lookUpPlayer(tag: string, viewerTag: string): Promise<Omit<PlayerProfile, 'battles'>> {
   const access = await readKey(viewerTag);

   if (!access) throw new HttpError(401, 'login_required', 'Log in again to compare profiles.');

   if (access.method === 'game-token' && tag !== viewerTag) {
      throw new HttpError(403, 'own_profile_only', 'With the in-game token you can only see your own profile.');
   }

   const { battles: _battles, ...profile } = toProfile(
      await clashRoyale.player(tag, access.key, access.owner),
      [],
      new Date(),
   );
   return profile;
}

/** Log in with the player's own developer API key: checks it against Clash Royale and stores it encrypted. */
export async function connectWithApiKey(tag: string, apiKey: string): Promise<PlayerProfile> {
   const profile = await fetchProfile(tag, { key: apiKey, owner: 'player' });

   await Player.findOneAndUpdate(
      { tag: profile.tag },
      {
         tag: profile.tag,
         method: 'api-key',
         token: sealToken(apiKey),
         profile,
         syncedAt: new Date(profile.syncedAt),
         syncError: null,
      },
      { upsert: true },
   );

   return profile;
}

/**
 * Log in with the token from the game's Settings → API Token. Clash Royale confirms the token belongs to the
 * player; the token itself is not kept, and the player's data is read with Deckr's own key from then on.
 */
export async function connectWithGameToken(tag: string, gameToken: string): Promise<PlayerProfile> {
   const key = serverKey();
   const result = await clashRoyale.verifyToken(tag, gameToken, key);

   if (result.status !== 'ok') {
      throw new HttpError(
         401,
         'game_token_invalid',
         'That token isn’t valid for this player. In Clash Royale, open Settings → API Token and copy a fresh one.',
      );
   }

   const profile = await fetchProfile(tag, { key, owner: 'server' });

   await Player.findOneAndUpdate(
      { tag: profile.tag },
      {
         $set: {
            tag: profile.tag,
            method: 'game-token',
            profile,
            syncedAt: new Date(profile.syncedAt),
            syncError: null,
         },
         // Switching from an API key to the in-game token: don't keep the old key around.
         $unset: { token: 1 },
      },
      { upsert: true },
   );

   return profile;
}

function keyFor(player: Pick<PlayerDocument, 'method' | 'token'>): PlayerKey {
   if (player.method === 'game-token') return { key: serverKey(), owner: 'server', method: 'game-token' };
   if (!player.token) throw new HttpError(401, 'api_key_missing', 'Your saved API key is missing. Log in again.');

   return { key: openToken(player.token), owner: 'player', method: 'api-key' };
}

/** The key to read Clash Royale with on behalf of a stored player, or null if they aren't connected. */
export async function readKey(tag: string): Promise<PlayerKey | null> {
   const player = await Player.findOne({ tag }, { method: 1, token: 1 }).lean();
   return player ? keyFor(player) : null;
}

/** Refreshes one stored player with the key their login method uses. */
export async function syncPlayer(tag: string): Promise<PlayerProfile> {
   const player = await Player.findOne({ tag });

   if (!player) throw new Error(`Player ${tag} isn’t connected.`);

   try {
      const profile = await fetchProfile(tag, keyFor(player));
      player.profile = profile;
      player.syncedAt = new Date(profile.syncedAt);
      player.syncError = null;
      await player.save();
      return profile;
   } catch (error) {
      player.syncError = error instanceof Error ? error.message : 'Sync failed.';
      await player.save();
      throw error;
   }
}
