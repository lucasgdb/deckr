import { model, Schema } from 'mongoose';

export interface SessionDocument {
   /** SHA-256 of the cookie value; the raw value is never stored. */
   hash: string;
   tag: string;
   expiresAt: Date;
}

const sessionSchema = new Schema<SessionDocument>(
   {
      hash: { type: String, required: true, unique: true },
      tag: { type: String, required: true, index: true },
      // MongoDB removes the session once it expires.
      expiresAt: { type: Date, required: true, expires: 0 },
   },
   { versionKey: false },
);

export const Session = model<SessionDocument>('sessions', sessionSchema);
