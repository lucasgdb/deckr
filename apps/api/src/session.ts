import { createHash, randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import { env } from './env.ts';
import { HttpError } from './http-error.ts';
import { Session } from './models/session.ts';

const COOKIE = 'deckr_session';
const MAX_AGE_DAYS = 90;

const hash = (value: string) => createHash('sha256').update(value).digest('hex');

function readCookie(req: Request, name: string): string | null {
   for (const part of (req.headers.cookie ?? '').split(';')) {
      const [key, ...rest] = part.trim().split('=');
      if (key === name) return decodeURIComponent(rest.join('='));
   }

   return null;
}

const cookieOptions = {
   httpOnly: true,
   sameSite: 'lax' as const,
   secure: env.COOKIE_SECURE,
   path: '/',
};

export async function startSession(res: Response, tag: string) {
   const value = randomBytes(32).toString('base64url');
   const expiresAt = new Date(Date.now() + MAX_AGE_DAYS * 24 * 60 * 60 * 1000);

   await Session.create({ hash: hash(value), tag, expiresAt });
   res.cookie(COOKIE, value, { ...cookieOptions, expires: expiresAt });
}

export async function endSession(req: Request, res: Response) {
   const value = readCookie(req, COOKIE);

   if (value) await Session.deleteOne({ hash: hash(value) });
   res.clearCookie(COOKIE, cookieOptions);
}

/** The tag of the signed-in player, or null. */
export async function currentTag(req: Request): Promise<string | null> {
   const value = readCookie(req, COOKIE);

   if (!value) return null;

   const session = await Session.findOne({ hash: hash(value), expiresAt: { $gt: new Date() } }).lean();
   return session?.tag ?? null;
}

export async function requireTag(req: Request): Promise<string> {
   const tag = await currentTag(req);

   if (!tag) throw new HttpError(401, 'login_required', 'Log in with your player tag and API token first.');
   return tag;
}
