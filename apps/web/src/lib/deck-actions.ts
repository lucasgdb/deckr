import { buildAppLink, buildDeckLink, EMPTY_CARD, getCard } from '@deckr/shared';
import { useSyncExternalStore } from 'react';
import { toast } from '@/components/ui/toast';
import type { Dictionary } from '@/i18n';
import { useMediaQuery } from './use-media-query';

export function shuffled<T>(items: readonly T[]): T[] {
   const copy = [...items];

   for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
   }

   return copy;
}

/** "Hog Rider, Musketeer and 6 more" — how a deck is named in lists and dialogs. */
export function describeDeck(deck: readonly number[], t: Dictionary): string {
   const names = deck.filter((card) => card !== EMPTY_CARD).map((card) => getCard(card).name);

   return names.length === 0 ? t.deck.empty : t.deck.describe(names);
}

export async function copyDeckLink(deck: readonly number[], t: Dictionary) {
   try {
      await navigator.clipboard.writeText(buildDeckLink(deck));
      toast.success(t.deck.linkCopied);
   } catch {
      toast.error(t.deck.copyFailed);
   }
}

const noSubscription = () => () => {};

/**
 * Whether the browser has a native share sheet (Web Share API): `unknown` on the server and in the first render
 * before hydration, then `yes` or `no`. Showing the share button while it's `unknown` keeps it in place where
 * sharing works; it only goes away in browsers without it.
 */
export function useShareSupport(): 'unknown' | 'yes' | 'no' {
   return useSyncExternalStore(
      noSubscription,
      () => (typeof navigator.share === 'function' ? 'yes' : 'no'),
      () => 'unknown',
   );
}

/** Opens the system share sheet (phone or desktop) with the deck's link. */
export async function shareDeck(deck: readonly number[], t: Dictionary) {
   const data: ShareData = {
      title: t.deck.shareTitle,
      text: t.deck.shareText(describeDeck(deck, t)),
      url: buildDeckLink(deck),
   };

   try {
      await navigator.share(data);
   } catch (error) {
      // Closing the share sheet without picking an app is not an error.
      if (error instanceof DOMException && error.name === 'AbortError') return;
      toast.error(t.deck.shareFailed);
   }
}

/**
 * Where "Open in Clash Royale" points: the app's own deep link on phones and tablets,
 * the web link (which offers to open the game) on wider screens.
 */
export function useOpenDeckHref(deck: readonly number[]) {
   const handheld = useMediaQuery('(max-width: 992px)');

   return handheld ? { href: buildAppLink(deck), external: false } : { href: buildDeckLink(deck), external: true };
}

/** `deck=26000000;…` — how a deck travels to the builder in the URL. */
export function deckQuery(deck: readonly number[]): string {
   return `deck=${deck.map((card) => getCard(card).code || '0').join(';')}`;
}
