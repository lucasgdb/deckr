import { z } from 'zod';

const list = z
   .string()
   .optional()
   .transform((value) =>
      value
         ? value
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
         : [],
   );

/** Compose passes unset variables as empty strings; treat those as unset. */
const optional = <T extends z.ZodType>(schema: T) =>
   z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

const envSchema = z.object({
   PORT: z.coerce.number().int().positive().default(3001),
   MONGODB_URI: z.string().min(1).default('mongodb://localhost:27017/deckr'),
   /** Comma-separated origins allowed to call the API. Empty allows any. */
   CORS_ORIGIN: list,
   CLASH_ROYALE_API_URL: z.url().default('https://api.clashroyale.com/v1'),
   /**
    * Deckr's own Clash Royale developer key (allowed for this server's IP). Needed for players who log in with
    * the in-game API token: it verifies the token and reads their data. That login is off when unset.
    */
   CLASH_ROYALE_API_KEY: optional(z.string().min(20)),
   /**
    * 32-byte key (base64 or hex) that encrypts stored API tokens. When unset, one is generated on first start
    * and kept in DATA_DIR, so it survives restarts.
    */
   TOKEN_SECRET: optional(z.string()),
   DATA_DIR: z.string().default('.data'),
   /** Mark the session cookie `Secure`; turn on when Deckr is served over HTTPS. */
   COOKIE_SECURE: z.preprocess((value) => (value === '' ? undefined : value), z.stringbool().default(false)),
});

export const env = envSchema.parse(process.env);
