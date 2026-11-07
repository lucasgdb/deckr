import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from '../env.ts';

/*
 * Clash Royale API tokens are stored encrypted (AES-256-GCM), so a database dump alone doesn't leak them.
 * The key comes from TOKEN_SECRET or, if unset, a random key generated once and kept in DATA_DIR.
 */

function decodeKey(value: string): Buffer {
   // A Clash Royale API key is a long JWT (three dot-separated parts): easy to paste into the wrong variable.
   if (value.split('.').length === 3 && value.length > 100) {
      throw new Error(
         'TOKEN_SECRET looks like a Clash Royale API key. Put that key in CLASH_ROYALE_API_KEY instead, and leave TOKEN_SECRET empty (or set it to `openssl rand -base64 32`).',
      );
   }

   const key = /^[0-9a-f]{64}$/i.test(value) ? Buffer.from(value, 'hex') : Buffer.from(value, 'base64');

   if (key.length !== 32)
      throw new Error('TOKEN_SECRET must be 32 bytes, as base64 or hex: `openssl rand -base64 32`.');
   return key;
}

function loadKey(): Buffer {
   if (env.TOKEN_SECRET) return decodeKey(env.TOKEN_SECRET);

   const file = join(env.DATA_DIR, 'token-secret');

   try {
      return decodeKey(readFileSync(file, 'utf8').trim());
   } catch {
      const key = randomBytes(32);
      mkdirSync(env.DATA_DIR, { recursive: true });
      writeFileSync(file, key.toString('base64'), { mode: 0o600 });
      console.log(`Generated a token encryption key in ${file}.`);
      return key;
   }
}

const key = loadKey();

export interface SealedToken {
   iv: string;
   tag: string;
   data: string;
}

export function sealToken(token: string): SealedToken {
   const iv = randomBytes(12);
   const cipher = createCipheriv('aes-256-gcm', key, iv);
   const data = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);

   return { iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64') };
}

export function openToken(sealed: SealedToken): string {
   const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(sealed.iv, 'base64'));
   decipher.setAuthTag(Buffer.from(sealed.tag, 'base64'));

   return Buffer.concat([decipher.update(Buffer.from(sealed.data, 'base64')), decipher.final()]).toString('utf8');
}
