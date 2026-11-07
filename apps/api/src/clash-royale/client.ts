import { env } from '../env.ts';
import { HttpError } from '../http-error.ts';
import { serverPublicIp } from '../lib/server-ip.ts';
import type { RawBattle, RawPlayer, RawUpcomingChests } from './types.ts';

/** `#ABC123` / `ABC123` → `%23ABC123`, as the API expects in paths. */
const encodeTag = (tag: string) => encodeURIComponent(`#${tag.replace(/^#/, '')}`);

/** Clash Royale answered `accessDenied.invalidScope`: the key is valid but isn't allowed this endpoint. */
export class MissingScopeError extends HttpError {
   constructor() {
      super(
         503,
         'game_token_unavailable',
         'Logging in with the in-game token isn’t available: Clash Royale only grants that permission to partner sites. Log in with your own API key instead.',
      );
   }
}

/** Whose key a request uses: a player's own developer key, or Deckr's server key. It decides the 403 message. */
type KeyOwner = 'player' | 'server';

async function request<T>(path: string, token: string, owner: KeyOwner = 'player', body?: unknown): Promise<T> {
   let response: Response;

   try {
      response = await fetch(`${env.CLASH_ROYALE_API_URL}${path}`, {
         method: body === undefined ? 'GET' : 'POST',
         headers: {
            authorization: `Bearer ${token}`,
            accept: 'application/json',
            ...(body === undefined ? {} : { 'content-type': 'application/json' }),
         },
         body: body === undefined ? undefined : JSON.stringify(body),
         signal: AbortSignal.timeout(10_000),
      });
   } catch {
      throw new HttpError(502, 'cr_unreachable', 'Clash Royale didn’t answer. Try again in a moment.');
   }

   if (response.ok) return (await response.json()) as T;

   switch (response.status) {
      case 400:
         throw new HttpError(400, 'cr_bad_request', 'Clash Royale rejected the request. Check the player tag.');
      case 403: {
         const ip = await serverPublicIp();
         const reason = await response
            .json()
            .then((body) => (body as { reason?: string }).reason)
            .catch(() => undefined);

         // The key works but lacks a permission (e.g. verifying in-game tokens, which Supercell reserves for partners).
         if (reason === 'accessDenied.invalidScope') throw new MissingScopeError();

         if (owner === 'server') {
            console.error(`Clash Royale rejected CLASH_ROYALE_API_KEY (server IP ${ip ?? 'unknown'}).`);
            throw new HttpError(
               503,
               'cr_server_key_rejected',
               'Deckr can’t reach Clash Royale right now. Try again later or log in with your own API key.',
            );
         }

         throw new HttpError(
            401,
            'cr_key_rejected',
            `Clash Royale rejected the API token. Make sure it’s copied in full and that the key allows the IP address ${ip ?? 'of this server'}.`,
            { ip },
         );
      }
      case 404:
         throw new HttpError(404, 'cr_player_not_found', 'No player found with that tag.');
      case 429:
         throw new HttpError(
            429,
            'cr_rate_limited',
            'Clash Royale is limiting requests for this token. Try again in a minute.',
         );
      case 503:
         throw new HttpError(503, 'cr_maintenance', 'Clash Royale is under maintenance. Try again later.');
      default:
         throw new HttpError(502, 'cr_error', `Clash Royale answered with status ${response.status}.`, {
            status: response.status,
         });
   }
}

export const clashRoyale = {
   player: (tag: string, token: string, owner?: KeyOwner) =>
      request<RawPlayer>(`/players/${encodeTag(tag)}`, token, owner),
   battleLog: (tag: string, token: string, owner?: KeyOwner) =>
      request<RawBattle[]>(`/players/${encodeTag(tag)}/battlelog`, token, owner),
   upcomingChests: (tag: string, token: string, owner?: KeyOwner) =>
      request<RawUpcomingChests>(`/players/${encodeTag(tag)}/upcomingchests`, token, owner),
   /** Checks the token from the game's Settings → API Token against the player, with Deckr's server key. */
   verifyToken: (tag: string, playerToken: string, serverKey: string) =>
      request<{ status?: string }>(`/players/${encodeTag(tag)}/verifytoken`, serverKey, 'server', {
         token: playerToken,
      }),
};

export type { KeyOwner };
