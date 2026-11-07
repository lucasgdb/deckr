'use client';

import type { SavedDeck, SavedDeckInput, SyncDecksInput } from '@deckr/shared';
import { useEffect, useSyncExternalStore } from 'react';
import { request } from './api';
import { useSession } from './session';

/*
 * Saved decks live in two places:
 * - logged out: only in this browser (localStorage);
 * - logged in: on the server under the player's account, mirrored into this browser so they're still there
 *   after logging out.
 * Logging in (or coming back logged in) syncs once: decks saved while logged out are added to the account,
 * decks removed while logged out are removed from it, and the browser's copy becomes the account's list.
 */

const STORAGE_KEY = 'deckr.savedDecks';

/** A deck in this browser. `owner` is the account it mirrors, or null for a deck saved without logging in. */
interface LocalDeck extends SavedDeck {
   owner: string | null;
}

interface LocalStore {
   decks: LocalDeck[];
   /** Account decks removed while logged out, to remove from that account at the next sync. */
   deleted: { id: string; owner: string }[];
}

export type SavedDecksState =
   | { status: 'loading' }
   | { status: 'error'; error: unknown }
   | { status: 'ready'; decks: SavedDeck[]; account: string | null };

function readLocal(): LocalStore {
   try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Partial<LocalStore>) : null;
      return { decks: parsed?.decks ?? [], deleted: parsed?.deleted ?? [] };
   } catch {
      return { decks: [], deleted: [] };
   }
}

function writeLocal(store: LocalStore) {
   try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
   } catch {
      // Storage unavailable: decks still show for this visit.
   }
}

const newestFirst = (decks: readonly SavedDeck[]) => decks.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));
const toView = (decks: readonly LocalDeck[]): SavedDeck[] =>
   newestFirst(decks.map(({ id, cards, createdAt }) => ({ id, cards, createdAt })));

/** A url-safe random id; works without a secure context, unlike crypto.randomUUID. */
function newDeckId(): string {
   const bytes = crypto.getRandomValues(new Uint8Array(16));
   return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
}

let state: SavedDecksState = { status: 'loading' };
/** The account the current state belongs to (null when logged out); undefined until the session is known. */
let account: string | null | undefined;
const listeners = new Set<() => void>();

function set(next: SavedDecksState) {
   state = next;
   for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
   listeners.add(listener);
   return () => listeners.delete(listener);
}

/** Shows the browser's decks, or syncs them with the account, whenever who's logged in changes. */
async function enter(next: string | null) {
   if (account === next && state.status !== 'error') return;
   account = next;

   const local = readLocal();

   if (next === null) {
      set({ status: 'ready', decks: toView(local.decks), account: null });
      return;
   }

   set({ status: 'loading' });

   // Only decks saved without an account, or already this account's, go up. Another account's mirror never does.
   const body: SyncDecksInput = {
      decks: local.decks
         .filter((deck) => deck.owner === null || deck.owner === next)
         .map(({ id, cards, createdAt }) => ({ id, cards, createdAt })),
      deleted: local.deleted.filter((entry) => entry.owner === next).map((entry) => entry.id),
   };

   try {
      const decks = await request<SavedDeck[]>('/decks/sync', { method: 'POST', body: JSON.stringify(body) });

      if (account !== next) return; // The session changed while syncing.

      // The browser now mirrors this account. Decks saved without an account are part of it now.
      writeLocal({ decks: decks.map((deck) => ({ ...deck, owner: next })), deleted: [] });
      set({ status: 'ready', decks: newestFirst(decks), account: next });
   } catch (error) {
      if (account !== next) return;
      set({ status: 'error', error });
   }
}

export function retrySavedDecks() {
   if (account !== undefined) enter(account);
}

/** Keeps saved decks in step with the session. Mount once (the layout does). */
export function SavedDecksSync() {
   const session = useSession();

   useEffect(() => {
      if (session.status === 'loading') return;
      enter(session.status === 'signed-in' ? session.player.tag : null);
   }, [session]);

   return null;
}

export function useSavedDecks(): SavedDecksState {
   return useSyncExternalStore(
      subscribe,
      () => state,
      () => state,
   );
}

/** Saves a deck to the account when logged in, otherwise to this browser. */
export async function saveDeck(cards: readonly number[]): Promise<SavedDeck> {
   const deck: SavedDeckInput & { createdAt: string } = {
      id: newDeckId(),
      cards: [...cards],
      createdAt: new Date().toISOString(),
   };
   const owner = account ?? null;
   const saved =
      owner === null ? deck : await request<SavedDeck>('/decks', { method: 'POST', body: JSON.stringify(deck) });

   const local = readLocal();
   writeLocal({ ...local, decks: [{ ...saved, owner }, ...local.decks] });

   if (state.status === 'ready') set({ ...state, decks: newestFirst([saved, ...state.decks]) });
   return saved;
}

/** Removes a deck from the account when logged in; otherwise from this browser, and later from the account it came from. */
export async function removeDeck(id: string): Promise<void> {
   const owner = account ?? null;

   if (owner !== null) await request<void>(`/decks/${encodeURIComponent(id)}`, { method: 'DELETE' });

   const local = readLocal();
   const removed = local.decks.find((deck) => deck.id === id);
   const deleted = owner === null && removed?.owner ? [...local.deleted, { id, owner: removed.owner }] : local.deleted;

   writeLocal({ decks: local.decks.filter((deck) => deck.id !== id), deleted });

   if (state.status === 'ready') set({ ...state, decks: state.decks.filter((deck) => deck.id !== id) });
}
