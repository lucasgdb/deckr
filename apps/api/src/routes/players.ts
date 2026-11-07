import { loginSchema, type MeResponse, type ServerInfo, type SessionResponse } from '@deckr/shared';
import { Router } from 'express';
import { HttpError } from '../http-error.ts';
import { serverPublicIp } from '../lib/server-ip.ts';
import { Player } from '../models/player.ts';
import { connectWithApiKey, connectWithGameToken, gameTokenLoginSupported, syncPlayer } from '../players.ts';
import { currentTag, endSession, requireTag, startSession } from '../session.ts';

export const playersRouter = Router();

/** What the login dialog needs: the IP to allow on an API key, and whether in-game token login is available. */
playersRouter.get('/server', async (_req, res) => {
   const [ip, gameTokenLogin] = await Promise.all([serverPublicIp(), gameTokenLoginSupported()]);
   res.json({ ip, gameTokenLogin } satisfies ServerInfo);
});

/** Log in with the in-game API token or the player's own API key, store the player, start a session. */
playersRouter.post('/session', async (req, res) => {
   const parsed = loginSchema.safeParse(req.body);

   if (!parsed.success)
      throw new HttpError(
         400,
         'invalid_login',
         parsed.error.issues[0]?.message ?? 'Enter a player tag and an API token.',
      );

   const { method, tag, token } = parsed.data;
   const player =
      method === 'game-token' ? await connectWithGameToken(tag, token) : await connectWithApiKey(tag, token);
   await startSession(res, player.tag);

   res.status(201).json({ player, method } satisfies SessionResponse);
});

playersRouter.delete('/session', async (req, res) => {
   await endSession(req, res);
   res.status(204).end();
});

/** The signed-in player's stored data, or `{ player: null }` when nobody is signed in. */
playersRouter.get('/me', async (req, res) => {
   const tag = await currentTag(req);
   const player = tag ? await Player.findOne({ tag }, { profile: 1, method: 1 }).lean() : null;

   res.json(
      (player
         ? { player: player.profile, method: player.method ?? 'api-key' }
         : { player: null, method: null }) satisfies MeResponse,
   );
});

/** The "Refresh" button: syncs the signed-in player now. */
playersRouter.post('/me/sync', async (req, res) => {
   const tag = await requireTag(req);
   const player = await syncPlayer(tag);
   const stored = await Player.findOne({ tag }, { method: 1 }).lean();
   res.json({ player, method: stored?.method ?? 'api-key' } satisfies SessionResponse);
});
