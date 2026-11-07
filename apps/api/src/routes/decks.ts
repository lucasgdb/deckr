import {
   buildDeckLink,
   MAX_SAVED_DECKS,
   type SavedDeck,
   type SavedDeckInput,
   savedDeckInputSchema,
   syncDecksSchema,
} from '@deckr/shared';
import { Router } from 'express';
import { HttpError } from '../http-error.ts';
import { Deck, type DeckDocument } from '../models/deck.ts';
import { requireTag } from '../session.ts';

/*
 * Saved decks belong to the logged-in player. Players without an account keep decks in their browser;
 * when they log in, the browser sends them here through /sync.
 */
export const decksRouter = Router();

function toSavedDeck(deck: Pick<DeckDocument, '_id' | 'clientId' | 'cards' | 'createdAt'>): SavedDeck {
   return {
      id: deck.clientId ?? deck._id.toHexString(),
      cards: [...deck.cards].sort((a, b) => a.id - b.id).map((slot) => slot.card),
      createdAt: (deck.createdAt ?? deck._id.getTimestamp()).toISOString(),
   };
}

async function listDecks(owner: string): Promise<SavedDeck[]> {
   const decks = await Deck.find({ owner }).sort({ createdAt: -1, _id: -1 }).limit(MAX_SAVED_DECKS).lean();
   return decks.map(toSavedDeck);
}

/** Inserts the deck if this player doesn't have it yet; an existing copy is left as it is. */
function upsert(owner: string, deck: SavedDeckInput) {
   return {
      updateOne: {
         filter: { owner, clientId: deck.id },
         update: {
            $setOnInsert: {
               owner,
               clientId: deck.id,
               cards: deck.cards.map((card, id) => ({ id, card })),
               link: buildDeckLink(deck.cards),
               createdAt: deck.createdAt ? new Date(deck.createdAt) : new Date(),
            },
         },
         upsert: true,
      },
   };
}

decksRouter.get('/', async (req, res) => {
   res.json(await listDecks(await requireTag(req)));
});

decksRouter.post('/', async (req, res) => {
   const owner = await requireTag(req);
   const parsed = savedDeckInputSchema.safeParse(req.body);

   if (!parsed.success) throw new HttpError(400, 'invalid_deck', 'A deck needs exactly 8 known cards.');

   if ((await Deck.countDocuments({ owner })) >= MAX_SAVED_DECKS) {
      throw new HttpError(
         409,
         'deck_limit',
         `You can keep up to ${MAX_SAVED_DECKS} decks. Remove one to save another.`,
         {
            max: MAX_SAVED_DECKS,
         },
      );
   }

   await Deck.bulkWrite([upsert(owner, parsed.data)]);
   const saved = await Deck.findOne({ owner, clientId: parsed.data.id }).lean();

   if (!saved) throw new HttpError(500, 'deck_not_saved', 'The deck wasn’t saved.');
   res.status(201).json(toSavedDeck(saved));
});

decksRouter.delete('/:id', async (req, res) => {
   const owner = await requireTag(req);

   // Removing a deck that's already gone is fine: the result is the same.
   await Deck.deleteOne({ owner, clientId: req.params.id });
   res.status(204).end();
});

/**
 * Merges what the browser kept while logged out: removes the decks deleted there, adds the decks saved there,
 * and answers with the player's full list, which becomes the browser's copy.
 */
decksRouter.post('/sync', async (req, res) => {
   const owner = await requireTag(req);
   const parsed = syncDecksSchema.safeParse(req.body);

   if (!parsed.success) throw new HttpError(400, 'invalid_sync', 'Couldn’t read the decks to sync.');

   const { decks, deleted } = parsed.data;

   if (deleted.length > 0) await Deck.deleteMany({ owner, clientId: { $in: deleted } });

   const existing = await Deck.countDocuments({ owner });
   const room = Math.max(0, MAX_SAVED_DECKS - existing);
   // Newest first, so the decks kept are the latest ones if the player is near the limit.
   const incoming = decks.toSorted((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')).slice(0, room);

   if (incoming.length > 0) await Deck.bulkWrite(incoming.map((deck) => upsert(owner, deck)));

   res.json(await listDecks(owner));
});
