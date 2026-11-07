import { playerTagSchema, type UpcomingChest } from '@deckr/shared';
import { Router } from 'express';
import { clashRoyale } from '../clash-royale/client.ts';
import { toUpcomingChests } from '../clash-royale/mapping.ts';
import { HttpError } from '../http-error.ts';
import { readKey } from '../players.ts';
import { requireTag } from '../session.ts';

export const chestsRouter = Router();

/**
 * Upcoming chests, read with the signed-in player's key. Players who logged in with their own API key can look
 * up anyone; players who logged in with the in-game token can only see their own chests.
 */
chestsRouter.get('/:tag', async (req, res) => {
   const tag = playerTagSchema.safeParse(req.params.tag);

   if (!tag.success) throw new HttpError(400, 'invalid_tag', 'Invalid player tag.');

   const ownTag = await requireTag(req);
   const access = await readKey(ownTag);

   if (!access) throw new HttpError(401, 'login_required', 'Log in again to look up chests.');

   if (access.method === 'game-token' && tag.data !== ownTag) {
      throw new HttpError(403, 'own_chests_only', 'With the in-game token you can only see your own chests.');
   }

   const chests: UpcomingChest[] = toUpcomingChests(
      await clashRoyale.upcomingChests(tag.data, access.key, access.owner),
   );
   res.json(chests);
});
