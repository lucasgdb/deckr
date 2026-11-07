/*
 * What this browser has stored, known before the first paint.
 *
 * Pages are prerendered, so the server renders what a first-time visitor sees: every card in the pool, an empty
 * deck, nobody signed in. A visitor with a stored pool, a draft deck or an open session would see that first and
 * then watch it change. To avoid that, an inline script (`prepaintScript`, in the layout's <head>) marks <html>
 * with what's stored, and CSS picks, for each value that depends on it, either the server's version (nothing
 * stored: it's already correct, and shows immediately) or a placeholder until the real value is known.
 * See `<Prepaint>`. A plain module (no 'use client'), so the server layout can use it.
 */

export type PrepaintFlag = 'pool' | 'draft' | 'decks' | 'session';

export const SIGNED_IN_KEY = 'deckr.signedIn';

/**
 * Sets `data-stored-pool` (a pool that isn't every card), `data-stored-draft` (a draft with cards in it),
 * `data-stored-decks` (saved decks in this browser) and `data-signed-in` (a session was open last time). Keys and
 * shapes match lib/card-pool.ts, lib/deck-editor.ts, lib/saved-decks.ts and `rememberSignedIn`.
 */
export const prepaintScript = `try{var h=document.documentElement,s=localStorage,p=JSON.parse(s.getItem('cards')||'null'),d=JSON.parse(s.getItem('deckr.draft')||'null');if(Array.isArray(p)&&p.slice(1).some(function(x){return x!==true}))h.setAttribute('data-stored-pool','');if(d&&Array.isArray(d.cards)&&d.cards.some(function(c){return c}))h.setAttribute('data-stored-draft','');var v=JSON.parse(s.getItem('deckr.savedDecks')||'null');if(v&&Array.isArray(v.decks)&&v.decks.length)h.setAttribute('data-stored-decks','');if(s.getItem(${JSON.stringify(SIGNED_IN_KEY)}))h.setAttribute('data-signed-in','')}catch(e){}`;

/** Keeps the session flag for the next visit, and for this page. */
export function rememberSignedIn(signedIn: boolean) {
   try {
      if (signedIn) localStorage.setItem(SIGNED_IN_KEY, '1');
      else localStorage.removeItem(SIGNED_IN_KEY);
   } catch {
      // Storage unavailable: placeholders just won't predict the session.
   }

   document.documentElement.toggleAttribute('data-signed-in', signedIn);
}
