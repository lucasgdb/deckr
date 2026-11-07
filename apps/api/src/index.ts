import mongoose from 'mongoose';
import { createApp } from './app.ts';
import { env } from './env.ts';
import { migrateLegacyDecks } from './models/deck.ts';

await mongoose.connect(env.MONGODB_URI);
await migrateLegacyDecks();

const server = createApp().listen(env.PORT, () => {
   console.log(`Deckr API listening on http://localhost:${env.PORT}`);
});

async function shutdown(signal: string) {
   console.log(`${signal} received, shutting down.`);
   server.close();
   await mongoose.disconnect();
   process.exit(0);
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
