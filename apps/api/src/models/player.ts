import type { LoginMethod, PlayerProfile } from '@deckr/shared';
import { model, Schema } from 'mongoose';
import type { SealedToken } from '../lib/token-cipher.ts';

export interface PlayerDocument {
   /** Player tag without `#`. */
   tag: string;
   /** How the player logged in. `game-token` players are read with Deckr's server key. */
   method: LoginMethod;
   /** The player's own Clash Royale API key, encrypted. Only for `api-key` players. */
   token?: SealedToken;
   profile: PlayerProfile;
   syncedAt: Date;
   /** Why the last automatic sync failed, if it did; cleared on the next success. */
   syncError: string | null;
}

const playerSchema = new Schema<PlayerDocument>(
   {
      tag: { type: String, required: true, unique: true },
      method: { type: String, enum: ['game-token', 'api-key'], default: 'api-key' },
      token: {
         type: new Schema({ iv: String, tag: String, data: String }, { _id: false }),
         required: false,
      },
      profile: { type: Schema.Types.Mixed, required: true },
      syncedAt: { type: Date, required: true },
      syncError: { type: String, default: null },
   },
   { versionKey: false, timestamps: true },
);

export const Player = model<PlayerDocument>('players', playerSchema);
