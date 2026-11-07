/*
 * "Clash Royale rejected the player's API key", usually because the IP Deckr reaches it from changed (Railway's
 * Hobby plan has no fixed outbound IP). Any request can report it (lib/api.ts); the key-issue banner offers the fix.
 * No React here, so lib/api.ts stays loadable by `node --test`.
 */

export interface KeyIssue {
   /** The IP the key must allow now, as the server reported it with the error. */
   ip: string | null;
}

let issue: KeyIssue | null = null;
const listeners = new Set<() => void>();

function set(next: KeyIssue | null) {
   issue = next;
   for (const listener of listeners) listener();
}

export const reportKeyRejected = (ip: string | null) => set({ ip });
export const clearKeyIssue = () => {
   if (issue) set(null);
};
export const getKeyIssue = () => issue;

export function subscribeKeyIssue(listener: () => void) {
   listeners.add(listener);
   return () => {
      listeners.delete(listener);
   };
}
