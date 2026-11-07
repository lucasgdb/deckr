import { model, Schema, type Types } from 'mongoose';

export interface DeckDocument {
   _id: Types.ObjectId;
   /** Tag of the player who saved it. Decks saved before accounts existed have none until claimed. */
   owner?: string | null;
   /** The id the browser gave the deck, so a deck saved before logging in syncs without duplicating. */
   clientId?: string;
   /** Slots in order; this `{ id, card }` shape is kept so decks from the first version still read. */
   cards: { id: number; card: number }[];
   link: string;
   createdAt?: Date;
}

const deckSchema = new Schema<DeckDocument>(
   {
      owner: { type: String, default: null },
      clientId: { type: String },
      cards: {
         type: [{ _id: false, id: { type: Number, required: true }, card: { type: Number, required: true } }],
         required: true,
      },
      link: { type: String, required: true },
      createdAt: { type: Date, default: () => new Date() },
   },
   { versionKey: false },
);

// One copy of each deck per player; listing is per player, newest first.
deckSchema.index({ owner: 1, clientId: 1 }, { unique: true, partialFilterExpression: { owner: { $type: 'string' } } });
deckSchema.index({ owner: 1, createdAt: -1 });

/** Kept as `decks` so existing databases keep working. */
export const Deck = model<DeckDocument>('decks', deckSchema);

/** Gives decks from before ids existed an id and a creation date (taken from their ObjectId). Safe to rerun. */
export async function migrateLegacyDecks() {
   const legacy = await Deck.find({ clientId: { $exists: false } }, { _id: 1 }).lean();

   if (legacy.length === 0) return;

   await Deck.bulkWrite(
      legacy.map((deck) => ({
         updateOne: {
            filter: { _id: deck._id },
            update: { $set: { clientId: deck._id.toHexString(), createdAt: deck._id.getTimestamp() } },
         },
      })),
   );
   console.log(`Gave ${legacy.length} older deck(s) an id.`);
}
